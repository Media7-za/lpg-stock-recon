/**
 * WEIGHT UTILITIES
 *
 * Two contexts, two calculations:
 * 1. Operational: GROSS weight (gas + tare) - for trips, vehicles, deliveries
 * 2. Customer-facing: NET weight (gas only) - for orders, invoices
 */

interface WeightItem {
    quantityToDeliver: number;
    product?: {
        weight?: number;      // gas only
        totalWeight?: number; // gas + tare
    };
}

/**
 * Calculate GROSS weight (including cylinder)
 * USE FOR: Trip planning, vehicle capacity, delivery manifests, WhatsApp messages
 */
export function calculateGrossWeight(items: WeightItem[]): number {
    return items.reduce((sum, item) =>
        sum + (item.quantityToDeliver * (item.product?.totalWeight || 0)), 0);
}

/**
 * Calculate NET weight (gas only)
 * USE FOR: Customer orders, invoices, billing
 */
export function calculateNetWeight(items: WeightItem[]): number {
    return items.reduce((sum, item) =>
        sum + (item.quantityToDeliver * (item.product?.weight || 0)), 0);
}

/**
 * Format weight display with optional tooltip hint
 */
export function formatWeight(weight: number, includeHint = false): string {
    return includeHint ? `${weight}kg (incl. cylinder)` : `${weight}kg`;
}
