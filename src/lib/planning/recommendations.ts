/**
 * PLANNING RECOMMENDATIONS — PRD-003C
 *
 * Pure, stateless computation of advisory planning recommendations and warnings.
 * Consumed by the Planning Commitment screen (app/trips/plan) and the Orders page
 * ageing/urgency nudge.
 *
 * Never selects/deselects a Fulfilment (Delivery), never creates/edits/dispatches
 * a Trip, never introduces a hard block. See Docs/PRD-003C_PLANNING_RECOMMENDATIONS.md.
 *
 * Signal-to-field mapping (urgent flag, ageing threshold) is existing codebase
 * precedent cited from app/orders/page.tsx, not a new business rule — see
 * Docs/PLANNING_RECOMMENDATIONS_SHEET.md §7 Signal-to-Field Mapping.
 */

export type RecommendationCategory = "recommendation" | "warning"

export type RecommendationType =
    | "vehicle"
    | "split"
    | "near-capacity-warning"
    | "over-capacity-warning"
    | "multi-route-warning"
    | "ageing-urgency-recommendation"

export interface RecommendationOutput {
    type: RecommendationType
    category: RecommendationCategory
    outcome: string
    basis: string
    surface: "003A" | "003B" | "both"
}

// ─── §9.2 Vehicle / Split Recommendation Rules (unchanged from PRD-003B §10) ──
// Single-sourced from Docs/PLANNING_COMMITMENT_SHEET.md §11. Do not restate with
// different values — any change to these bands is a change to PRD-003B.

export const SMALL_VEHICLE_CAPACITY_KG = 1050
export const LARGE_VEHICLE_CAPACITY_KG = 4200

export type VehicleBand = "small" | "split-small" | "large" | "split-large"

export interface VehicleRecommendation {
    band: VehicleBand
    outcome: RecommendationOutput
}

export function recommendVehicleOrSplit(grossLoadKg: number): VehicleRecommendation {
    let band: VehicleBand
    let outcome: string

    if (grossLoadKg <= SMALL_VEHICLE_CAPACITY_KG) {
        band = "small"
        outcome = "Recommend small vehicle"
    } else if (grossLoadKg <= 2000) {
        band = "split-small"
        outcome = "Recommend split into two small-vehicle trips"
    } else if (grossLoadKg <= LARGE_VEHICLE_CAPACITY_KG) {
        band = "large"
        outcome = "Recommend large vehicle"
    } else {
        band = "split-large"
        outcome = "Recommend split into multiple trips"
    }

    const isSplit = band === "split-small" || band === "split-large"

    return {
        band,
        outcome: {
            type: isSplit ? "split" : "vehicle",
            category: "recommendation",
            outcome,
            basis: `Gross Operational Load ${Math.round(grossLoadKg)}kg`,
            surface: "003B",
        },
    }
}

// ─── §9.3 / §9.4 Near-Capacity / Over-Capacity Warning Rules ──────────────────
// Near-capacity uses ADR-011's percentage-based definition (Accepted ADR), not
// the fixed kg sub-bands proposed in the still-Draft parent PRD-003 §12 — see
// Docs/PLANNING_RECOMMENDATIONS_SHEET.md Decision 3.
//
// Computed against the ACTUAL selected vehicle's capacity (not the fixed
// 1050/4200 bands used for recommendation), consistent with the existing
// fillPercentage pattern in lib/actions/trips.ts.

export const NEAR_CAPACITY_UTILISATION = 0.8

export function getCapacityWarning(
    grossLoadKg: number,
    vehicleCapacityKg: number
): RecommendationOutput | null {
    if (!vehicleCapacityKg || vehicleCapacityKg <= 0) return null

    const utilisation = grossLoadKg / vehicleCapacityKg

    if (utilisation > 1) {
        const overBy = Math.round(grossLoadKg - vehicleCapacityKg)
        return {
            type: "over-capacity-warning",
            category: "warning",
            outcome: `Over capacity by ${overBy}kg`,
            basis: `${Math.round(grossLoadKg)}kg selected vs ${vehicleCapacityKg}kg vehicle capacity`,
            surface: "003B",
        }
    }

    if (utilisation >= NEAR_CAPACITY_UTILISATION) {
        return {
            type: "near-capacity-warning",
            category: "warning",
            outcome: `Approaching capacity (${Math.round(utilisation * 100)}%)`,
            basis: `${Math.round(grossLoadKg)}kg selected vs ${vehicleCapacityKg}kg vehicle capacity`,
            surface: "003B",
        }
    }

    return null
}

// ─── §9.5 Multi-Route Warning Rule (unchanged from ADR-011 / PRD-003B) ────────
// No reason capture — see Docs/PLANNING_RECOMMENDATIONS_SHEET.md Decision 4.

export function getMultiRouteWarning(routeIds: Array<number | null | undefined>): RecommendationOutput | null {
    const distinctRoutes = new Set(routeIds.filter((id): id is number => id != null))
    if (distinctRoutes.size <= 1) return null

    return {
        type: "multi-route-warning",
        category: "warning",
        outcome: `Spans ${distinctRoutes.size} routes`,
        basis: `Selected Fulfilments/Deliveries span ${distinctRoutes.size} distinct routes`,
        surface: "both",
    }
}

// ─── §9.6 Ageing / Urgency Recommendation Rule ────────────────────────────────
// Field mapping and threshold are existing codebase precedent (app/orders/page.tsx),
// reused for consistency — not a new business decision. See
// Docs/PLANNING_RECOMMENDATIONS_SHEET.md §7 Signal-to-Field Mapping. This has not
// yet been formally ratified in ADR-011.

export const AGEING_THRESHOLD_DAYS = 2

export function isUrgent(priority: string | null | undefined): boolean {
    return (priority ?? "").toLowerCase() === "urgent"
}

export function ageInDays(createdAt: Date | string): number {
    const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt
    return Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
}

export interface AgeingUrgencyCandidate {
    id: number
    priority: string | null | undefined
    createdAt: Date | string
}

export function getAgeingUrgencyRecommendation(
    pendingUnselected: AgeingUrgencyCandidate[]
): RecommendationOutput | null {
    const flagged = pendingUnselected.filter(
        (c) => isUrgent(c.priority) || ageInDays(c.createdAt) >= AGEING_THRESHOLD_DAYS
    )
    if (flagged.length === 0) return null

    // Manual urgent flag outranks age when both are present (ADR-011).
    const urgentCount = flagged.filter((c) => isUrgent(c.priority)).length
    const ageingOnlyCount = flagged.length - urgentCount

    const parts: string[] = []
    if (urgentCount > 0) parts.push(`${urgentCount} urgent`)
    if (ageingOnlyCount > 0) parts.push(`${ageingOnlyCount} ageing (≥${AGEING_THRESHOLD_DAYS}d)`)

    return {
        type: "ageing-urgency-recommendation",
        category: "recommendation",
        outcome: `${flagged.length} unselected: ${parts.join(", ")}`,
        basis: `Order.priority === "urgent" or age ≥ ${AGEING_THRESHOLD_DAYS} days`,
        surface: "003A",
        // Consumers needing the actual affected ids should filter pendingUnselected
        // themselves using isUrgent()/ageInDays() — this output is the advisory
        // summary, not the selection payload (never auto-selects, per Invariant 2).
    }
}

/**
 * Whether the planner's selected vehicle matches the recommendation.
 *
 * When the recommendation is a split band, proceeding with a single vehicle
 * is always an override, regardless of size class — PRD-003B §10.3: "If the
 * planner proceeds with a selected vehicle anyway, the system must treat
 * that as an override." (No automatic multi-trip creation exists, so a
 * single vehicle is the only way to proceed in MVP — but it must still be
 * recorded honestly as an override, not silently read as acceptance.)
 *
 * For non-split bands, acceptance is judged by capacity class (small/large),
 * not specific vehicle identity, since the recommendation names a class.
 *
 * Returns null when there's nothing to compare (no vehicle selected yet).
 */
export function wasVehicleRecommendationAccepted(
    band: VehicleBand,
    selectedVehicleCapacityKg: number | null | undefined
): boolean | null {
    if (selectedVehicleCapacityKg == null) return null
    if (band === "split-small" || band === "split-large") return false
    const selectedIsSmallClass = selectedVehicleCapacityKg <= SMALL_VEHICLE_CAPACITY_KG
    return (band === "small") === selectedIsSmallClass
}

// ─── §7 System Optimisation Priority (ADR-011) — presentation ordering only ───

const PRIORITY_ORDER: RecommendationType[] = [
    "ageing-urgency-recommendation", // urgency/ageing
    "multi-route-warning", // route density
    "near-capacity-warning", // vehicle utilisation
    "over-capacity-warning",
    "vehicle",
    "split",
]

export interface PlanningEvaluationInput {
    grossLoadKg: number
    selectedVehicleCapacityKg?: number | null
    routeIds: Array<number | null | undefined>
    pendingUnselected?: AgeingUrgencyCandidate[]
}

export interface PlanningEvaluation {
    recommendations: RecommendationOutput[]
    warnings: RecommendationOutput[]
    all: RecommendationOutput[]
}

/**
 * Computes the full Planning Evaluation (PRD-003C §6.3): every recommendation
 * and warning currently applicable. Never persists anything — PRD-003B decides
 * what belongs in the Planning Recommendation Snapshot at commitment.
 */
export function evaluatePlanning(input: PlanningEvaluationInput): PlanningEvaluation {
    const outputs: RecommendationOutput[] = []

    const { outcome: vehicleOutcome } = recommendVehicleOrSplit(input.grossLoadKg)
    outputs.push(vehicleOutcome)

    if (input.selectedVehicleCapacityKg) {
        const capacityWarning = getCapacityWarning(input.grossLoadKg, input.selectedVehicleCapacityKg)
        if (capacityWarning) outputs.push(capacityWarning)
    }

    const multiRoute = getMultiRouteWarning(input.routeIds)
    if (multiRoute) outputs.push(multiRoute)

    if (input.pendingUnselected) {
        const ageingUrgency = getAgeingUrgencyRecommendation(input.pendingUnselected)
        if (ageingUrgency) outputs.push(ageingUrgency)
    }

    outputs.sort((a, b) => PRIORITY_ORDER.indexOf(a.type) - PRIORITY_ORDER.indexOf(b.type))

    return {
        recommendations: outputs.filter((o) => o.category === "recommendation"),
        warnings: outputs.filter((o) => o.category === "warning"),
        all: outputs,
    }
}
