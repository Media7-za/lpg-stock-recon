// Orders-Module migration, Phase 4 Step 1. See vehicles.ts for the
// direct-Supabase-client-calls rationale.
import { supabase } from '@/lib/supabase'

export interface Driver {
    id: number
    name: string
    phone: string
    license: string | null
    active: boolean
}

interface DriverRow {
    id: number
    name: string
    phone: string
    license: string | null
    active: boolean
    pin_hash: string | null
}

function fromRow(row: DriverRow): Driver {
    return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        license: row.license,
        active: row.active,
    }
}

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export async function listDrivers(): Promise<Driver[]> {
    const { data, error } = await requireClient()
        .from('drivers')
        .select('id, name, phone, license, active, pin_hash')
        .order('id', { ascending: true })

    if (error) throw error
    return (data as DriverRow[]).map(fromRow)
}

export interface DriverInput {
    name: string
    phone: string
    license?: string | null
    active?: boolean
}

export async function createDriver(input: DriverInput): Promise<Driver> {
    const { data, error } = await requireClient()
        .from('drivers')
        .insert({
            name: input.name,
            phone: input.phone,
            license: input.license || null,
            active: input.active ?? true,
        })
        .select('id, name, phone, license, active, pin_hash')
        .single()

    if (error) throw error
    return fromRow(data as DriverRow)
}

export async function updateDriver(id: number, input: DriverInput): Promise<Driver> {
    const { data, error } = await requireClient()
        .from('drivers')
        .update({
            name: input.name,
            phone: input.phone,
            license: input.license || null,
            active: input.active ?? true,
        })
        .eq('id', id)
        .select('id, name, phone, license, active, pin_hash')
        .single()

    if (error) throw error
    return fromRow(data as DriverRow)
}
