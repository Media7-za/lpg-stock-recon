import { describe, it, expect } from 'vitest';
import {
  calculateRequiredTrips,
  calculateRunningCost,
  calculateLabourCost,
  calculateTollCost,
  calculateTotalExecutionCost,
  calculateDeliveryCostPerKg,
  rankVehicleCandidates,
  type VehicleCandidateInput,
} from '../../../../supabase/functions/_shared/deliveryCostMath';

/**
 * These fixtures are the single source of truth for delivery-cost math.
 * Both the TypeScript/Prisma calculator and the Deno edge function import
 * the exact same module under test here — this test suite is the contract
 * that keeps the two runtimes from silently diverging.
 */

describe('Delivery Cost Math — required trips', () => {
  it('Shopline / Dalton: 480kg on a 500kg vehicle needs exactly 1 trip', () => {
    expect(calculateRequiredTrips(480, 500)).toBe(1);
  });

  it('rounds a partial extra trip up, never down', () => {
    // 1200kg over a 500kg payload is 2.4 trips -> must dispatch 3 trips, not 2.
    expect(calculateRequiredTrips(1200, 500)).toBe(3);
  });

  it('an exact multiple of payload needs no extra trip', () => {
    expect(calculateRequiredTrips(1000, 500)).toBe(2);
  });

  it('rejects zero or negative load', () => {
    expect(() => calculateRequiredTrips(0, 500)).toThrow();
    expect(() => calculateRequiredTrips(-10, 500)).toThrow();
  });

  it('rejects zero or negative payload', () => {
    expect(() => calculateRequiredTrips(480, 0)).toThrow();
  });
});

describe('Delivery Cost Math — running cost', () => {
  it('Shopline / Dalton: 98km round trip at the provisional CS70HKZN rate (R3.66/km), 1 trip', () => {
    expect(calculateRunningCost(98, 3.66, 1)).toBeCloseTo(358.68, 2);
  });

  it('scales linearly with required trips', () => {
    expect(calculateRunningCost(98, 3.66, 3)).toBeCloseTo(358.68 * 3, 2);
  });
});

describe('Delivery Cost Math — labour cost', () => {
  it('multiplies trip hours by trips by combined crew rate', () => {
    // 2.5h * 1 trip * (150 + 100) = 625.00
    expect(calculateLabourCost(2.5, 1, 150, 100)).toBeCloseTo(625.0, 2);
  });

  it('scales with required trips, not just hours', () => {
    expect(calculateLabourCost(2.5, 3, 150, 100)).toBeCloseTo(625.0 * 3, 2);
  });
});

describe('Delivery Cost Math — toll cost (per-trip semantics)', () => {
  it('a single trip toll cost equals the per-trip toll figure', () => {
    expect(calculateTollCost(50, 1)).toBe(50);
  });

  it('multiplies toll cost across every required trip — this is the bug the review caught', () => {
    // Previously tolls were charged once regardless of trip count. A 3-trip
    // delivery through the same toll gate pays the toll three times.
    expect(calculateTollCost(50, 3)).toBe(150);
  });

  it('zero tolls stays zero regardless of trip count', () => {
    expect(calculateTollCost(0, 5)).toBe(0);
  });
});

describe('Delivery Cost Math — total execution cost & per-kg allocation', () => {
  it('Shopline / Dalton worked example end to end', () => {
    const requiredTrips = calculateRequiredTrips(480, 500);
    const runningCost = calculateRunningCost(98, 3.66, requiredTrips);
    const labourCost = calculateLabourCost(2.5, requiredTrips, 150, 100);
    const tollCost = calculateTollCost(0, requiredTrips);
    const total = calculateTotalExecutionCost(runningCost, labourCost, tollCost);

    expect(requiredTrips).toBe(1);
    expect(total).toBeCloseTo(983.68, 2);
    expect(calculateDeliveryCostPerKg(total, 480)).toBeCloseTo(2.0493, 4);
  });

  it('rejects a per-kg allocation against zero load', () => {
    expect(() => calculateDeliveryCostPerKg(983.68, 0)).toThrow();
  });
});

describe('Delivery Cost Math — vehicle recommendation ranking', () => {
  const baseCandidate = (overrides: Partial<VehicleCandidateInput>): VehicleCandidateInput => ({
    vehicleId: 'veh-x',
    registration: 'REG-X',
    payloadKg: 500,
    payloadGoverned: true,
    runningCostPerKm: 3.66,
    costProfileId: 'vcp-x',
    costProfileStatus: 'provisional',
    driverHourlyRate: 150,
    assistantHourlyRate: 100,
    labourRatesGoverned: false,
    ...overrides,
  });

  it('never silently always picks the same vehicle — it ranks by actual execution cost', () => {
    const small = baseCandidate({
      vehicleId: 'veh_cs70hkzn',
      registration: 'CS70HKZN',
      payloadKg: 500,
      runningCostPerKm: 3.66,
    });
    const large = baseCandidate({
      vehicleId: 'veh_cs70hmzn',
      registration: 'CS70HMZN',
      payloadKg: 2000,
      runningCostPerKm: 5.67,
    });

    // A 3000kg load needs 6 trips on the small vehicle vs. 2 on the large one —
    // the large vehicle should win despite its higher per-km rate.
    const ranked = rankVehicleCandidates([small, large], 3000, 98, 2.5, 0);
    expect(ranked[0].registration).toBe('CS70HMZN');
    expect(ranked[0].requiredTrips).toBe(2);
    expect(ranked[1].registration).toBe('CS70HKZN');
    expect(ranked[1].requiredTrips).toBe(6);
  });

  it('for a small load within one small-vehicle trip, the small vehicle wins on cost', () => {
    const small = baseCandidate({
      vehicleId: 'veh_cs70hkzn',
      registration: 'CS70HKZN',
      payloadKg: 500,
      runningCostPerKm: 3.66,
    });
    const large = baseCandidate({
      vehicleId: 'veh_cs70hmzn',
      registration: 'CS70HMZN',
      payloadKg: 2000,
      runningCostPerKm: 5.67,
    });

    const ranked = rankVehicleCandidates([small, large], 480, 98, 2.5, 0);
    expect(ranked[0].registration).toBe('CS70HKZN');
  });

  it('is stable and deterministic: same inputs always produce the same order', () => {
    const a = baseCandidate({ vehicleId: 'veh-a', registration: 'A', payloadKg: 500, runningCostPerKm: 3.66 });
    const b = baseCandidate({ vehicleId: 'veh-b', registration: 'B', payloadKg: 1000, runningCostPerKm: 5.67 });

    const first = rankVehicleCandidates([a, b], 900, 98, 2.5, 0);
    const second = rankVehicleCandidates([a, b], 900, 98, 2.5, 0);
    expect(first.map((c) => c.vehicleId)).toEqual(second.map((c) => c.vehicleId));
  });
});
