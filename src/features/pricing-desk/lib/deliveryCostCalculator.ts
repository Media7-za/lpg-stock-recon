import { prisma } from '@/lib/prisma';
import type {
  CalculateDeliveryCostInput,
  CalculateDeliveryCostOutput,
  VehicleSelectionMode,
  CalculationStatus,
} from '../types/deliveryCostCalculator';

interface CalculationContext {
  vehicleId: string;
  vehicleRegistration: string;
  maximumPayloadKg: number;
  costProfileId: string;
  costProfileStatus: 'provisional' | 'published' | 'superseded' | 'archived';
  costProfileSource?: string;
  fuelCostPerKm: number;
  driverHourlyRate: number;
  assistantHourlyRate: number;
}

/**
 * Default provisional costs for known vehicles while full 004A profiles develop.
 * Status: provisional | Source: legacy_pricing_desk_rate
 */
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

const DEFAULT_DRIVER_HOURLY_RATE = 150; // South African Rand estimate
const DEFAULT_ASSISTANT_HOURLY_RATE = 100; // South African Rand estimate

async function getOrRecommendVehicle(
  mode: VehicleSelectionMode,
  vehicleId?: string,
): Promise<CalculationContext> {
  let vehicle;

  if (mode === 'override' && vehicleId) {
    vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        costProfiles: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!vehicle) {
      throw new Error(`Vehicle ${vehicleId} not found`);
    }
  } else {
    // Recommend small vehicle (CS70HKZN) by default
    vehicle = await prisma.vehicle.findFirst({
      where: { registration: 'CS70HKZN' },
      include: {
        costProfiles: {
          where: { status: 'PUBLISHED' },
          orderBy: { publishedAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  if (!vehicle) {
    throw new Error('No suitable vehicle found for calculation');
  }

  // Check if we have a published cost profile
  const publishedProfile = vehicle.costProfiles[0];
  if (publishedProfile) {
    return {
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
      maximumPayloadKg: vehicle.maximumPayloadKg?.toNumber() || 500,
      costProfileId: publishedProfile.id,
      costProfileStatus: publishedProfile.status.toLowerCase() as 'provisional' | 'published' | 'superseded' | 'archived',
      costProfileSource: publishedProfile.source || undefined,
      fuelCostPerKm: publishedProfile.totalRunningCostPerKm?.toNumber() || 0,
      driverHourlyRate: publishedProfile.driverHourlyRate?.toNumber() || DEFAULT_DRIVER_HOURLY_RATE,
      assistantHourlyRate: publishedProfile.assistantHourlyRate?.toNumber() || DEFAULT_ASSISTANT_HOURLY_RATE,
    };
  }

  // Fall back to provisional rate if no published profile exists
  const provisionalRate = PROVISIONAL_VEHICLE_RATES[vehicle.registration];
  if (provisionalRate) {
    // Create a provisional cost profile if one doesn't exist
    let costProfile = await prisma.vehicleCostProfile.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: 'PROVISIONAL',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!costProfile) {
      costProfile = await prisma.vehicleCostProfile.create({
        data: {
          vehicleId: vehicle.id,
          profileCode: `VCP-2026-09-${vehicle.registration}-PROV`,
          status: 'PROVISIONAL',
          source: 'legacy_pricing_desk_rate',
          totalRunningCostPerKm: provisionalRate.r_per_km,
          driverHourlyRate: DEFAULT_DRIVER_HOURLY_RATE,
          assistantHourlyRate: DEFAULT_ASSISTANT_HOURLY_RATE,
        },
      });
    }

    return {
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
      maximumPayloadKg: provisionalRate.payload_kg,
      costProfileId: costProfile.id,
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

  const totalLpgKg = input.order.total_lpg_kg;
  const roundTripKm = input.route.round_trip_km;
  const tripHours = input.route.estimated_trip_hours;
  const tolls = input.route.tolls || 0;
  const calculationDate = input.calculation_date || new Date().toISOString().split('T')[0];

  // Get vehicle and cost profile
  const context = await getOrRecommendVehicle(input.vehicle.mode, input.vehicle.vehicle_id);

  // Calculate required trips
  const requiredTrips = calculateRequiredTrips(totalLpgKg, context.maximumPayloadKg);

  // Calculate costs
  const runningCost = calculateRunningCost(roundTripKm, context.fuelCostPerKm, requiredTrips);
  const labourCost = calculateLabourCost(tripHours, requiredTrips, context.driverHourlyRate, context.assistantHourlyRate);
  const totalExecutionCost = runningCost + labourCost + tolls;
  const deliveryCostPerKg = calculateDeliveryCostPerKg(totalExecutionCost, totalLpgKg);

  // Generate calculation code
  const calculationCode = `DEL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Prepare snapshots
  const inputSnapshot = {
    customer_id: input.customer_id,
    total_lpg_kg: totalLpgKg,
    round_trip_km: roundTripKm,
    trip_hours: tripHours,
    tolls,
    vehicle_mode: input.vehicle.mode,
    vehicle_id: input.vehicle.vehicle_id,
    calculation_date: calculationDate,
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

  // Store calculation in database
  const calculation = await prisma.deliveryCostCalculation.create({
    data: {
      calculationCode,
      customerId: input.customer_id,
      calculatedAt: new Date(),
      calculationDate: new Date(calculationDate),
      totalLpgKg,
      vehicleId: context.vehicleId,
      vehicleSelectionMode: input.vehicle.mode === 'recommend' ? 'RECOMMEND' : 'OVERRIDE',
      vehicleOverrideReason: input.vehicle.override_reason,
      payloadLimitKg: context.maximumPayloadKg,
      requiredTrips,
      roundTripKm,
      tripHours,
      tolls,
      vehicleCostProfileId: context.costProfileId,
      runningCostPerKmSnapshot: context.fuelCostPerKm,
      driverHourlyRateSnapshot: context.driverHourlyRate,
      assistantHourlyRateSnapshot: context.assistantHourlyRate,
      runningCost,
      labourCost,
      tollCost: tolls,
      totalExecutionCost,
      deliveryCostPerKg,
      status: 'CALCULATED',
      warnings: context.costProfileStatus === 'provisional' ? ['Cost profile is provisional; based on legacy rates'] : [],
      inputSnapshot,
      resultSnapshot,
    },
  });

  const status: CalculationStatus = context.costProfileStatus === 'provisional' ? 'partial' : 'calculated';

  return {
    calculation_id: calculation.id,
    status,
    vehicle: {
      vehicle_id: context.vehicleId,
      selection: input.vehicle.mode,
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
      calculated_at: calculation.calculatedAt.toISOString(),
      cost_profile_status: context.costProfileStatus,
      cost_profile_source: context.costProfileSource,
    },
    warnings:
      context.costProfileStatus === 'provisional'
        ? ['Cost profile is provisional; based on legacy rates. Full 004A cost data pending.']
        : [],
  };
}

export async function getDeliveryCostCalculation(calculationId: string): Promise<CalculateDeliveryCostOutput | null> {
  const calculation = await prisma.deliveryCostCalculation.findUnique({
    where: { id: calculationId },
    include: {
      vehicleCostProfile: true,
    },
  });

  if (!calculation) {
    return null;
  }

  return {
    calculation_id: calculation.id,
    status: calculation.status.toLowerCase() as CalculationStatus,
    vehicle: {
      vehicle_id: calculation.vehicleId,
      selection: calculation.vehicleSelectionMode.toLowerCase() as VehicleSelectionMode,
      maximum_payload_kg: calculation.payloadLimitKg.toNumber(),
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
      tolls: calculation.tolls.toNumber(),
      total_execution_cost: calculation.totalExecutionCost.toNumber(),
    },
    allocation: {
      delivery_cost_per_kg: calculation.deliveryCostPerKg.toNumber(),
    },
    snapshot: {
      vehicle_cost_profile_id: calculation.vehicleCostProfileId,
      calculated_at: calculation.calculatedAt.toISOString(),
      cost_profile_status: calculation.vehicleCostProfile.status.toLowerCase() as 'provisional' | 'published' | 'superseded' | 'archived',
      cost_profile_source: calculation.vehicleCostProfile.source || undefined,
    },
    warnings: calculation.warnings,
  };
}
