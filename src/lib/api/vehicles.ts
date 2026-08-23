// Orders-Module migration, Phase 4 Step 1.
// Direct Supabase client calls, not Edge Functions — see Phase 4 Step 1 report
// for why: this is plain CRUD against a table with no privileged/service-role
// logic, matching the existing precedent in this codebase (useDispatchInvoices.ts,
// useAllocationEngine.ts, etc. all query Supabase tables directly from hooks).
import { supabase } from '@/lib/supabase'

export interface Vehicle {
    id: number
    registration: string
    make: string | null
    model: string | null
    capacity: number | null
    active: boolean
    notes: string | null
    createdAt: string
}

interface VehicleRow {
    id: number
    registration: string
    make: string | null
    model: string | null
    capacity: number | null
    active: boolean
    notes: string | null
    created_at: string
}

function fromRow(row: VehicleRow): Vehicle {
    return {
        id: row.id,
        registration: row.registration,
        make: row.make,
        model: row.model,
        capacity: row.capacity,
        active: row.active,
        notes: row.notes,
        createdAt: row.created_at,
    }
}

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export async function listVehicles(): Promise<Vehicle[]> {
    const { data, error } = await requireClient()
        .from('vehicles')
        .select('*')
        .order('id', { ascending: true })

    if (error) throw error
    return (data as VehicleRow[]).map(fromRow)
}

export interface VehicleInput {
    registration: string
    make?: string | null
    model?: string | null
    capacity?: number | null
    notes?: string | null
    active?: boolean
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
    const { data, error } = await requireClient()
        .from('vehicles')
        .insert({
            registration: input.registration,
            make: input.make || null,
            model: input.model || null,
            capacity: input.capacity ?? null,
            notes: input.notes || null,
            active: input.active ?? true,
        })
        .select('*')
        .single()

    if (error) throw error
    return fromRow(data as VehicleRow)
}

export async function updateVehicle(id: number, input: VehicleInput): Promise<Vehicle> {
    const { data, error } = await requireClient()
        .from('vehicles')
        .update({
            registration: input.registration,
            make: input.make || null,
            model: input.model || null,
            capacity: input.capacity ?? null,
            notes: input.notes || null,
            active: input.active ?? true,
        })
        .eq('id', id)
        .select('*')
        .single()

    if (error) throw error
    return fromRow(data as VehicleRow)
}
