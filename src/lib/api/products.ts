// Orders-Module migration, Phase 4 Step 2. Direct Supabase client calls —
// plain CRUD, no privileged/atomic logic (see Phase 4 Step 1 report for the
// architecture rule this follows).
//
// Field mapping vs. Orders-Module's original Product model:
//   code  -> stockno (existing column, already served this role)
//   name  -> description (existing column)
//   sku   -> sku (new column added in the Phase 2 migration)
//   weight/tareWeight/totalWeight -> weight/tare_weight/total_weight (new columns)
//   category -> category (existing column, unchanged)
//
// NOT ported: `active`. The real `products` table has no active/inactive
// column — Phase 2's migration only added weight, tare_weight, total_weight,
// sku (per the Step 2 spec). Orders-Module's ProductSheet/ProductsPage have
// an Active/Inactive toggle with nothing to persist it to here, so it's
// dropped rather than faked as client-only state. Flagged in the Step 2
// report — add an `active` column in a future migration if this is needed.
import { supabase } from '@/lib/supabase'

export interface Product {
    id: string
    code: string
    name: string
    sku: string | null
    weight: number | null
    tareWeight: number | null
    totalWeight: number | null
    category: string | null
}

interface ProductRow {
    id: string
    stockno: string
    description: string
    sku: string | null
    weight: number | null
    tare_weight: number | null
    total_weight: number | null
    category: string | null
}

function fromRow(row: ProductRow): Product {
    return {
        id: row.id,
        code: row.stockno,
        name: row.description,
        sku: row.sku,
        weight: row.weight,
        tareWeight: row.tare_weight,
        totalWeight: row.total_weight,
        category: row.category,
    }
}

function requireClient() {
    if (!supabase) throw new Error('Supabase client is not configured (missing VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY)')
    return supabase
}

const SELECT_COLUMNS = 'id, stockno, description, sku, weight, tare_weight, total_weight, category'

export async function listProducts(): Promise<Product[]> {
    const { data, error } = await requireClient()
        .from('products')
        .select(SELECT_COLUMNS)
        .order('description', { ascending: true })

    if (error) throw error
    return (data as ProductRow[]).map(fromRow)
}

export interface ProductInput {
    code: string
    name: string
    sku: string
    weight: number
    tareWeight: number
    totalWeight: number
    category: string
}

export async function createProduct(input: ProductInput): Promise<Product> {
    const { data, error } = await requireClient()
        .from('products')
        .insert({
            id: crypto.randomUUID(),
            stockno: input.code,
            description: input.name,
            sku: input.sku,
            weight: input.weight,
            tare_weight: input.tareWeight,
            total_weight: input.totalWeight,
            category: input.category,
        })
        .select(SELECT_COLUMNS)
        .single()

    if (error) throw error
    return fromRow(data as ProductRow)
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
    const { data, error } = await requireClient()
        .from('products')
        .update({
            stockno: input.code,
            description: input.name,
            sku: input.sku,
            weight: input.weight,
            tare_weight: input.tareWeight,
            total_weight: input.totalWeight,
            category: input.category,
            // Column is literally "updatedAt" (camelCase) — Prisma didn't
            // @map it, and has no @updatedAt DB-level default/trigger, so it
            // must be set explicitly here since we're bypassing Prisma.
            updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select(SELECT_COLUMNS)
        .single()

    if (error) throw error
    return fromRow(data as ProductRow)
}
