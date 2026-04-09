/**
 * syncService.ts
 *
 * Handles bidirectional sync between the local Dexie (IndexedDB) store
 * and the Supabase PostgreSQL cloud database.
 *
 * Strategy: Offline-first. Local DB is always written to first.
 * Sync is triggered automatically when the browser detects it is online.
 */

import { db } from './db';
import { isCloudEnabled } from './supabase';
import * as gateway from './toolGateway';

// Maximum retries before marking a sync attempt as failed
const MAX_RETRIES = 3;

/**
 * Attempt to sync a single completed PhysicalCountSession to Supabase.
 * The session's `syncedAt` field is set on success.
 */
async function syncCountSession(sessionId: string, attempt = 1): Promise<boolean> {
    if (!isCloudEnabled) return false;

    const session = await db.physicalCounts.get(sessionId);
    if (!session) return false;
    if (session.syncedAt) return true; // Already synced

    try {
        // 1. Ensure session exists on server
        let serverSession = await gateway.getSession(sessionId);
        if (serverSession.error && serverSession.error.code === 'SESSION_NOT_FOUND') {
            const startRes = await gateway.startCountSession(session.timestamp?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
            if (startRes.error) throw new Error(startRes.error.message);
        }

        // 2. Map local zones to flattened count payload
        const payload = session.zones.flatMap(zone => 
            zone.entries.map(entry => ({
                sku: entry.sku,
                quantity: entry.quantity,
                brand: entry.brand,
                zone: zone.name
            }))
        );

        // 3. Submit counts via gateway (idempotency handled inside gateway)
        const countsRes = await gateway.submitPhysicalCount(sessionId, payload);
        if (countsRes.error) throw new Error(countsRes.error.message);

        // Mark as synced locally
        await db.physicalCounts.update(sessionId, { syncedAt: new Date() });
        console.log(`[Sync] ✅ Session ${sessionId} synced to cloud via Domain API.`);
        return true;
    } catch (err) {
        console.error(`[Sync] ❌ Session ${sessionId} sync failed (attempt ${attempt}):`, err);
        if (attempt < MAX_RETRIES) {
            await delay(1000 * attempt);
            return syncCountSession(sessionId, attempt + 1);
        }
        return false;
    }
}

/**
 * Attempt to sync a single ERPSnapshot to Supabase.
 */
async function syncErpSnapshot(snapshotId: string): Promise<boolean> {
    if (!isCloudEnabled) return false;

    const snapshot = await db.erpSnapshots.get(snapshotId);
    if (!snapshot) return false;

    try {
        const { error } = await gateway.submitErpSnapshot(snapshot);
        if (error) throw new Error(error.message);
        console.log(`[Sync] ✅ ERP Snapshot ${snapshotId} synced.`);
        return true;
    } catch (err) {
        console.error(`[Sync] ❌ ERP Snapshot ${snapshotId} sync failed:`, err);
        return false;
    }
}

/**
 * Attempt to sync a single MovementData record to Supabase.
 */
async function syncMovementData(movementId: string): Promise<boolean> {
    if (!isCloudEnabled) return false;

    const movement = await db.movementData.get(movementId);
    if (!movement) return false;

    try {
        const { error } = await gateway.submitMovementData(movement);
        if (error) throw new Error(error.message);
        console.log(`[Sync] ✅ Movement ${movementId} synced.`);
        return true;
    } catch (err) {
        console.error(`[Sync] ❌ Movement ${movementId} sync failed:`, err);
        return false;
    }
}

/**
 * Sync all unsynced local records to Supabase.
 * Called automatically when the browser goes online.
 */
export async function syncAllPending(): Promise<void> {
    if (!isCloudEnabled) return;

    console.log('[Sync] Starting full pending sync...');

    const [allSessions, allSnapshots, allMovements] = await Promise.all([
        db.physicalCounts.toArray(),
        db.erpSnapshots.toArray(),
        db.movementData.toArray(),
    ]);

    // Only sync completed sessions that haven't been synced yet
    const unsyncedSessions = allSessions.filter(
        s => (s.status === 'completed' || s.current_state === 'OPEN' || s.current_state === 'COUNTING') && !s.syncedAt
    );

    await Promise.all([
        ...unsyncedSessions.map(s => syncCountSession(s.id)),
        ...allSnapshots.map(s => syncErpSnapshot(s.id)),
        ...allMovements.map(m => syncMovementData(m.id)),
    ]);

    console.log('[Sync] Full sync complete.');
}

/**
 * Listen for browser online/offline events and trigger auto-sync.
 * Call this once at app startup.
 */
export function registerSyncListener(): void {
    if (!isCloudEnabled) {
        console.log('[Sync] Cloud disabled — running in fully offline mode.');
        return;
    }

    window.addEventListener('online', () => {
        console.log('[Sync] Browser came online. Triggering auto-sync...');
        syncAllPending();
    });

    // Also attempt sync on startup if already online
    if (navigator.onLine) {
        syncAllPending();
    }
}

// Helper
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
