// Orders-Module migration, Phase 4 Step 4. Deliberately THIN — only what
// Trip planning needs (per the Step 4 scope decision). DeliveryItem writes,
// DeliveryReturn, DeliveryProof, and the tracking/proof UI all stay in
// Step 5.
//
// KNOWN END-TO-END GAP: this is read-only. Nothing in Steps 1-4 creates a
// Delivery row when an Order is created — the original Prisma transaction
// for order creation also created a companion "unassigned" Delivery +
// DeliveryItems, and Step 3's upsert-order deliberately did NOT replicate
// that (it was explicitly out of Step 3's "form only" scope). That means
// `deliveries` has 0 rows today, so listUnassignedDeliveries() below is
// correct but will always return an empty list until something creates
// Delivery rows — either upsert-order gets extended to do it (a change to
// an already-deployed function currently being verified — not done here
// without asking), or Step 5 adds it. Flagged in the Step 4 report.
import { supabase } from '@/lib/supabase'

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export interface UnassignedDeliveryProduct {
    name: string
    quantity: number
}

export interface UnassignedDelivery {
    id: number
    orderId: number
    orderNumber: string
    customer: {
        id: string
        name: string
        address: string | null
        area: { id: number; name: string; routeId: number } | null
    } | null
    products: UnassignedDeliveryProduct[]
    totalWeight: number
}

interface DeliveryRow {
    id: number
    order_id: number
    orders: { order_number: string } | null
    commercial_customers: {
        id: string
        customer_name: string
        address: string | null
        areas: { id: number; name: string; route_id: number } | null
    } | null
    delivery_items: {
        quantity_to_deliver: number
        products: { description: string; total_weight: number | null } | null
    }[] | null
}

function fromRow(row: DeliveryRow): UnassignedDelivery {
    const totalWeight = (row.delivery_items ?? []).reduce(
        (sum, di) => sum + di.quantity_to_deliver * (di.products?.total_weight ?? 0),
        0
    )

    return {
        id: row.id,
        orderId: row.order_id,
        orderNumber: row.orders?.order_number ?? '',
        customer: row.commercial_customers ? {
            id: row.commercial_customers.id,
            name: row.commercial_customers.customer_name,
            address: row.commercial_customers.address,
            area: row.commercial_customers.areas ? {
                id: row.commercial_customers.areas.id,
                name: row.commercial_customers.areas.name,
                routeId: row.commercial_customers.areas.route_id,
            } : null,
        } : null,
        products: (row.delivery_items ?? []).map((di) => ({
            name: di.products?.description ?? 'Unknown product',
            quantity: di.quantity_to_deliver,
        })),
        totalWeight,
    }
}

export async function listUnassignedDeliveries(): Promise<UnassignedDelivery[]> {
    const { data, error } = await requireClient()
        .from('deliveries')
        .select(`
            id, order_id,
            orders(order_number),
            commercial_customers(id, customer_name, address, areas(id, name, route_id)),
            delivery_items(quantity_to_deliver, products(description, total_weight))
        `)
        .eq('status', 'unassigned')
        .order('created_at', { ascending: true })

    if (error) throw error
    return (data as unknown as DeliveryRow[]).map(fromRow)
}
