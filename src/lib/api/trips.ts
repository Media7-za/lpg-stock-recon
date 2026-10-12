// Orders-Module migration, Phase 4 Step 4.
// Reads: direct Supabase client calls. Writes (create trip + assign
// deliveries, or assign a single delivery to an existing trip): the
// `upsert-trip` Edge Function — same atomicity rationale as upsert-order
// (Step 3): creating a trip and updating multiple delivery rows +
// order_events together needs a real transaction, not a sequence of
// separate client calls.
//
// upsert-trip is WRITTEN but NOT DEPLOYED yet — held per instruction until
// upsert-order is confirmed working (fix the DATABASE_URL-secret question
// once, not twice). Calls to createTrip()/assignDeliveryToTrip() below will
// fail until it's deployed.
import { supabase } from '@/lib/supabase'
import { calculateGrossWeight } from '@/lib/weight-utils'

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export interface Trip {
    id: number
    tripNumber: string
    tripDate: string | null
    status: string
    driver: { id: number; name: string } | null
    vehicle: { id: number; registration: string; model: string | null; capacity: number | null } | null
    route: { id: number; name: string; code: string } | null
    deliveries: {
        id: number
        deliveryItems: { quantityToDeliver: number; product: { totalWeight: number | null } | null }[]
    }[]
}

interface TripRow {
    id: number
    trip_number: string
    trip_date: string | null
    status: string
    drivers: { id: number; name: string } | null
    vehicles: { id: number; registration: string; model: string | null; capacity: number | null } | null
    routes: { id: number; name: string; code: string } | null
    deliveries: {
        id: number
        delivery_items: { quantity_to_deliver: number; products: { total_weight: number | null } | null }[] | null
    }[] | null
}

function fromRow(row: TripRow): Trip {
    return {
        id: row.id,
        tripNumber: row.trip_number,
        tripDate: row.trip_date,
        status: row.status,
        driver: row.drivers,
        vehicle: row.vehicles,
        route: row.routes,
        deliveries: (row.deliveries ?? []).map((d) => ({
            id: d.id,
            deliveryItems: (d.delivery_items ?? []).map((di) => ({
                quantityToDeliver: di.quantity_to_deliver,
                product: di.products ? { totalWeight: di.products.total_weight } : null,
            })),
        })),
    }
}

const SELECT_WITH_RELATIONS = `
    id, trip_number, trip_date, status,
    drivers(id, name),
    vehicles(id, registration, model, capacity),
    routes(id, name, code),
    deliveries(id, delivery_items(quantity_to_deliver, products(total_weight)))
`

export async function listTrips(): Promise<Trip[]> {
    const { data, error } = await requireClient()
        .from('trips')
        .select(SELECT_WITH_RELATIONS)
        .order('created_at', { ascending: false })

    if (error) throw error
    return (data as unknown as TripRow[]).map(fromRow)
}

// Ported from Orders-Module's lib/actions/trips.ts getAvailableTrips —
// adapted from a Prisma query to a direct Supabase read. Capacity math
// (calculateGrossWeight) is unchanged, reusing the Phase 3 port of
// weight-utils.ts.
export interface AvailableTrip {
    id: number
    tripNumber: string
    tripDate: string | null
    status: string
    driver: { id: number; name: string } | null
    vehicle: { id: number; registration: string; model: string | null; capacity: number | null }
    route: { id: number; name: string; code: string } | null
    deliveryCount: number
    stats: {
        currentLoadKg: number
        maxCapacity: number
        fillPercentage: number
        isRecommended: boolean
        statusColor: string
    }
}

export async function getAvailableTrips(targetRouteId: number): Promise<AvailableTrip[]> {
    const { data, error } = await requireClient()
        .from('trips')
        .select(SELECT_WITH_RELATIONS)
        .in('status', ['planned', 'in-progress'])

    if (error) throw error
    const activeTrips = data as unknown as TripRow[]

    const tripsWithCapacity: AvailableTrip[] = activeTrips.map((trip) => {
        const currentLoadKg = (trip.deliveries ?? []).reduce((total, delivery) => {
            return total + calculateGrossWeight(
                (delivery.delivery_items ?? []).map((di) => ({
                    quantityToDeliver: di.quantity_to_deliver,
                    product: { totalWeight: di.products?.total_weight ?? 0 },
                }))
            )
        }, 0)

        const maxCapacity = trip.vehicles?.capacity || 1000
        const fillPercentage = Math.round((currentLoadKg / maxCapacity) * 100)

        const routeId = trip.routes?.id
        const isRouteMatch = routeId === targetRouteId
        const isRecommended = isRouteMatch && fillPercentage <= 90

        return {
            id: trip.id,
            tripNumber: trip.trip_number,
            tripDate: trip.trip_date,
            status: trip.status,
            driver: trip.drivers,
            vehicle: {
                id: trip.vehicles?.id ?? 0,
                registration: trip.vehicles?.registration ?? '',
                model: trip.vehicles?.model ?? null,
                capacity: trip.vehicles?.capacity ?? null,
            },
            route: trip.routes,
            deliveryCount: (trip.deliveries ?? []).length,
            stats: {
                currentLoadKg: Math.round(currentLoadKg),
                maxCapacity,
                fillPercentage,
                isRecommended,
                statusColor:
                    fillPercentage > 90 ? "red" :
                        fillPercentage > 70 ? "yellow" :
                            "green",
            },
        }
    })

    return tripsWithCapacity.sort((a, b) => {
        if (a.stats.isRecommended && !b.stats.isRecommended) return -1
        if (!a.stats.isRecommended && b.stats.isRecommended) return 1
        return a.stats.fillPercentage - b.stats.fillPercentage
    })
}

async function invokeUpsertTrip(body: Record<string, unknown>) {
    const { data, error } = await requireClient().functions.invoke('upsert-trip', { body })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data
}

export interface CreateTripInput {
    driverId: number
    vehicleId: number
    routeId: number
    tripDate: string | Date
    deliveryIds: number[]
}

export async function createTrip(input: CreateTripInput) {
    return invokeUpsertTrip({
        mode: 'create',
        driverId: input.driverId,
        vehicleId: input.vehicleId,
        routeId: input.routeId,
        tripDate: input.tripDate,
        deliveryIds: input.deliveryIds,
    })
}

export async function assignDeliveryToTrip(deliveryId: number, tripId: number) {
    return invokeUpsertTrip({
        mode: 'assign',
        deliveryId,
        tripId,
    })
}
