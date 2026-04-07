import type {
    ERPSnapshot,
    PhysicalCountSession,
    MovementData,
    ReconciliationResult,
    ReconciliationVariance,
    CountEntry
} from '../types';
import { SKU_CONFIG } from './skuConfig';

// Quantity-based thresholds (no financial values)
function getVarianceStatus(variance: number): 'match' | 'minor' | 'critical' {
    const absVariance = Math.abs(variance);
    if (absVariance === 0) return 'match';
    if (absVariance <= 5) return 'minor';
    return 'critical';
}

// Map a (size, brand, category) to its standard ERP SKU if possible
function getSkuForEntry(entry: CountEntry): string | null {
    if (entry.category === 'empties') {
        return SKU_CONFIG.depositSkus[entry.size as keyof typeof SKU_CONFIG.depositSkus] || null;
    } else {
        // It's a full cylinder. Map to content SKU based on size and brand.
        let mappedBrand: 'Oryx' | 'Multibrand' = 'Multibrand';
        if (entry.brand.toLowerCase() === 'oryx') mappedBrand = 'Oryx';

        // Find matching SKU in mapping
        for (const [sku, brand] of Object.entries(SKU_CONFIG.contentSkuToBrand)) {
            if (brand === mappedBrand && SKU_CONFIG.contentSkuToSize[sku] === entry.size) {
                return sku;
            }
        }
    }
    return null;
}

// Aggregate physical counts into a flat map by SKU
function aggregateCountsBySku(session: PhysicalCountSession | undefined): Record<string, number> {
    const skuCounts: Record<string, number> = {};
    if (!session) return skuCounts;

    for (const zone of session.zones) {
        for (const entry of zone.entries) {
            const sku = getSkuForEntry(entry);
            if (sku) {
                // Tally the item itself
                skuCounts[sku] = (skuCounts[sku] || 0) + entry.quantity;

                // SPECIAL RULE: For every Full cylinder counted, we must also
                // increment the deposit (shell) count by the same amount,
                // because all shells are tracked as .1 on the ERP regardless of content.
                if (entry.category === 'fulls') {
                    const depositSku = SKU_CONFIG.depositSkus[entry.size as keyof typeof SKU_CONFIG.depositSkus];
                    if (depositSku) {
                        skuCounts[depositSku] = (skuCounts[depositSku] || 0) + entry.quantity;
                    }
                }
            }
        }
    }
    return skuCounts;
}

// Get the net movement for a specific SKU from movement data
function getSystemMovement(sku: string, movement: MovementData | undefined): number {
    if (!movement) return 0;

    return movement.movements
        .filter(m => m.sku === sku)
        .reduce((net, m) => {
            // Assuming GRV (Goods Receiving) and Credit Notes add stock back, Invoices remove
            if (m.transactionType === 'Invoice') return net - m.quantity;
            if (m.transactionType === 'GRV' || m.transactionType === 'Credit Note') return net + m.quantity;
            return net;
        }, 0);
}

// Get system SOH for a SKU from ERP snapshot
function getSystemSoh(sku: string, erp: ERPSnapshot | undefined): number {
    if (!erp) return 0;
    const item = erp.data.find(d => d.sku === sku);
    return item ? item.quantity : 0;
}

export function runReconciliation(
    pmErp: ERPSnapshot,
    pmPhysical: PhysicalCountSession,
    amPhysical?: PhysicalCountSession,
    movement?: MovementData
): ReconciliationResult {

    const amAggregated = aggregateCountsBySku(amPhysical);
    const pmAggregated = aggregateCountsBySku(pmPhysical);

    const depositVariances: ReconciliationVariance[] = [];
    const contentVariances: ReconciliationVariance[] = [];

    let totalDepositVariance = 0;
    let totalContentVariance = 0;
    let criticalCount = 0;
    let minorCount = 0;

    // Process all SKUs that appear in the ERP data or we counted physically
    const allSkus = new Set<string>();
    pmErp.data.forEach(d => allSkus.add(d.sku));
    Object.keys(pmAggregated).forEach(sku => allSkus.add(sku));

    for (const sku of allSkus) {
        const isDeposit = (Object.values(SKU_CONFIG.depositSkus) as string[]).includes(sku);
        const isContent = !!SKU_CONFIG.contentSkuToSize[sku];

        if (!isDeposit && !isContent) continue; // Skip unknown SKUs

        const description = pmErp.data.find(d => d.sku === sku)?.description || `Unknown SKU (${sku})`;
        const systemSOH = getSystemSoh(sku, pmErp);

        // Physical Totals
        const morningPhysical = amAggregated[sku] || 0;
        const afternoonPhysical = pmAggregated[sku] || 0;

        // Movement Math
        // If movement data exists, expected = AM Physical + Net Movement. Else, default expected to system SOH (which ignores AM count logic)
        const systemMovement = movement ? getSystemMovement(sku, movement) : 0;
        const hasMovementData = !!movement;

        // TIER 1 SOH Variance: "What we actually have vs what the system thinks we have."
        const sohVariance = afternoonPhysical - systemSOH;

        // TIER 2 Movement Variance: "What we should have based on movement vs what we actually have."
        const expectedAfternoon = (hasMovementData && amPhysical)
            ? morningPhysical + systemMovement
            : systemSOH;

        const movementVariance = afternoonPhysical - expectedAfternoon;

        // TIER 3 Timeline/Physical Variance: "Did the physical net change match the recorded system movement?"
        const physicalChange = afternoonPhysical - morningPhysical;
        const timelineVariance = (hasMovementData && amPhysical)
            ? physicalChange - systemMovement
            : 0;

        // Best variance signal for status tagging (quantity only — no financial values)
        const impactVariance = (hasMovementData && amPhysical) ? movementVariance : sohVariance;

        const status = getVarianceStatus(impactVariance);
        if (status === 'critical') criticalCount++;
        if (status === 'minor') minorCount++;

        const varianceRecord: ReconciliationVariance = {
            sku,
            description,
            systemSOH,
            morningPhysical,
            afternoonPhysical,
            systemMovement,
            expectedAfternoon,
            sohVariance,
            movementVariance,
            timelineVariance,
            status
        };

        if (isDeposit) {
            depositVariances.push(varianceRecord);
            totalDepositVariance += impactVariance;
        } else {
            contentVariances.push(varianceRecord);
            totalContentVariance += impactVariance;
        }
    }

    // Sort them logically (by SKU size/numbering ideally)
    depositVariances.sort((a, b) => a.sku.localeCompare(b.sku));
    contentVariances.sort((a, b) => a.sku.localeCompare(b.sku));

    return {
        depositReconciliation: depositVariances,
        contentReconciliation: contentVariances,
        totalDepositVariance,
        totalContentVariance,
        criticalCount,
        minorCount
    };
}
