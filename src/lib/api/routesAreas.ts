// Orders-Module migration, Phase 4 Step 1. See vehicles.ts for the
// direct-Supabase-client-calls rationale.
import { supabase } from '@/lib/supabase'

export interface Area {
    id: number
    name: string
    routeId: number
    defaultSequence: number | null
    active: boolean
    centerLat: number | null
    centerLng: number | null
    boundaryPolygon: string | null
}

export interface Route {
    id: number
    name: string
    code: string
    active: boolean
    areas: Area[]
}

interface AreaRow {
    id: number
    name: string
    route_id: number
    default_sequence: number | null
    active: boolean
    center_lat: number | null
    center_lng: number | null
    boundary_polygon: string | null
}

interface RouteRow {
    id: number
    name: string
    code: string
    active: boolean
    areas: AreaRow[] | null
}

function areaFromRow(row: AreaRow): Area {
    return {
        id: row.id,
        name: row.name,
        routeId: row.route_id,
        defaultSequence: row.default_sequence,
        active: row.active,
        centerLat: row.center_lat,
        centerLng: row.center_lng,
        boundaryPolygon: row.boundary_polygon,
    }
}

function routeFromRow(row: RouteRow): Route {
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        active: row.active,
        areas: (row.areas ?? []).map(areaFromRow),
    }
}

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

export async function listRoutes(): Promise<Route[]> {
    const { data, error } = await requireClient()
        .from('routes')
        .select('id, name, code, active, areas(id, name, route_id, default_sequence, active, center_lat, center_lng, boundary_polygon)')
        .order('id', { ascending: true })

    if (error) throw error

    // Deduplicate by name — ported from the original API's guard against
    // duplicate records reaching the client.
    const seen = new Set<string>()
    const unique = (data as unknown as RouteRow[]).filter((r) => {
        if (seen.has(r.name)) return false
        seen.add(r.name)
        return true
    })
    return unique.map(routeFromRow)
}

export async function createRoute(input: { name: string; code: string }): Promise<Route> {
    const client = requireClient()

    const { data: existing } = await client
        .from('routes')
        .select('id')
        .eq('code', input.code)
        .maybeSingle()
    if (existing) {
        throw new Error(`Route code "${input.code}" already exists`)
    }

    const { data, error } = await client
        .from('routes')
        .insert({ name: input.name, code: input.code, active: true })
        .select('id, name, code, active, areas(id, name, route_id, default_sequence, active, center_lat, center_lng, boundary_polygon)')
        .single()

    if (error) throw error
    return routeFromRow(data as unknown as RouteRow)
}

export interface AreaInput {
    name: string
    routeId: number
    centerLat?: number | null
    centerLng?: number | null
    boundaryPolygon?: { lat: number; lng: number }[] | null
    defaultSequence?: number | null
    active?: boolean
}

export async function createArea(input: AreaInput): Promise<Area> {
    const { data, error } = await requireClient()
        .from('areas')
        .insert({
            name: input.name,
            route_id: input.routeId,
            center_lat: input.centerLat ?? null,
            center_lng: input.centerLng ?? null,
            boundary_polygon: input.boundaryPolygon ? JSON.stringify(input.boundaryPolygon) : null,
            default_sequence: input.defaultSequence ?? null,
            active: input.active ?? true,
        })
        .select('id, name, route_id, default_sequence, active, center_lat, center_lng, boundary_polygon')
        .single()

    if (error) throw error
    return areaFromRow(data as AreaRow)
}

// Partial update — only fields actually present in `patch` are touched, same
// contract as the original PATCH /api/routes/[id] (an absent field must leave
// the existing value alone, not null it out).
export async function updateArea(id: number, patch: Partial<AreaInput>): Promise<Area> {
    const data: Record<string, unknown> = {}
    if (patch.name !== undefined) data.name = patch.name
    if (patch.routeId !== undefined) data.route_id = patch.routeId
    if (patch.centerLat !== undefined) data.center_lat = patch.centerLat
    if (patch.centerLng !== undefined) data.center_lng = patch.centerLng
    if (patch.boundaryPolygon !== undefined) data.boundary_polygon = patch.boundaryPolygon ? JSON.stringify(patch.boundaryPolygon) : null
    if (patch.defaultSequence !== undefined) data.default_sequence = patch.defaultSequence
    if (patch.active !== undefined) data.active = patch.active

    const { data: row, error } = await requireClient()
        .from('areas')
        .update(data)
        .eq('id', id)
        .select('id, name, route_id, default_sequence, active, center_lat, center_lng, boundary_polygon')
        .single()

    if (error) throw error
    return areaFromRow(row as AreaRow)
}
