/**
 * DRAFT TRIP CONTRACT — PRD-003B, Amendment 2 (CD-001 / CD-002)
 *
 * Small, testable constants for rules owned by PRD-003B's Draft Trip
 * capability contract, kept separate from lib/planning/recommendations.ts
 * (which is PRD-003C's advisory recommendation engine — a different
 * capability with a different owner).
 */

/**
 * CD-001 — Draft Trips do not reserve vehicles.
 *
 * Vehicle selection at Draft stage records planning intent only. Multiple
 * Draft Trips may reference the same vehicle. Vehicle exclusivity applies
 * only once a Trip becomes operationally active (planned / in-progress) —
 * see Docs/PLANNING_COMMITMENT_SHEET.md Amendment 2.
 *
 * Used by app/api/trips/plan/route.ts (Draft creation) and
 * app/api/trips/route.ts (INV-010, unchanged for planned/in-progress trips).
 */
export const VEHICLE_EXCLUSIVITY_STATUSES = ["planned", "in-progress"] as const
