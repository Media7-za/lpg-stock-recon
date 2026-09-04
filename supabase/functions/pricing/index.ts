import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";
import {
  calculateDeliveryCostPerKg,
  rankVehicleCandidates,
  type VehicleCandidateInput,
  type VehicleCandidateResult,
} from "../_shared/deliveryCostMath.ts";

/**
 * Hourly crew rates have never been formally governed for the LPG fleet.
 * These are an explicit, flagged assumption — never silently substituted
 * for a real rate without a labour_rates_governed=false warning.
 */
const ASSUMED_DRIVER_HOURLY_RATE = 150;
const ASSUMED_ASSISTANT_HOURLY_RATE = 100;

interface ResolvedCostProfile {
  id: string;
  status: 'provisional' | 'published' | 'superseded' | 'archived';
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
async function resolveEffectiveCostProfile(vehicleId: string, calculationDate: string): Promise<ResolvedCostProfile | null> {
  const { data: rows } = await supabase
    .from('vehicle_cost_profiles')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .in('status', ['PUBLISHED', 'PROVISIONAL'])
    .lte('effective_from', calculationDate)
    .or(`effective_to.is.null,effective_to.gte.${calculationDate}`);

  const candidates = rows ?? [];
  const published = candidates
    .filter((p) => p.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())[0];
  const provisional = candidates
    .filter((p) => p.status === 'PROVISIONAL')
    .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())[0];
  const profile = published ?? provisional;

  if (!profile || profile.total_running_cost_per_km == null) {
    return null;
  }

  const labourRatesGoverned = profile.driver_hourly_rate != null && profile.assistant_hourly_rate != null;

  return {
    id: profile.id,
    status: profile.status.toLowerCase(),
    source: profile.source ?? undefined,
    runningCostPerKm: Number(profile.total_running_cost_per_km),
    driverHourlyRate: profile.driver_hourly_rate != null ? Number(profile.driver_hourly_rate) : ASSUMED_DRIVER_HOURLY_RATE,
    assistantHourlyRate:
      profile.assistant_hourly_rate != null ? Number(profile.assistant_hourly_rate) : ASSUMED_ASSISTANT_HOURLY_RATE,
    labourRatesGoverned,
  };
}

/** Resolves the payload this vehicle may be dispatched with, never inventing one. */
function resolveVehiclePayload(vehicle: { maximum_payload_kg: unknown; recommended_payload_kg: unknown }): {
  payloadKg: number | null;
  payloadGoverned: boolean;
} {
  if (vehicle.maximum_payload_kg != null) {
    return { payloadKg: Number(vehicle.maximum_payload_kg), payloadGoverned: true };
  }
  if (vehicle.recommended_payload_kg != null) {
    return { payloadKg: Number(vehicle.recommended_payload_kg), payloadGoverned: false };
  }
  return { payloadKg: null, payloadGoverned: false };
}

async function buildCandidate(
  vehicle: { id: string; registration: string; maximum_payload_kg: unknown; recommended_payload_kg: unknown },
  calculationDate: string,
): Promise<VehicleCandidateInput | null> {
  const { payloadKg, payloadGoverned } = resolveVehiclePayload(vehicle);
  if (payloadKg == null) return null;

  const profile = await resolveEffectiveCostProfile(vehicle.id, calculationDate);
  if (!profile) return null;

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
  calculationDate: string,
): Promise<{ chosen: VehicleCandidateResult; alternatives: VehicleCandidateResult[]; reason: string }> {
  const { data: activeVehicles } = await supabase.from('vehicles').select('*').eq('active_status', 'active');

  const candidateInputs = (
    await Promise.all((activeVehicles ?? []).map((v) => buildCandidate(v, calculationDate)))
  ).filter((c): c is VehicleCandidateInput => c !== null);

  if (candidateInputs.length === 0) {
    throw new Error(
      'No governed vehicle is available for automatic recommendation on this date. ' +
        'Every active vehicle is missing either a confirmed payload or an effective cost profile.',
    );
  }

  const ranked = rankVehicleCandidates(candidateInputs, totalLpgKg, roundTripKm, tripHours, tollsPerTrip);
  const [chosen, ...alternatives] = ranked;

  return { chosen, alternatives, reason: 'lowest total execution cost among governed, active vehicles' };
}

async function selectOverrideVehicle(
  vehicleId: string,
  overridePayloadKg: number | undefined,
  totalLpgKg: number,
  roundTripKm: number,
  tripHours: number,
  tollsPerTrip: number,
  calculationDate: string,
  overrideReason: string | undefined,
): Promise<{ chosen: VehicleCandidateResult; alternatives: VehicleCandidateResult[]; reason: string }> {
  const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
  if (!vehicle) {
    throw new Error(`Vehicle ${vehicleId} not found`);
  }

  const { payloadKg: governedPayload, payloadGoverned } = resolveVehiclePayload(vehicle);
  const payloadKg = governedPayload ?? overridePayloadKg ?? null;
  if (payloadKg == null) {
    throw new Error(
      `Vehicle ${vehicle.registration} has no confirmed payload (recommended/maximum are both unset). ` +
        'Supply vehicle.override_payload_kg to calculate with this vehicle, or govern its payload data first.',
    );
  }

  const profile = await resolveEffectiveCostProfile(vehicle.id, calculationDate);
  if (!profile) {
    throw new Error(
      `Vehicle ${vehicle.registration} has no cost profile effective on ${calculationDate}. ` +
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

function toAlternative(candidate: VehicleCandidateResult) {
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

serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);

  try {
    if (method === 'POST' && url.pathname.endsWith('/delivery-cost-calculate')) {
      const body = await req.json();
      const { customer_id, order, route, vehicle, calculation_date, idempotencyKey } = body;

      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(JSON.stringify(existing), { status: 200 });

      if (!order?.total_lpg_kg || order.total_lpg_kg <= 0) {
        throw new Error('Total LPG kg must be specified and greater than 0');
      }
      if (!route?.round_trip_km || route.round_trip_km <= 0) {
        throw new Error('Round trip km must be specified and greater than 0');
      }
      if (!route?.estimated_trip_hours || route.estimated_trip_hours <= 0) {
        throw new Error('Estimated trip hours must be specified and greater than 0');
      }
      if (vehicle.mode === 'override' && !vehicle.vehicle_id) {
        throw new Error('vehicle.vehicle_id is required when vehicle.mode is "override"');
      }

      const totalLpgKg = order.total_lpg_kg;
      const roundTripKm = route.round_trip_km;
      const tripHours = route.estimated_trip_hours;
      const tollsPerTrip = route.tolls_per_trip || 0;
      const calcDate = calculation_date || new Date().toISOString().split('T')[0];

      const { chosen, alternatives, reason } =
        vehicle.mode === 'override'
          ? await selectOverrideVehicle(
              vehicle.vehicle_id,
              vehicle.override_payload_kg,
              totalLpgKg,
              roundTripKm,
              tripHours,
              tollsPerTrip,
              calcDate,
              vehicle.override_reason,
            )
          : await selectRecommendedVehicle(totalLpgKg, roundTripKm, tripHours, tollsPerTrip, calcDate);

      const deliveryCostPerKg = calculateDeliveryCostPerKg(chosen.totalExecutionCost, totalLpgKg);
      const warnings = buildWarnings(chosen);
      const status = warnings.length === 0 ? 'calculated' : 'partial';

      const calculationCode = `DEL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
      const alternativesConsidered = alternatives.map(toAlternative);

      const inputSnapshot = {
        customer_id,
        total_lpg_kg: totalLpgKg,
        round_trip_km: roundTripKm,
        trip_hours: tripHours,
        tolls_per_trip: tollsPerTrip,
        vehicle_mode: vehicle.mode,
        vehicle_id: vehicle.vehicle_id,
        override_payload_kg: vehicle.override_payload_kg,
        calculation_date: calcDate,
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

      const { data: calculation } = await supabase
        .from('delivery_cost_calculations')
        .insert({
          calculation_code: calculationCode,
          customer_id,
          calculated_at: new Date().toISOString(),
          calculation_date: calcDate,
          total_lpg_kg: totalLpgKg,
          vehicle_id: chosen.vehicleId,
          vehicle_selection_mode: vehicle.mode === 'recommend' ? 'RECOMMEND' : 'OVERRIDE',
          vehicle_selection_reason: reason,
          vehicle_override_reason: vehicle.override_reason,
          alternatives_considered: alternativesConsidered,
          payload_limit_kg: chosen.payloadKg,
          payload_governed: chosen.payloadGoverned,
          required_trips: chosen.requiredTrips,
          round_trip_km: roundTripKm,
          trip_hours: tripHours,
          tolls_per_trip: tollsPerTrip,
          vehicle_cost_profile_id: chosen.costProfileId,
          running_cost_per_km_snapshot: chosen.runningCostPerKm,
          driver_hourly_rate_snapshot: chosen.driverHourlyRate,
          assistant_hourly_rate_snapshot: chosen.assistantHourlyRate,
          labour_rates_governed: chosen.labourRatesGoverned,
          running_cost: chosen.runningCost,
          labour_cost: chosen.labourCost,
          toll_cost: chosen.tollCost,
          total_execution_cost: chosen.totalExecutionCost,
          delivery_cost_per_kg: deliveryCostPerKg,
          status: status === 'calculated' ? 'CALCULATED' : 'PARTIAL',
          warnings,
          input_snapshot: inputSnapshot,
          result_snapshot: resultSnapshot,
        })
        .select()
        .single();

      if (!calculation) throw new Error('Failed to create calculation');

      const response = {
        calculation_id: calculation.id,
        status,
        vehicle: {
          vehicle_id: chosen.vehicleId,
          selection: vehicle.mode,
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
          calculated_at: calculation.calculated_at,
          cost_profile_status: chosen.costProfileStatus,
          cost_profile_source: chosen.costProfileSource,
        },
        warnings,
      };

      await storeIdempotency(idempotencyKey, response);

      return new Response(JSON.stringify(response), { status: 201 });
    }

    if (method === 'GET' && url.pathname.includes('/delivery-cost?')) {
      const calculationId = url.searchParams.get('calculationId');
      if (!calculationId) {
        throw new Error('calculationId parameter is required');
      }

      const { data: calculation } = await supabase
        .from('delivery_cost_calculations')
        .select(
          `
          *,
          vehicle_cost_profile:vehicle_cost_profiles(*),
          vehicle:vehicles(*)
        `,
        )
        .eq('id', calculationId)
        .single();

      if (!calculation) {
        return new Response(JSON.stringify({ error: 'Calculation not found' }), { status: 404 });
      }

      const response = {
        calculation_id: calculation.id,
        status: calculation.status.toLowerCase(),
        vehicle: {
          vehicle_id: calculation.vehicle_id,
          selection: calculation.vehicle_selection_mode.toLowerCase(),
          registration: calculation.vehicle?.registration,
          maximum_payload_kg: calculation.payload_limit_kg,
          payload_governed: calculation.payload_governed,
          reason: calculation.vehicle_selection_reason,
          alternatives_considered: calculation.alternatives_considered ?? [],
        },
        load: {
          total_lpg_kg: calculation.total_lpg_kg,
          required_trips: calculation.required_trips,
        },
        route: {
          round_trip_km: calculation.round_trip_km,
          trip_hours: calculation.trip_hours,
        },
        costs: {
          running_cost: calculation.running_cost,
          labour_cost: calculation.labour_cost,
          toll_cost: calculation.toll_cost,
          total_execution_cost: calculation.total_execution_cost,
          labour_rates_governed: calculation.labour_rates_governed,
        },
        allocation: {
          delivery_cost_per_kg: calculation.delivery_cost_per_kg,
        },
        snapshot: {
          vehicle_cost_profile_id: calculation.vehicle_cost_profile_id,
          calculated_at: calculation.calculated_at,
          cost_profile_status: calculation.vehicle_cost_profile?.status?.toLowerCase() || 'provisional',
          cost_profile_source: calculation.vehicle_cost_profile?.source,
        },
        warnings: calculation.warnings,
      };

      return new Response(JSON.stringify(response), { status: 200 });
    }

    return new Response('Not Found', { status: 404 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 400,
    });
  }
});
