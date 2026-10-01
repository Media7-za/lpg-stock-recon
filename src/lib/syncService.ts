/**
 * syncService.ts
 *
 * Handles bidirectional sync between the local Dexie (IndexedDB) store
 * and the Supabase PostgreSQL cloud database.
 */

import { db } from './db';
import { supabase, isCloudEnabled } from './supabase';
import { ERPImportEngine } from './erpImportEngine';
import type { ProcessedTransactionHeader, ProcessedTransactionItem } from './erpImportEngine';

// Maximum retries before marking a sync attempt as failed
const MAX_RETRIES = 3;
const BATCH_SIZE = 100; // Further reduced to 100 for maximum reliability

export interface SyncProgress {
    total: number;
    synced: number;
    errors: string[];
    hints: string[];
}

/**
 * NEW: Logic for the Data Agent Hub (ERP-to-Cloud sync)
 */
export class SyncService {
    /**
     * Check which fingerprints already exist in Supabase
     */
    private static async filterNewRecords<T extends { fingerprint: string }>(
        table: string,
        records: T[],
        signal?: AbortSignal
    ): Promise<T[]> {
        if (!supabase) return records;
        
        const existingFingerprints = new Set<string>();
        const fingerprints = records.map(r => r.fingerprint);
        
        // Maintain safe URL lengths (~6.4KB) by chunking 100 hashes at a time
        const ANALYZE_BATCH = 100;
        const batches = [];
        
        for (let i = 0; i < fingerprints.length; i += ANALYZE_BATCH) {
            batches.push(fingerprints.slice(i, i + ANALYZE_BATCH));
        }

        // Process batches in parallel chunks of 5 to speed up the analysis drastically
        const CONCURRENCY = 5;
        let completed = 0;

        for (let i = 0; i < batches.length; i += CONCURRENCY) {
            if (signal?.aborted) return [];

            const currentBatches = batches.slice(i, i + CONCURRENCY);
            const promises = currentBatches.map(async (batch) => {
                const { data, error } = await supabase!
                    .from(table)
                    .select('fingerprint')
                    .in('fingerprint', batch);
                
                if (data) {
                    data.forEach(d => existingFingerprints.add(d.fingerprint));
                }
                if (error) {
                    console.error(`[SyncService] Filter query error:`, error);
                }
            });

            await Promise.all(promises);
            completed += currentBatches.length;
            console.log(`[SyncService] Analyzing ${table} batch ${completed}/${batches.length}...`);
        }

        return records.filter(r => !existingFingerprints.has(r.fingerprint));
    }

    /**
     * Upsert a batch of Headers to transaction_headers
     */
    static async syncHeaders(
        headers: ProcessedTransactionHeader[], 
        onProgress?: (p: SyncProgress) => void,
        signal?: AbortSignal
    ): Promise<void> {
        if (!supabase) throw new Error("Supabase client not initialized");

        // Step 1: Delta Analysis
        if (onProgress) onProgress({ total: headers.length, synced: 0, errors: [], hints: ["Step 1/2: Analyzing cloud for existing records..."] });
        const newHeadersRaw = await this.filterNewRecords('transaction_headers', headers, signal);
        
        if (signal?.aborted) return;

        // Step 1.5: Local Deduplication (Prevents "ON CONFLICT" batch errors)
        const newHeaders = Array.from(
            new Map(newHeadersRaw.map(h => [h.fingerprint, h])).values()
        );

        const skipped = headers.length - newHeaders.length;
        const progress: SyncProgress = { total: 0, synced: 0, errors: [], hints: [] };
        if (skipped > 0) progress.hints.push(`${skipped} existing or duplicate records skipped.`);

        // Step 1.6: Financial Control Layer (DK-593) — run integrity checks on every
        // header before it is accepted, and reject (never insert) any row that comes
        // back CRITICAL. Findings are surfaced via progress.errors so the operator
        // sees exactly which documents were rejected and why.
        const integrityEngine = new ERPImportEngine();
        const acceptedHeaders: ProcessedTransactionHeader[] = [];
        for (const header of newHeaders) {
            const findings = integrityEngine.validateIntegrity(header);
            const critical = findings.filter(f => f.severity === 'CRITICAL');
            if (critical.length > 0) {
                critical.forEach(f => progress.errors.push(`Rejected doc ${f.id} (${f.rule}): ${f.message}`));
            } else {
                acceptedHeaders.push(header);
            }
        }

        progress.total = acceptedHeaders.length;

        if (acceptedHeaders.length === 0) {
            if (onProgress) onProgress({ ...progress, synced: 0 });
            return;
        }

        // Step 2: Upload Delta
        for (let i = 0; i < acceptedHeaders.length; i += BATCH_SIZE) {
            if (signal?.aborted) break;

            const batch = acceptedHeaders.slice(i, i + BATCH_SIZE);
            let success = false;
            let retries = 0;

            while (!success && retries < MAX_RETRIES) {
                if (signal?.aborted) break;

                const { error } = await supabase
                    .from('transaction_headers')
                    .upsert(batch, { onConflict: 'fingerprint' });

                if (error) {
                    console.error(`[SyncService] Header batch error (Attempt ${retries + 1}):`, error);
                    retries++;
                    if (retries < MAX_RETRIES) await delay(1000 * retries);
                    else progress.errors.push(`Batch error: ${error.message}`);
                } else {
                    progress.synced += batch.length;
                    success = true;
                }
            }
            
            if (onProgress) onProgress({ ...progress });
            await delay(200);
        }

        // Step 3: Log to History
        if (!signal?.aborted && progress.errors.length === 0) {
            const fileName = headers.length > 0 ? headers[0].source_file : 'Unknown';
            await supabase.from('sync_logs').insert({
                filename: fileName,
                file_type: 'HEADERS',
                records_synced: acceptedHeaders.length
            });
        }
    }

    /**
     * Upsert a batch of Items to transaction_items
     */
    static async syncItems(
        items: ProcessedTransactionItem[], 
        onProgress?: (p: SyncProgress) => void,
        signal?: AbortSignal
    ): Promise<void> {
        if (!supabase) throw new Error("Supabase client not initialized");

        // Step 1: Delta Analysis
        if (onProgress) onProgress({ total: items.length, synced: 0, errors: [], hints: ["Step 1/2: Analyzing cloud for existing records..."] });
        const newItemsRaw = await this.filterNewRecords('transaction_items', items, signal);
        
        if (signal?.aborted) return;

        // Step 1.5: Local Deduplication (Prevents "ON CONFLICT" batch errors)
        const newItems = Array.from(
            new Map(newItemsRaw.map(i => [i.fingerprint, i])).values()
        );

        const skipped = items.length - newItems.length;
        const progress: SyncProgress = { total: newItems.length, synced: 0, errors: [], hints: [] };
        if (skipped > 0) progress.hints.push(`${skipped} existing or duplicate records skipped.`);

        if (newItems.length === 0) {
            if (onProgress) onProgress({ ...progress, synced: 0 });
            return;
        }

        // Step 2: Upload Delta
        for (let i = 0; i < newItems.length; i += BATCH_SIZE) {
            if (signal?.aborted) break;

            const batch = newItems.slice(i, i + BATCH_SIZE);
            let success = false;
            let retries = 0;

            while (!success && retries < MAX_RETRIES) {
                if (signal?.aborted) break;

                const { error } = await supabase
                    .from('transaction_items')
                    .upsert(batch, { onConflict: 'fingerprint' });

                if (error) {
                    console.error(`[SyncService] Item batch error (Attempt ${retries + 1}):`, error);
                    retries++;
                    if (retries < MAX_RETRIES) await delay(1000 * retries);
                    else progress.errors.push(`Batch error: ${error.message}`);
                } else {
                    progress.synced += batch.length;
                    success = true;
                }
            }
            
            if (onProgress) onProgress({ ...progress });
            await delay(200);
        }

        // Step 3: Log to History
        if (!signal?.aborted && progress.errors.length === 0) {
            const fileName = items.length > 0 ? items[0].source_file : 'Unknown';
            await supabase.from('sync_logs').insert({
                filename: fileName,
                file_type: 'ITEMS',
                records_synced: newItems.length
            });
        }
    }
}

/**
 * EXISTING: Logic for the Mobile App (Offline-First sync)
 */

async function syncCountSession(sessionId: string, attempt = 1): Promise<boolean> {
    if (!isCloudEnabled || !supabase) return false;

    const session = await db.physicalCounts.get(sessionId);
    if (!session) return false;
    if (session.syncedAt) return true;

    try {
        const { error } = await supabase.from('physical_count_sessions').upsert({
            id: session.id,
            timestamp: session.timestamp,
            session_type: session.sessionType,
            status: session.status,
            zones: session.zones,
            counter_name: session.counterName ?? null,
            notes: session.notes ?? null,
            synced_at: new Date().toISOString(),
        });

        if (error) throw error;
        await db.physicalCounts.update(sessionId, { syncedAt: new Date() });
        return true;
    } catch (err) {
        if (attempt < MAX_RETRIES) {
            await delay(1000 * attempt);
            return syncCountSession(sessionId, attempt + 1);
        }
        return false;
    }
}

async function syncErpSnapshot(snapshotId: string): Promise<boolean> {
    if (!isCloudEnabled || !supabase) return false;
    const snapshot = await db.erpSnapshots.get(snapshotId);
    if (!snapshot) return false;
    try {
        const { error } = await supabase.from('erp_snapshots').upsert({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            export_time: snapshot.exportTime,
            snapshot_type: snapshot.snapshotType,
            data: snapshot.data,
        });
        if (error) throw error;
        return true;
    } catch (err) {
        return false;
    }
}

async function syncMovementData(movementId: string): Promise<boolean> {
    if (!isCloudEnabled || !supabase) return false;
    const movement = await db.movementData.get(movementId);
    if (!movement) return false;
    try {
        const { error } = await supabase.from('movement_data').upsert({
            id: movement.id,
            timestamp: movement.timestamp,
            period: movement.period,
            movements: movement.movements,
            synced_at: new Date().toISOString(),
        });
        if (error) throw error;
        return true;
    } catch (err) {
        return false;
    }
}

export async function syncAllPending(): Promise<void> {
    if (!isCloudEnabled) return;
    const [allSessions, allSnapshots, allMovements] = await Promise.all([
        db.physicalCounts.toArray(),
        db.erpSnapshots.toArray(),
        db.movementData.toArray(),
    ]);

    const unsyncedSessions = allSessions.filter(s => s.status === 'completed' && !s.syncedAt);

    await Promise.all([
        ...unsyncedSessions.map(s => syncCountSession(s.id)),
        ...allSnapshots.map(s => syncErpSnapshot(s.id)),
        ...allMovements.map(m => syncMovementData(m.id)),
    ]);
}

export function registerSyncListener(): void {
    if (!isCloudEnabled) return;
    window.addEventListener('online', () => syncAllPending());
    if (navigator.onLine) syncAllPending();
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
