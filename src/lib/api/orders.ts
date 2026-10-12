// Orders-Module migration, Phase 4 Step 3.
// Reads: direct Supabase client calls (simple, no atomicity concern).
// Writes: the `upsert-order` Edge Function (see supabase/functions/upsert-order),
// because create/update touch orders + order_items + order_events together
// and need real atomicity — see the Step 3 report for why this is an Edge
// Function rather than a direct client call, per the confirmed architecture
// rule (D-040: atomic multi-table transactions).
//
// IMPORTANT: the upsert-order function has been deployed to oqhpxnaadahohwkslive
// but could NOT be test-invoked from this environment (outbound network policy
// blocks direct calls to *.supabase.co from this sandbox — confirmed via the
// proxy status endpoint, not a bug). It depends on a DATABASE_URL secret being
// configured in the Edge Functions runtime, which none of this project's other
// 7 existing functions currently use — there is no positive evidence that
// secret exists yet. Test this function for real (e.g. `supabase functions
// invoke upsert-order`, or just try creating an order in the running app)
// before relying on it.
import { supabase } from '@/lib/supabase'

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export interface OrderItem {
    id: number
    productId: string
    quantityOrdered: number
    quantityRemaining: number
    notes: string | null
    product: {
        id: string
        code: string
        name: string
        totalWeight: number | null
    } | null
}

export interface Order {
    id: number
    orderNumber: string
    customerId: string
    orderDate: string
    orderType: string
    status: string
    requestedDeliveryDate: string | null
    priority: string
    specialInstructions: string | null
    createdAt: string
    updatedAt: string
    orderItems: OrderItem[]
    customer: {
        id: string
        name: string
        address: string | null
        area: { id: number; name: string; routeId: number; route: { id: number; name: string } | null } | null
    } | null
}

interface OrderItemRow {
    id: number
    product_id: string
    quantity_ordered: number
    quantity_remaining: number
    notes: string | null
    products: { id: string; stockno: string; description: string; total_weight: number | null } | null
}

interface OrderRow {
    id: number
    order_number: string
    customer_id: string
    order_date: string
    order_type: string
    status: string
    requested_delivery_date: string | null
    priority: string
    special_instructions: string | null
    created_at: string
    updated_at: string
    order_items: OrderItemRow[]
    commercial_customers: {
        id: string
        customer_name: string
        address: string | null
        areas: { id: number; name: string; route_id: number; routes: { id: number; name: string } | null } | null
    } | null
}

function fromRow(row: OrderRow): Order {
    return {
        id: row.id,
        orderNumber: row.order_number,
        customerId: row.customer_id,
        orderDate: row.order_date,
        orderType: row.order_type,
        status: row.status,
        requestedDeliveryDate: row.requested_delivery_date,
        priority: row.priority,
        specialInstructions: row.special_instructions,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        orderItems: (row.order_items ?? []).map((oi) => ({
            id: oi.id,
            productId: oi.product_id,
            quantityOrdered: oi.quantity_ordered,
            quantityRemaining: oi.quantity_remaining,
            notes: oi.notes,
            product: oi.products ? {
                id: oi.products.id,
                code: oi.products.stockno,
                name: oi.products.description,
                totalWeight: oi.products.total_weight,
            } : null,
        })),
        customer: row.commercial_customers ? {
            id: row.commercial_customers.id,
            name: row.commercial_customers.customer_name,
            address: row.commercial_customers.address,
            area: row.commercial_customers.areas ? {
                id: row.commercial_customers.areas.id,
                name: row.commercial_customers.areas.name,
                routeId: row.commercial_customers.areas.route_id,
                route: row.commercial_customers.areas.routes ? {
                    id: row.commercial_customers.areas.routes.id,
                    name: row.commercial_customers.areas.routes.name,
                } : null,
            } : null,
        } : null,
    }
}

const SELECT_WITH_RELATIONS = `
    id, order_number, customer_id, order_date, order_type, status, requested_delivery_date,
    priority, special_instructions, created_at, updated_at,
    order_items(id, product_id, quantity_ordered, quantity_remaining, notes,
        products(id, stockno, description, total_weight)),
    commercial_customers(id, customer_name, address,
        areas(id, name, route_id, routes(id, name)))
`

export async function getOrder(id: number): Promise<Order> {
    const { data, error } = await requireClient()
        .from('orders')
        .select(SELECT_WITH_RELATIONS)
        .eq('id', id)
        .single()

    if (error) throw error
    return fromRow(data as unknown as OrderRow)
}

export interface OrderItemInput {
    productId: string
    quantity: number
    notes?: string | null
}

export interface CreateOrderInput {
    customerId: string
    orderType: string
    requestedDeliveryDate: string | Date | null
    priority: string
    specialInstructions?: string | null
    items: OrderItemInput[]
}

export interface UpdateOrderInput {
    orderType?: string
    requestedDeliveryDate?: string | Date | null
    priority?: string
    specialInstructions?: string | null
    status?: string
    items?: OrderItemInput[]
}

async function invokeUpsertOrder(body: Record<string, unknown>) {
    const { data, error } = await requireClient().functions.invoke('upsert-order', { body })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
}

export async function createOrder(input: CreateOrderInput) {
    return invokeUpsertOrder({
        mode: 'create',
        customerId: input.customerId,
        orderType: input.orderType,
        requestedDeliveryDate: input.requestedDeliveryDate,
        priority: input.priority,
        specialInstructions: input.specialInstructions ?? null,
        items: input.items,
    })
}

export async function updateOrder(orderId: number, input: UpdateOrderInput) {
    return invokeUpsertOrder({
        mode: 'update',
        orderId,
        orderType: input.orderType,
        requestedDeliveryDate: input.requestedDeliveryDate,
        priority: input.priority,
        specialInstructions: input.specialInstructions,
        status: input.status,
        items: input.items,
    })
}
