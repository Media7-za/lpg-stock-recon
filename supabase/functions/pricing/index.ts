import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";

const PROVISIONAL_VEHICLE_RATES: Record<string, { r_per_km: number; payload_kg: number; registration: string }> = {
  CS70HKZN: {
    r_per_km: 3.66,
    payload_kg: 500,
    registration: 'CS70HKZN',
  },
  CS70HMZN: {
    r_per_km: 5.67,
    payload_kg: 1000,
    registration: 'CS70HMZN',
  },
};

const DEFAULT_DRIVER_HOURLY_RATE = 150;
const DEFAULT_ASSISTANT_HOURLY_RATE = 100;

interface CalculationContext {
  vehicleId: string;
  vehicleRegistration: string;
  maximumPayloadKg: number;
  costProfileId: string;
  costProfileStatus: string;
  costProfileSource?: string;
  fuelCostPerKm: number;
  driverHourlyRate: number;
  assistantHourlyRate: number;
}

async function getOrRecommendVehicle(
  mode: string,
  vehicleId?: string,
): Promise<CalculationContext> {
  let vehicle;

  if (mode === 'override' && vehicleId) {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();
    vehicle = data;

    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }
  } else {
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .eq('registration', 'CS70HKZN')
      .single();
    vehicle = data;
  }

  if (!vehicle) {
    throw new Error('No suitable vehicle found for calculation');
  }

  // Check for published cost profile
  const { data: profiles } = await supabase
    .from('vehicle_cost_profiles')
    .select('*')
    .eq('vehicle_id', vehicle.id)
    .eq('status', 'PUBLISHED')
    .order('published_at', { ascending: false })
    .limit(1);

  if (profiles && profiles.length > 0) {
    const profile = profiles[0];
    return {
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
      maximumPayloadKg: vehicle.recommendedPayloadKg || vehicle.maximumPayloadKg || 500,
      costProfileId: profile.id,
      costProfileStatus: profile.status.toLowerCase(),
      costProfileSource: profile.source,
      fuelCostPerKm: profile.total_running_cost_per_km || 3.66,
      driverHourlyRate: profile.driver_hourly_rate || DEFAULT_DRIVER_HOURLY_RATE,
      assistantHourlyRate: profile.assistant_hourly_rate || DEFAULT_ASSISTANT_HOURLY_RATE,
    };
  }

  // Fall back to provisional rate
  const provisionalRate = PROVISIONAL_VEHICLE_RATES[vehicle.registration];
  if (provisionalRate) {
    // Create or get provisional profile
    const { data: existingProfile } = await supabase
      .from('vehicle_cost_profiles')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .eq('status', 'PROVISIONAL')
      .order('created_at', { ascending: false })
      .limit(1);

    let costProfileId: string;
    if (existingProfile && existingProfile.length > 0) {
      costProfileId = existingProfile[0].id;
    } else {
      const { data: newProfile } = await supabase
        .from('vehicle_cost_profiles')
        .insert({
          vehicle_id: vehicle.id,
          profile_code: `VCP-2026-09-${vehicle.registration}-PROV`,
          status: 'PROVISIONAL',
          source: 'legacy_pricing_desk_rate',
          total_running_cost_per_km: provisionalRate.r_per_km,
          driver_hourly_rate: DEFAULT_DRIVER_HOURLY_RATE,
          assistant_hourly_rate: DEFAULT_ASSISTANT_HOURLY_RATE,
        })
        .select()
        .single();

      if (!newProfile) throw new Error('Failed to create provisional profile');
      costProfileId = newProfile.id;
    }

    return {
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
      maximumPayloadKg: provisionalRate.payload_kg,
      costProfileId,
      costProfileStatus: 'provisional',
      costProfileSource: 'legacy_pricing_desk_rate',
      fuelCostPerKm: provisionalRate.r_per_km,
      driverHourlyRate: DEFAULT_DRIVER_HOURLY_RATE,
      assistantHourlyRate: DEFAULT_ASSISTANT_HOURLY_RATE,
    };
  }

  throw new Error(`No provisional rate found for vehicle ${vehicle.registration}`);
}

function calculateRequiredTrips(totalLpgKg: number, payloadLimitKg: number): number {
  if (payloadLimitKg <= 0) {
    throw new Error('Payload limit must be greater than 0');
  }
  return Math.ceil(totalLpgKg / payloadLimitKg);
}

function calculateRunningCost(roundTripKm: number, costPerKm: number, requiredTrips: number): number {
  return roundTripKm * costPerKm * requiredTrips;
}

function calculateLabourCost(
  tripHours: number,
  requiredTrips: number,
  driverHourlyRate: number,
  assistantHourlyRate: number,
): number {
  const crewHourlyRate = driverHourlyRate + assistantHourlyRate;
  return tripHours * requiredTrips * crewHourlyRate;
}

function calculateDeliveryCostPerKg(totalExecutionCost: number, totalLpgKg: number): number {
  if (totalLpgKg <= 0) {
    throw new Error('Total LPG kg must be greater than 0');
  }
  return totalExecutionCost / totalLpgKg;
}

serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);

  try {
    // Calculate delivery cost
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

      const totalLpgKg = order.total_lpg_kg;
      const roundTripKm = route.round_trip_km;
      const tripHours = route.estimated_trip_hours;
      const tolls = route.tolls || 0;
      const calcDate = calculation_date || new Date().toISOString().split('T')[0];

      const context = await getOrRecommendVehicle(vehicle.mode, vehicle.vehicle_id);

      const requiredTrips = calculateRequiredTrips(totalLpgKg, context.maximumPayloadKg);
      const runningCost = calculateRunningCost(roundTripKm, context.fuelCostPerKm, requiredTrips);
      const labourCost = calculateLabourCost(
        tripHours,
        requiredTrips,
        context.driverHourlyRate,
        context.assistantHourlyRate,
      );
      const totalExecutionCost = runningCost + labourCost + tolls;
      const deliveryCostPerKg = calculateDeliveryCostPerKg(totalExecutionCost, totalLpgKg);

      const calculationCode = `DEL-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const inputSnapshot = {
        customer_id,
        total_lpg_kg: totalLpgKg,
        round_trip_km: roundTripKm,
        trip_hours: tripHours,
        tolls,
        vehicle_mode: vehicle.mode,
        vehicle_id: vehicle.vehicle_id,
        calculation_date: calcDate,
      };

      const resultSnapshot = {
        vehicle_id: context.vehicleId,
        vehicle_registration: context.vehicleRegistration,
        payload_limit_kg: context.maximumPayloadKg,
        required_trips: requiredTrips,
        running_cost: parseFloat(runningCost.toFixed(2)),
        labour_cost: parseFloat(labourCost.toFixed(2)),
        toll_cost: tolls,
        total_execution_cost: parseFloat(totalExecutionCost.toFixed(2)),
        delivery_cost_per_kg: parseFloat(deliveryCostPerKg.toFixed(4)),
        cost_profile_status: context.costProfileStatus,
        cost_profile_source: context.costProfileSource,
      };

      const { data: calculation } = await supabase
        .from('delivery_cost_calculations')
        .insert({
          calculation_code: calculationCode,
          customer_id,
          calculated_at: new Date().toISOString(),
          calculation_date: calcDate,
          total_lpg_kg: totalLpgKg,
          vehicle_id: context.vehicleId,
          vehicle_selection_mode: vehicle.mode === 'recommend' ? 'RECOMMEND' : 'OVERRIDE',
          vehicle_override_reason: vehicle.override_reason,
          payload_limit_kg: context.maximumPayloadKg,
          required_trips: requiredTrips,
          round_trip_km: roundTripKm,
          trip_hours: tripHours,
          tolls,
          vehicle_cost_profile_id: context.costProfileId,
          running_cost_per_km_snapshot: context.fuelCostPerKm,
          driver_hourly_rate_snapshot: context.driverHourlyRate,
          assistant_hourly_rate_snapshot: context.assistantHourlyRate,
          running_cost: runningCost,
          labour_cost: labourCost,
          toll_cost: tolls,
          total_execution_cost: totalExecutionCost,
          delivery_cost_per_kg: deliveryCostPerKg,
          status: 'CALCULATED',
          warnings: context.costProfileStatus === 'provisional' ? ['Cost profile is provisional; based on legacy rates'] : [],
          input_snapshot: inputSnapshot,
          result_snapshot: resultSnapshot,
        })
        .select()
        .single();

      if (!calculation) throw new Error('Failed to create calculation');

      const status = context.costProfileStatus === 'provisional' ? 'partial' : 'calculated';

      const response = {
        calculation_id: calculation.id,
        status,
        vehicle: {
          vehicle_id: context.vehicleId,
          selection: vehicle.mode,
          maximum_payload_kg: context.maximumPayloadKg,
          registration: context.vehicleRegistration,
        },
        load: {
          total_lpg_kg: totalLpgKg,
          required_trips: requiredTrips,
        },
        route: {
          round_trip_km: roundTripKm,
          trip_hours: tripHours,
        },
        costs: {
          running_cost: parseFloat(runningCost.toFixed(2)),
          labour_cost: parseFloat(labourCost.toFixed(2)),
          tolls,
          total_execution_cost: parseFloat(totalExecutionCost.toFixed(2)),
        },
        allocation: {
          delivery_cost_per_kg: parseFloat(deliveryCostPerKg.toFixed(4)),
        },
        snapshot: {
          vehicle_cost_profile_id: context.costProfileId,
          calculated_at: calculation.calculated_at,
          cost_profile_status: context.costProfileStatus,
          cost_profile_source: context.costProfileSource,
        },
        warnings:
          context.costProfileStatus === 'provisional'
            ? ['Cost profile is provisional; based on legacy rates. Full 004A cost data pending.']
            : [],
      };

      await storeIdempotency(idempotencyKey, response);

      return new Response(JSON.stringify(response), { status: 201 });
    }

    // Get delivery cost calculation
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
          vehicle_cost_profile:vehicle_cost_profiles(*)
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
          maximum_payload_kg: calculation.payload_limit_kg,
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
          tolls: calculation.tolls,
          total_execution_cost: calculation.total_execution_cost,
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
