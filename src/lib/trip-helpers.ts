// Route color mapping for visual scanning
export const ROUTE_COLORS: Record<string, string> = {
    "Route North": "border-l-blue-500",
    "Route South": "border-l-emerald-500",
    "Route East": "border-l-amber-500",
    "Route West": "border-l-purple-500",
}

// Calculate total weight for a delivery
export function calculateDeliveryWeight(delivery: {
    deliveryItems?: Array<{
        product?: { totalWeight: number };
        quantityToDeliver: number
    }>
}): number {
    if (!delivery.deliveryItems) return 0
    return delivery.deliveryItems.reduce((total: number, item) => {
        const weight = item.product?.totalWeight || 0
        return total + (item.quantityToDeliver * weight)
    }, 0)
}
