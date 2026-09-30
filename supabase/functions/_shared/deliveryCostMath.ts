/**
 * Pure delivery-cost arithmetic for the Trip Cost Engine (004B).
 *
 * Zero imports, zero I/O, zero framework dependencies — this file is
 * imported unmodified by both the Node/Prisma calculator
 * (src/features/pricing-desk/lib/deliveryCostCalculator.ts) and the Deno
 * edge function (supabase/functions/pricing/index.ts) so the two runtimes
 * can never diverge on the actual cost math. Keep it that way: no
 * `Deno.*`, no `process.*`, no imports of any kind.
 */

export function calculateRequiredTrips(totalLpgKg: number, payloadKg: number): number {
  if (totalLpgKg <= 0) {
    throw new Error('Total LPG kg must be greater than 0');
  }
  if (payloadKg <= 0) {
    throw new Error('Payload must be greater than 0');
  }
  return Math.ceil(totalLpgKg / payloadKg);
}

export function calculateRunningCost(roundTripKm: number, runningCostPerKm: number, requiredTrips: number): number {
  return roundTripKm * runningCostPerKm * requiredTrips;
}

export function calculateLabourCost(
  tripHours: number,
  requiredTrips: number,
  driverHourlyRate: number,
  assistantHourlyRate: number,
): number {
  return tripHours * requiredTrips * (driverHourlyRate + assistantHourlyRate);
}

export function calculateTollCost(tollsPerTrip: number, requiredTrips: number): number {
  return tollsPerTrip * requiredTrips;
}

export function calculateTotalExecutionCost(runningCost: number, labourCost: number, tollCost: number): number {
  return runningCost + labourCost + tollCost;
}

export function calculateDeliveryCostPerKg(totalExecutionCost: number, totalLpgKg: number): number {
  if (totalLpgKg <= 0) {
    throw new Error('Total LPG kg must be greater than 0');
  }
  return totalExecutionCost / totalLpgKg;
}

export interface VehicleCandidateInput {
  vehicleId: string;
  registration: string;
  payloadKg: number;
  payloadGoverned: boolean;
  runningCostPerKm: number;
  costProfileId: string;
  costProfileStatus: 'provisional' | 'published' | 'superseded' | 'archived';
  costProfileSource?: string;
  driverHourlyRate: number;
  assistantHourlyRate: number;
  labourRatesGoverned: boolean;
}

export interface VehicleCandidateResult extends VehicleCandidateInput {
  requiredTrips: number;
  runningCost: number;
  labourCost: number;
  tollCost: number;
  totalExecutionCost: number;
}

/** Scores every governed candidate against the same load/route and returns them cheapest-first. */
export function rankVehicleCandidates(
  candidates: VehicleCandidateInput[],
  totalLpgKg: number,
  roundTripKm: number,
  tripHours: number,
  tollsPerTrip: number,
): VehicleCandidateResult[] {
  return candidates
    .map((candidate) => {
      const requiredTrips = calculateRequiredTrips(totalLpgKg, candidate.payloadKg);
      const runningCost = calculateRunningCost(roundTripKm, candidate.runningCostPerKm, requiredTrips);
      const labourCost = calculateLabourCost(
        tripHours,
        requiredTrips,
        candidate.driverHourlyRate,
        candidate.assistantHourlyRate,
      );
      const tollCost = calculateTollCost(tollsPerTrip, requiredTrips);
      const totalExecutionCost = calculateTotalExecutionCost(runningCost, labourCost, tollCost);
      return { ...candidate, requiredTrips, runningCost, labourCost, tollCost, totalExecutionCost };
    })
    .sort((a, b) => a.totalExecutionCost - b.totalExecutionCost);
}
