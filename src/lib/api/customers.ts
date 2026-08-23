// Orders-Module migration, Phase 4 Step 2. Direct Supabase client calls —
// plain CRUD, no privileged/atomic logic (see Phase 4 Step 1 report for the
// architecture rule this follows).
//
// Field mapping vs. Orders-Module's original Customer model:
//   name -> customer_name (existing column)
//   phone -> contact_phone (existing column — NOT a new `phone` column, per
//            the Step 2 spec: "use existing contact_phone")
//   accountNumber -> commercial_customer_accounts.account_no (a related
//            table, NOT a flat column, per the Step 2 spec). Read via the
//            PostgREST embed below; written via upsertAccountNumber().
//   address/lat/lng/googleMapsUrl/areaId/active -> the columns added in the
//            Phase 2 migration (all new, all nullable).
//   notes -> notes (existing column, unchanged; NOT duplicated).
//
// NOT ported: `email`. commercial_customers has no email column — it was
// deliberately held back in the Phase 2 migration (no evidence any
// Orders-Module UI/API path actually used it). Dropped from the form rather
// than faked as client-only state, same treatment as Product.active in
// products.ts.
import { supabase } from '@/lib/supabase'

// Lightweight embedded shape for display purposes only (the customers list
// table's Area/Route columns). Distinct from — and a subset of — the fuller
// Area/Route types in ./routesAreas.ts (which CustomerSheet needs in full,
// including boundaryPolygon, for its geofence-detection dropdowns).
export interface CustomerAreaSummary {
    id: number
    name: string
    routeId: number
    route: { id: number; name: string; code: string } | null
}

export interface Customer {
    id: string
    name: string
    address: string | null
    areaId: number | null
    latitude: number | null
    longitude: number | null
    googleMapsUrl: string | null
    phone: string | null
    accountNumber: string | null
    notes: string | null
    active: boolean | null
    area: CustomerAreaSummary | null
}

interface AccountRow {
    id: string
    account_no: string
}

interface CustomerRow {
    id: string
    customer_name: string
    address: string | null
    area_id: number | null
    lat: number | null
    lng: number | null
    google_maps_url: string | null
    contact_phone: string | null
    notes: string | null
    active: boolean | null
    areas: { id: number; name: string; route_id: number; routes: { id: number; name: string; code: string } | null } | null
    commercial_customer_accounts: AccountRow[] | null
}

function fromRow(row: CustomerRow): Customer {
    return {
        id: row.id,
        name: row.customer_name,
        address: row.address,
        areaId: row.area_id,
        latitude: row.lat,
        longitude: row.lng,
        googleMapsUrl: row.google_maps_url,
        phone: row.contact_phone,
        accountNumber: row.commercial_customer_accounts?.[0]?.account_no ?? null,
        notes: row.notes,
        active: row.active,
        area: row.areas ? {
            id: row.areas.id,
            name: row.areas.name,
            routeId: row.areas.route_id,
            route: row.areas.routes ? {
                id: row.areas.routes.id,
                name: row.areas.routes.name,
                code: row.areas.routes.code,
            } : null,
        } : null,
    }
}

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

const SELECT_WITH_RELATIONS = `
    id, customer_name, address, area_id, lat, lng, google_maps_url, contact_phone, notes, active,
    areas(id, name, route_id, routes(id, name, code)),
    commercial_customer_accounts(id, account_no)
`

export async function listCustomers(): Promise<Customer[]> {
    const { data, error } = await requireClient()
        .from('commercial_customers')
        .select(SELECT_WITH_RELATIONS)
        .order('customer_name', { ascending: true })

    if (error) throw error
    return (data as unknown as CustomerRow[]).map(fromRow)
}

export interface CustomerInput {
    name: string
    address: string
    areaId: number
    latitude?: number | null
    longitude?: number | null
    googleMapsUrl?: string | null
    phone?: string | null
    accountNumber?: string | null
    notes?: string | null
    active?: boolean
}

// Account numbers live in commercial_customer_accounts, not a flat column.
// This form only ever deals with one "primary" account per customer, so:
// update the existing row if one exists, insert one if not, and leave
// existing accounts alone if the field was left blank (avoids silently
// deleting real account data through a simple form).
async function upsertAccountNumber(customerId: string, accountNumber: string | null | undefined) {
    if (!accountNumber) return
    const client = requireClient()

    const { data: existing } = await client
        .from('commercial_customer_accounts')
        .select('id')
        .eq('commercial_customer_id', customerId)
        .limit(1)
        .maybeSingle()

    if (existing) {
        const { error } = await client
            .from('commercial_customer_accounts')
            .update({ account_no: accountNumber })
            .eq('id', existing.id)
        if (error) throw error
    } else {
        const { error } = await client
            .from('commercial_customer_accounts')
            .insert({ commercial_customer_id: customerId, account_no: accountNumber })
        if (error) throw error
    }
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
    const client = requireClient()

    const { data, error } = await client
        .from('commercial_customers')
        .insert({
            customer_name: input.name,
            address: input.address,
            area_id: input.areaId,
            lat: input.latitude ?? null,
            lng: input.longitude ?? null,
            google_maps_url: input.googleMapsUrl || null,
            contact_phone: input.phone || null,
            notes: input.notes || null,
            active: input.active ?? true,
        })
        .select(SELECT_WITH_RELATIONS)
        .single()

    if (error) throw error
    const customer = fromRow(data as unknown as CustomerRow)

    await upsertAccountNumber(customer.id, input.accountNumber)
    return { ...customer, accountNumber: input.accountNumber || null }
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
    const client = requireClient()

    const { data, error } = await client
        .from('commercial_customers')
        .update({
            customer_name: input.name,
            address: input.address,
            area_id: input.areaId,
            lat: input.latitude ?? null,
            lng: input.longitude ?? null,
            google_maps_url: input.googleMapsUrl || null,
            contact_phone: input.phone || null,
            notes: input.notes || null,
            active: input.active ?? true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(SELECT_WITH_RELATIONS)
        .single()

    if (error) throw error
    const customer = fromRow(data as unknown as CustomerRow)

    await upsertAccountNumber(id, input.accountNumber)
    return { ...customer, accountNumber: input.accountNumber || customer.accountNumber }
}
