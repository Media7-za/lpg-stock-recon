import { prisma } from '@/lib/prisma';
import {
  calculateRequiredTrips,
  calculateDeliveryCostPerKg,
  rankVehicleCandidates,
  type VehicleCandidateInput,
  type VehicleCandidateResult,
} from '../../../../supabase/functions/_shared/deliveryCostMath';
import type {
  CalculateDeliveryCostInput,
  CalculateDeliveryCostOutput,
  VehicleAlternative,
  CalculationStatus,
  CostProfileStatus,
} from '../types/deliveryCostCalculator';

/**
 * Hourly crew rates have never been formally governed for the LPG fleet.
 * These are an explicit, flagged assumption — never silently substituted
 * for a real rate without warnings.labour_rates_unconfirmed being set.
 */
const ASSUMED_DRIVER_HOURLY_RATE = 150;
const ASSUMED_ASSISTANT_HOURLY_RATE = 100;

/**
 * VehicleCostProfile.effectiveFrom/effectiveTo are @db.Date columns (whole
 * calendar days, not instants). Normalizing to UTC midnight here keeps the
 * lte/gte comparisons exact regardless of what time of day this function is
 * called — otherwise a profile seeded at, say, 14:00 today would fail an
 * `effectiveFrom <= calculationDate` check for a caller who passed today's
 * date with no time component before 14:00.
 */
function normalizeToUtcDate(dateStr?: string): Date {
  const iso = dateStr ?? new Date().toISOString().split('T')[0];
  return new Date(`${iso}T00:00:00.000Z`);
}

interface ResolvedCostProfile {
  id: string;
  status: CostProfileStatus;
  source?: string;
  runningCostPerKm: number;
  driverHourlyRate: number;
  assistantHourlyRate: number;
  labourRatesGoverned: boolean;
}

/**
 * Finds the cost profile effective on `calculationDate`, preferring a
 * PUBLISHED profile over a PROVISIONAL one. Never mutates master data —
 * a vehicle with no profile at all is a data-governance gap the caller
 * must fix (seed one), not something to paper over here.
 */
async function resolveEffectiveCostProfile(vehicleId: string, calculationDate: Date): Promise<ResolvedCostProfile | null> {
  const candidates = await prisma.vehicleCostProfile.findMany({
    where: {
      vehicleId,
      status: { in: ['PUBLISHED', 'PROVISIONAL'] },
      effectiveFrom: { lte: calculationDate },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: calculationDate } }],
    },
  });

  const published = candidates
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0];
  const provisional = candidates
    .filter((p) => p.status === 'PROVISIONAL')
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0];
  const profile = published ?? provisional;

  if (!profile || profile.totalRunningCostPerKm == null) {
    return null;
  }

  const labourRatesGoverned = profile.driverHourlyRate != null && profile.assistantHourlyRate != null;

  return {
    id: profile.id,
    status: profile.status.toLowerCase() as CostProfileStatus,
    source: profile.source ?? undefined,
    runningCostPerKm: profile.totalRunningCostPerKm.toNumber(),
    driverHourlyRate: profile.driverHourlyRate?.toNumber() ?? ASSUMED_DRIVER_HOURLY_RATE,
    assistantHourlyRate: profile.assistantHourlyRate?.toNumber() ?? ASSUMED_ASSISTANT_HOURLY_RATE,
    labourRatesGoverned,
  };
}

/** Resolves the payload this vehicle may be dispatched with, never inventing one. */
function resolveVehiclePayload(vehicle: { maximumPayloadKg: unknown; recommendedPayloadKg: unknown }): {
  payloadKg: number | null;
  payloadGoverned: boolean;
} {
  const maxPayload = vehicle.maximumPayloadKg as { toNumber(): number } | null;
  const recommendedPayload = vehicle.recommendedPayloadKg as { toNumber(): number } | null;

  if (maxPayload != null) {
    return { payloadKg: maxPayload.toNumber(), payloadGoverned: true };
  }
  if (recommendedPayload != null) {
    return { payloadKg: recommendedPayload.toNumber(), payloadGoverned: false };
  }
  return { payloadKg: null, payloadGoverned: false };
}

async function buildCandidate(
  vehicle: { id: string; registration: string; maximumPayloadKg: unknown; recommendedPayloadKg: unknown },
  calculationDate: Date,
): Promise<VehicleCandidateInput | null> {
  const { payloadKg, payloadGoverned } = resolveVehiclePayload(vehicle);
  if (payloadKg == null) {
    return null;
  }

  const profile = await resolveEffectiveCostProfile(vehicle.id, calculationDate);
  if (!profile) {
    return null;
  }

  return {
    vehicleId: vehicle.id,
    registration: vehicle.registration,
    payloadKg,
    payloadGoverned,
    runningCostPerKm: profile.runningCostPerKm,
    costProfileId: profile.id,
    costProfileStatus: profile.status,
    costProfileSource: profile.source,
    driverHourlyRate: profile.driverHourlyRate,
    assistantHourlyRate: profile.assistantHourlyRate,
    labourRatesGoverned: profile.labourRatesGoverned,
  };
}

async function selectRecommendedVehicle(
  totalLpgKg: number,
  roundTripKm: number,
  tripHours: number,
  tollsPerTrip: number,
  calculationDate: Date,
): Promise<{ chosen: VehicleCandidateResult; alternatives: VehicleCandidateResult[]; reason: string }> {
  const activeVehicles = await prisma.vehicle.findMany({ where: { activeStatus: 'active' } });

  const candidateInputs = (
    await Promise.all(activeVehicles.map((v) => buildCandidate(v, calculationDate)))
  ).filter((c): c is VehicleCandidateInput => c !== null);

  if (candidateInputs.length === 0) {
    throw new Error(
      'No governed vehicle is available for automatic recommendation on this date. ' +
        'Every active vehicle is missing either a confirmed payload or an effective cost profile.',
    );
  }

  const ranked = rankVehicleCandidates(candidateInputs, totalLpgKg, roundTripKm, tripHours, tollsPerTrip);
  const [chosen, ...alternatives] = ranked;

  return {
    chosen,
    alternatives,
    reason: 'lowest total execution cost among governed, active vehicles',
  };
}

async function selectOverrideVehicle(
  vehicleId: string,
  overridePayloadKg: number | undefined,
  totalLpgKg: number,
  roundTripKm: number,
  tripHours: number,
  tollsPerTrip: number,
  calculationDate: Date,
  overrideReason: string | undefined,
): Promise<{ chosen: VehicleCandidateResult; alternatives: VehicleCandidateResult[]; reason: string }> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new Error(`Vehicle ${vehicleId} not found`);
  }

  const { payloadKg: governedPayload, payloadGoverned } = resolveVehiclePayload(vehicle);
  const payloadKg = governedPayload ?? overridePayloadKg ?? null;
  if (payloadKg == null) {
    throw new Error(
      `Vehicle ${vehicle.registration} has no confirmed payload (min/recommended/maximum are all unset). ` +
        'Supply vehicle.override_payload_kg to calculate with this vehicle, or govern its payload data first.',
    );
  }

  const profile = await resolveEffectiveCostProfile(vehicle.id, calculationDate);
  if (!profile) {
    throw new Error(
      `Vehicle ${vehicle.registration} has no cost profile effective on ${calculationDate.toISOString().split('T')[0]}. ` +
        'Seed a VehicleCostProfile for this vehicle before calculating.',
    );
  }

  const candidate: VehicleCandidateInput = {
    vehicleId: vehicle.id,
    registration: vehicle.registration,
    payloadKg,
    payloadGoverned: payloadGoverned && overridePayloadKg == null,
    runningCostPerKm: profile.runningCostPerKm,
    costProfileId: profile.id,
    costProfileStatus: profile.status,
    costProfileSource: profile.source,
    driverHourlyRate: profile.driverHourlyRate,
    assistantHourlyRate: profile.assistantHourlyRate,
    labourRatesGoverned: profile.labourRatesGoverned,
  };

  const [chosen] = rankVehicleCandidates([candidate], totalLpgKg, roundTripKm, tripHours, tollsPerTrip);

  return {
    chosen,
    alternatives: [],
    reason: overrideReason ? `explicit override: ${overrideReason}` : 'explicit override (no reason given)',
  };
}

function toAlternative(candidate: VehicleCandidateResult): VehicleAlternative {
  return {
    vehicle_id: candidate.vehicleId,
    registration: candidate.registration,
    total_execution_cost: parseFloat(candidate.totalExecutionCost.toFixed(2)),
    required_trips: candidate.requiredTrips,
  };
}

function buildWarnings(candidate: VehicleCandidateResult): string[] {
  const warnings: string[] = [];
  if (candidate.costProfileStatus === 'provisional') {
    warnings.push(
      `Cost profile ${candidate.costProfileId} is provisional (source: ${candidate.costProfileSource ?? 'unknown'}); full 004A cost decomposition pending.`,
    );
  }
  if (!candidate.payloadGoverned) {
    warnings.push(
      `${candidate.registration} maximum payload is not formally confirmed; using its recommended payload (${candidate.payloadKg}kg) as a conservative proxy.`,
    );
  }
  if (!candidate.labourRatesGoverned) {
    warnings.push(
      `Driver/assistant hourly rates are not governed for this vehicle; used unconfirmed assumed rates (driver R${ASSUMED_DRIVER_HOURLY_RATE}/h, assistant R${ASSUMED_ASSISTANT_HOURLY_RATE}/h).`,
    );
  }
  return warnings;
}

export async function calculateDeliveryCost(input: CalculateDeliveryCostInput): Promise<CalculateDeliveryCostOutput> {
  if (!input.order?.total_lpg_kg || input.order.total_lpg_kg <= 0) {
    throw new Error('Total LPG kg must be specified and greater than 0');
  }
  if (!input.route.round_trip_km || input.route.round_trip_km <= 0) {
    throw new Error('Round trip km must be specified and greater than 0');
  }
  if (!input.route.estimated_trip_hours || input.route.estimated_trip_hours <= 0) {
    throw new Error('Estimated trip hours must be specified and greater than 0');
  }
  if (input.vehicle.mode === 'override' && !input.vehicle.vehicle_id) {
    throw new Error('vehicle.vehicle_id is required when vehicle.mode is "override"');
  }

  const totalLpgKg = input.order.total_lpg_kg;
  const roundTripKm = input.route.round_trip_km;
  const tripHours = input.route.estimated_trip_hours;
  const tollsPerTrip = input.route.tolls_per_trip || 0;
  const calculationDate = normalizeToUtcDate(input.calculation_date);

  const { chosen, alternatives, reason } =
    input.vehicle.mode === 'override'
      ? await selectOverrideVehicle(
          input.vehicle.vehicle_id!,
          input.vehicle.override_payload_kg,
          totalLpgKg,
          roundTripKm,
          tripHours,
          tollsPerTrip,
          calculationDate,
          input.vehicle.override_reason,
        )
      : await selectRecommendedVehicle(totalLpgKg, roundTripKm, tripHours, tollsPerTrip, calculationDate);

  const deliveryCostPerKg = calculateDeliveryCostPerKg(chosen.totalExecutionCost, totalLpgKg);
  const warnings = buildWarnings(chosen);
  const status: CalculationStatus = warnings.length === 0 ? 'calculated' : 'partial';

  const calculationCode = `DEL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  // Plain-object copy: Prisma's JSON column type doesn't accept typed arrays directly.
  const alternativesConsidered = JSON.parse(JSON.stringify(alternatives.map(toAlternative)));

  const inputSnapshot = {
    customer_id: input.customer_id,
    total_lpg_kg: totalLpgKg,
    round_trip_km: roundTripKm,
    trip_hours: tripHours,
    tolls_per_trip: tollsPerTrip,
    vehicle_mode: input.vehicle.mode,
    vehicle_id: input.vehicle.vehicle_id,
    override_payload_kg: input.vehicle.override_payload_kg,
    calculation_date: calculationDate.toISOString().split('T')[0],
  };

  const resultSnapshot = {
    vehicle_id: chosen.vehicleId,
    vehicle_registration: chosen.registration,
    payload_limit_kg: chosen.payloadKg,
    payload_governed: chosen.payloadGoverned,
    required_trips: chosen.requiredTrips,
    running_cost: parseFloat(chosen.runningCost.toFixed(2)),
    labour_cost: parseFloat(chosen.labourCost.toFixed(2)),
    toll_cost: parseFloat(chosen.tollCost.toFixed(2)),
    total_execution_cost: parseFloat(chosen.totalExecutionCost.toFixed(2)),
    delivery_cost_per_kg: parseFloat(deliveryCostPerKg.toFixed(4)),
    labour_rates_governed: chosen.labourRatesGoverned,
    cost_profile_status: chosen.costProfileStatus,
    cost_profile_source: chosen.costProfileSource,
    alternatives_considered: alternativesConsidered,
  };

  const calculation = await prisma.deliveryCostCalculation.create({
    data: {
      calculationCode,
      customerId: input.customer_id,
      calculatedAt: new Date(),
      calculationDate,
      totalLpgKg,
      vehicleId: chosen.vehicleId,
      vehicleSelectionMode: input.vehicle.mode === 'recommend' ? 'RECOMMEND' : 'OVERRIDE',
      vehicleSelectionReason: reason,
      vehicleOverrideReason: input.vehicle.override_reason,
      alternativesConsidered,
      payloadLimitKg: chosen.payloadKg,
      payloadGoverned: chosen.payloadGoverned,
      requiredTrips: chosen.requiredTrips,
      roundTripKm,
      tripHours,
      tollsPerTrip,
      vehicleCostProfileId: chosen.costProfileId,
      runningCostPerKmSnapshot: chosen.runningCostPerKm,
      driverHourlyRateSnapshot: chosen.driverHourlyRate,
      assistantHourlyRateSnapshot: chosen.assistantHourlyRate,
      labourRatesGoverned: chosen.labourRatesGoverned,
      runningCost: chosen.runningCost,
      labourCost: chosen.labourCost,
      tollCost: chosen.tollCost,
      totalExecutionCost: chosen.totalExecutionCost,
      deliveryCostPerKg,
      status: status === 'calculated' ? 'CALCULATED' : 'PARTIAL',
      warnings,
      inputSnapshot,
      resultSnapshot,
    },
  });

  return {
    calculation_id: calculation.id,
    status,
    vehicle: {
      vehicle_id: chosen.vehicleId,
      selection: input.vehicle.mode,
      registration: chosen.registration,
      maximum_payload_kg: chosen.payloadKg,
      payload_governed: chosen.payloadGoverned,
      reason,
      alternatives_considered: alternativesConsidered,
    },
    load: {
      total_lpg_kg: totalLpgKg,
      required_trips: chosen.requiredTrips,
    },
    route: {
      round_trip_km: roundTripKm,
      trip_hours: tripHours,
    },
    costs: {
      running_cost: parseFloat(chosen.runningCost.toFixed(2)),
      labour_cost: parseFloat(chosen.labourCost.toFixed(2)),
      toll_cost: parseFloat(chosen.tollCost.toFixed(2)),
      total_execution_cost: parseFloat(chosen.totalExecutionCost.toFixed(2)),
      labour_rates_governed: chosen.labourRatesGoverned,
    },
    allocation: {
      delivery_cost_per_kg: parseFloat(deliveryCostPerKg.toFixed(4)),
    },
    snapshot: {
      vehicle_cost_profile_id: chosen.costProfileId,
      calculated_at: calculation.calculatedAt.toISOString(),
      cost_profile_status: chosen.costProfileStatus,
      cost_profile_source: chosen.costProfileSource,
    },
    warnings,
  };
}

export async function getDeliveryCostCalculation(calculationId: string): Promise<CalculateDeliveryCostOutput | null> {
  const calculation = await prisma.deliveryCostCalculation.findUnique({
    where: { id: calculationId },
    include: { vehicleCostProfile: true, vehicle: true },
  });

  if (!calculation) {
    return null;
  }

  const alternativesConsidered = (calculation.alternativesConsidered as unknown as VehicleAlternative[] | null) ?? [];

  return {
    calculation_id: calculation.id,
    status: calculation.status.toLowerCase() as CalculationStatus,
    vehicle: {
      vehicle_id: calculation.vehicleId,
      selection: calculation.vehicleSelectionMode.toLowerCase() as 'recommend' | 'override',
      registration: calculation.vehicle.registration,
      maximum_payload_kg: calculation.payloadLimitKg.toNumber(),
      payload_governed: calculation.payloadGoverned,
      reason: calculation.vehicleSelectionReason ?? '',
      alternatives_considered: alternativesConsidered,
    },
    load: {
      total_lpg_kg: calculation.totalLpgKg.toNumber(),
      required_trips: calculation.requiredTrips,
    },
    route: {
      round_trip_km: calculation.roundTripKm.toNumber(),
      trip_hours: calculation.tripHours.toNumber(),
    },
    costs: {
      running_cost: calculation.runningCost.toNumber(),
      labour_cost: calculation.labourCost.toNumber(),
      toll_cost: calculation.tollCost.toNumber(),
      total_execution_cost: calculation.totalExecutionCost.toNumber(),
      labour_rates_governed: calculation.labourRatesGoverned,
    },
    allocation: {
      delivery_cost_per_kg: calculation.deliveryCostPerKg.toNumber(),
    },
    snapshot: {
      vehicle_cost_profile_id: calculation.vehicleCostProfileId,
      calculated_at: calculation.calculatedAt.toISOString(),
      cost_profile_status: calculation.vehicleCostProfile.status.toLowerCase() as CostProfileStatus,
      cost_profile_source: calculation.vehicleCostProfile.source ?? undefined,
    },
    warnings: calculation.warnings,
  };
}

// Re-exported so callers doing custom aggregation (e.g. a future 004C
// allocation step) can reuse the exact same trip math without duplicating it.
export { calculateRequiredTrips };
