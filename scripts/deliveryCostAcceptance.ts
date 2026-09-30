/**
 * Delivery Cost Calculator — database acceptance pass.
 *
 * A manual diagnostic, not part of `npm test`. ISOLATED TEST DATABASES ONLY.
 * It applies the operational fleet seed (insert-only), creates temporary test
 * vehicles/profiles/calculations and deletes them again. It refuses to run
 * unless ACCEPTANCE_ISOLATED_DB=1 is set, and it always refuses Supabase-hosted
 * databases (*.supabase.co, *.supabase.com, the live project ref), even with the flag.
 *
 *   DATABASE_URL=postgresql://…@localhost:5432/scratch DIRECT_URL=… \
 *   npx prisma migrate deploy && \
 *   ACCEPTANCE_ISOLATED_DB=1 npx tsx scripts/deliveryCostAcceptance.ts
 *
 * The real fleet rows (CS70HKZN / CS70HMZN and their cost profiles) are never
 * modified: temporal and snapshot-immutability scenarios use temporary, inactive
 * test vehicles, and a before/after fingerprint of the real fleet rows is asserted.
 *
 * Runs the 10 scenarios from the v0 hardening review directly against the
 * calculator's Prisma-backed engine (calculateDeliveryCost /
 * getDeliveryCostCalculation) and a real database — not mocks. Exits
 * non-zero if any scenario fails.
 *
 * Scope note: this exercises the TypeScript/Prisma engine, not the Deno
 * edge function's HTTP surface (no Deno runtime available in most CI/dev
 * environments). Both engines import the identical
 * supabase/functions/_shared/deliveryCostMath.ts module, and a dedicated
 * contract test suite (src/features/pricing-desk/lib/deliveryCostMath.test.ts)
 * proves that module's behaviour — so a pass here is strong evidence for the
 * edge function too, but it is not a substitute for an actual HTTP call
 * against a deployed function.
 */
import { prisma } from '../src/lib/prisma';
import { calculateDeliveryCost, getDeliveryCostCalculation } from '../src/features/pricing-desk/lib/deliveryCostCalculator';
import { readFileSync } from 'node:fs';

// ---- production guard: runs before any database access ----
const LIVE_PROJECT_REFS = ['oqhpxnaadahohwkslive'];
function assertIsolatedDatabase() {
  if (process.env.ACCEPTANCE_ISOLATED_DB !== '1') {
    console.error('REFUSING TO RUN: set ACCEPTANCE_ISOLATED_DB=1 to confirm DATABASE_URL points at an isolated, disposable test database.');
    process.exit(2);
  }
  for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
    const raw = process.env[name];
    if (!raw) continue;
    let host = '';
    let user = '';
    try {
      const u = new URL(raw);
      host = u.hostname.toLowerCase();
      user = decodeURIComponent(u.username).toLowerCase();
    } catch {
      console.error(`REFUSING TO RUN: ${name} is not a parseable URL.`);
      process.exit(2);
    }
    const hostile =
      /(^|\.)supabase\.(co|com|net|in)$/.test(host) ||
      host.includes('pooler.supabase') ||
      LIVE_PROJECT_REFS.some((ref) => host.includes(ref) || user.includes(ref));
    if (hostile) {
      console.error(`REFUSING TO RUN: ${name} host "${host}" is a Supabase-hosted database. This script is for isolated test databases only.`);
      process.exit(2);
    }
  }
}
assertIsolatedDatabase();

// Real fleet rows: fingerprinted before/after; must never change.
const REAL_FLEET_VEHICLE_IDS = ['veh_cs70hkzn', 'veh_cs70hmzn'];
async function realFleetFingerprint(): Promise<string> {
  const rows = await prisma.$queryRawUnsafe<{ h: string }[]>(
    `SELECT md5(coalesce((SELECT string_agg(v::text, '|' ORDER BY v.id) FROM delivery_vehicles v WHERE v.id = ANY($1)), '') || '#' ||
                coalesce((SELECT string_agg(p::text, '|' ORDER BY p.id) FROM delivery_vehicle_cost_profiles p WHERE p.vehicle_id = ANY($1)), '')) AS h`,
    REAL_FLEET_VEHICLE_IDS,
  );
  return rows[0].h;
}
const createdCalculationIds: string[] = [];
function track<T extends { calculation_id: string }>(r: T): T {
  createdCalculationIds.push(r.calculation_id);
  return r;
}

async function applyOperationalSeed() {
  const sql = readFileSync(new URL('../prisma/seeds/20260904_delivery_fleet_provisional.sql', import.meta.url), 'utf8')
    .split('\n').filter((l) => !l.trimStart().startsWith('--')).join('\n');
  for (const stmt of sql.split(';').map((x) => x.trim()).filter(Boolean)) {
    // Insert-only and idempotent: never overwrite governed fleet values.
    if (!/^INSERT\s/i.test(stmt) || !/ON CONFLICT\s*\([^)]*\)\s*DO NOTHING\s*$/i.test(stmt)) {
      throw new Error(`Seed statement is not insert-only/idempotent (INSERT … ON CONFLICT … DO NOTHING): ${stmt.slice(0, 80)}…`);
    }
    await prisma.$executeRawUnsafe(stmt);
  }
}

let passed = 0;
let failed = 0;

function ok(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function expectThrows(label: string, fn: () => Promise<unknown>) {
  try {
    await fn();
    ok(label, false, 'expected an error, got a result instead');
  } catch (err) {
    ok(label, true, `threw as expected: ${(err as Error).message}`);
  }
}

async function main() {
  await applyOperationalSeed();
  const fleetBaseline = await realFleetFingerprint();
  console.log(`Real fleet fingerprint (baseline): ${fleetBaseline}`);
  const cs70hkzn = await prisma.vehicle.findUniqueOrThrow({ where: { registration: 'CS70HKZN' } });
  console.log('\n=== Scenario 3: Shopline / Dalton against the pure-math expectation ===');
  const shopline = track(await calculateDeliveryCost({
    customer_id: 'SHOPLINE001',
    order: { total_lpg_kg: 480 },
    route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: { mode: 'recommend' },
  }));
  ok('vehicle recommended is CS70HKZN', shopline.vehicle.registration === 'CS70HKZN');
  ok('required_trips === 1', shopline.load.required_trips === 1);
  ok('running_cost === 358.68', Math.abs(shopline.costs.running_cost - 358.68) < 0.01, String(shopline.costs.running_cost));
  ok(
    'total_execution_cost matches pure-math (labour uses assumed 150+100 rate)',
    Math.abs(shopline.costs.total_execution_cost - 983.68) < 0.01,
    String(shopline.costs.total_execution_cost),
  );
  ok(
    'delivery_cost_per_kg ≈ 2.0493',
    Math.abs(shopline.allocation.delivery_cost_per_kg - 2.0493) < 0.001,
    String(shopline.allocation.delivery_cost_per_kg),
  );
  ok('status is partial (provisional profile + unconfirmed payload/labour)', shopline.status === 'partial');
  ok('labour_rates_governed === false', shopline.costs.labour_rates_governed === false);
  ok('warnings mention provisional cost profile', shopline.warnings.some((w) => w.includes('provisional')));
  const persisted = await prisma.deliveryCostCalculation.findUnique({ where: { id: shopline.calculation_id } });
  ok('calculation actually persisted to DB', persisted !== null);
  ok(
    'persisted delivery_cost_per_kg matches API response',
    persisted != null && Math.abs(persisted.deliveryCostPerKg.toNumber() - shopline.allocation.delivery_cost_per_kg) < 0.0001,
  );

  console.log('\n=== Scenario 4: a future-dated cost profile must not affect a historical calculation (temporary test vehicle) ===');
  // Uses a clearly-identified temporary vehicle, never the real fleet. It is
  // 'inactive' so it can never compete in recommend mode; it is reached only
  // via override. Recommended payload only, so payload stays ungoverned.
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const temporalVehicle = await prisma.vehicle.create({
    data: { registration: 'TEST-TEMPORAL-ACCEPT', vehicleType: 'test_fixture', activeStatus: 'inactive', recommendedPayloadKg: 500 },
  });
  const temporalCurrent = await prisma.vehicleCostProfile.create({
    data: {
      vehicleId: temporalVehicle.id, profileCode: `VCP-ACCEPTANCE-TEMPORAL-CURRENT-${Date.now()}`,
      status: 'PROVISIONAL', source: 'acceptance_test_fixture', totalRunningCostPerKm: 3.66,
      effectiveFrom: new Date(`${todayStr}T00:00:00.000Z`),
    },
  });
  const temporalFuture = await prisma.vehicleCostProfile.create({
    data: {
      vehicleId: temporalVehicle.id, profileCode: `VCP-ACCEPTANCE-TEMPORAL-FUTURE-${Date.now()}`,
      status: 'PUBLISHED', source: 'acceptance_test_future_rate', totalRunningCostPerKm: 9.99,
      driverHourlyRate: 200, assistantHourlyRate: 120, publishedAt: new Date(),
      effectiveFrom: new Date(`${tomorrowStr}T00:00:00.000Z`),
    },
  });
  const temporalOverride = { mode: 'override' as const, vehicle_id: temporalVehicle.id, override_reason: 'acceptance test: temporal' };
  const todayCalc = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 480 }, route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: temporalOverride, calculation_date: todayStr,
  }));
  ok(
    "today's calculation resolves the current R3.66/km profile, not tomorrow's R9.99",
    todayCalc.snapshot.vehicle_cost_profile_id === temporalCurrent.id && Math.abs(todayCalc.costs.running_cost - 358.68) < 0.01,
    `profile=${todayCalc.snapshot.vehicle_cost_profile_id} running_cost=${todayCalc.costs.running_cost}`,
  );
  const futureCalc = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 480 }, route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: temporalOverride, calculation_date: tomorrowStr,
  }));
  ok(
    "tomorrow's calculation resolves the future R9.99/km PUBLISHED profile",
    futureCalc.snapshot.vehicle_cost_profile_id === temporalFuture.id && Math.abs(futureCalc.costs.running_cost - 98 * 9.99) < 0.01,
    `profile=${futureCalc.snapshot.vehicle_cost_profile_id} running_cost=${futureCalc.costs.running_cost}`,
  );
  ok('future calculation reports labour_rates_governed=true (the future profile sets both rates)', futureCalc.costs.labour_rates_governed === true);
  // Payload governance is independent of cost-profile governance: the test
  // vehicle has only a recommended payload, so status must stay 'partial'.
  ok(
    'status correctly stays partial — payload governance is independent of cost-profile governance',
    futureCalc.status === 'partial' && futureCalc.warnings.some((w) => w.includes('payload')),
    `status=${futureCalc.status} warnings=${JSON.stringify(futureCalc.warnings)}`,
  );

  console.log('\n=== Scenario 5: changing a profile after the fact must not alter a stored snapshot (temporary test vehicle) ===');
  const snapVehicle = await prisma.vehicle.create({
    data: { registration: 'TEST-SNAPSHOT-ACCEPT', vehicleType: 'test_fixture', activeStatus: 'inactive', maximumPayloadKg: 500 },
  });
  const snapProfile = await prisma.vehicleCostProfile.create({
    data: {
      vehicleId: snapVehicle.id, profileCode: `VCP-ACCEPTANCE-SNAPSHOT-${Date.now()}`,
      status: 'PROVISIONAL', source: 'acceptance_test_fixture', totalRunningCostPerKm: 3.66,
    },
  });
  const snapshotCalc = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 480 }, route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: { mode: 'override', vehicle_id: snapVehicle.id, override_reason: 'acceptance test: snapshot' },
  }));
  const storedBefore = await prisma.deliveryCostCalculation.findUniqueOrThrow({ where: { id: snapshotCalc.calculation_id } });
  const baselineRow = JSON.stringify(storedBefore);
  console.log(`  baseline: calc=${snapshotCalc.calculation_id} per_kg=${snapshotCalc.allocation.delivery_cost_per_kg} running=${snapshotCalc.costs.running_cost} profile=${snapProfile.id}@3.66`);
  await prisma.vehicleCostProfile.update({ where: { id: snapProfile.id }, data: { totalRunningCostPerKm: 999 } });
  const reread = await getDeliveryCostCalculation(snapshotCalc.calculation_id);
  const storedAfter = await prisma.deliveryCostCalculation.findUniqueOrThrow({ where: { id: snapshotCalc.calculation_id } });
  ok(
    'getDeliveryCostCalculation returns the original delivery_cost_per_kg after the profile changed to R999/km',
    reread !== null && Math.abs(reread.allocation.delivery_cost_per_kg - snapshotCalc.allocation.delivery_cost_per_kg) < 0.0001,
    `original=${snapshotCalc.allocation.delivery_cost_per_kg} reread=${reread?.allocation.delivery_cost_per_kg}`,
  );
  ok(
    'reread running_cost unchanged (not recomputed at 999/km)',
    reread !== null && Math.abs(reread.costs.running_cost - snapshotCalc.costs.running_cost) < 0.01,
    `running_cost=${reread?.costs.running_cost}`,
  );
  ok('stored calculation row is byte-identical before/after the profile edit', baselineRow === JSON.stringify(storedAfter));

  console.log('\n=== Scenario 6: multi-trip load — recommender must choose the cheaper vehicle, not the smaller one by default ===');
  // CS70HMZN's real payload is genuinely unconfirmed, so it's correctly
  // excluded from auto-recommendation (see scenario 2). To exercise the
  // ranking logic itself we seed two throwaway, clearly-fake test vehicles
  // rather than inventing a payload figure for the real fleet — and delete
  // them again at the end of this run.
  const testSmall = await prisma.vehicle.create({
    data: { registration: 'TEST-SMALL-ACCEPT', vehicleType: 'test_fixture', maximumPayloadKg: 500 },
  });
  const testSmallProfile = await prisma.vehicleCostProfile.create({
    data: {
      vehicleId: testSmall.id,
      profileCode: `VCP-ACCEPTANCE-TEST-SMALL-${Date.now()}`,
      status: 'PUBLISHED',
      source: 'acceptance_test_fixture',
      totalRunningCostPerKm: 3.66,
      driverHourlyRate: 150,
      assistantHourlyRate: 100,
      publishedAt: new Date(),
    },
  });
  const testLarge = await prisma.vehicle.create({
    data: { registration: 'TEST-LARGE-ACCEPT', vehicleType: 'test_fixture', maximumPayloadKg: 2000 },
  });
  const testLargeProfile = await prisma.vehicleCostProfile.create({
    data: {
      vehicleId: testLarge.id,
      profileCode: `VCP-ACCEPTANCE-TEST-LARGE-${Date.now()}`,
      status: 'PUBLISHED',
      source: 'acceptance_test_fixture',
      totalRunningCostPerKm: 5.67,
      driverHourlyRate: 150,
      assistantHourlyRate: 100,
      publishedAt: new Date(),
    },
  });
  const multiTrip = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 3000 },
    route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: { mode: 'recommend' },
  }));
  ok(
    '3000kg load picks the large test vehicle (2 trips) over the small one (6 trips)',
    multiTrip.vehicle.registration === 'TEST-LARGE-ACCEPT',
    `chose ${multiTrip.vehicle.registration}`,
  );
  ok('required_trips === 2 for the chosen vehicle', multiTrip.load.required_trips === 2, String(multiTrip.load.required_trips));
  ok(
    'alternatives_considered includes the small test vehicle with 6 trips',
    multiTrip.vehicle.alternatives_considered.some((a) => a.registration === 'TEST-SMALL-ACCEPT' && a.required_trips === 6),
    JSON.stringify(multiTrip.vehicle.alternatives_considered),
  );
  ok(
    'status reaches "calculated" (not stuck at "partial" forever) once every governance dimension is met',
    multiTrip.status === 'calculated' && multiTrip.warnings.length === 0,
    `status=${multiTrip.status} warnings=${JSON.stringify(multiTrip.warnings)}`,
  );

  console.log('\n=== Scenario 7: tolls_per_trip on a multi-trip job ===');
  const tollsMultiTrip = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 1200 }, // 3 trips at 500kg payload
    route: { round_trip_km: 98, estimated_trip_hours: 2.5, tolls_per_trip: 50 },
    vehicle: { mode: 'override', vehicle_id: cs70hkzn.id, override_reason: 'acceptance test: toll scaling' },
  }));
  ok('required_trips === 3', tollsMultiTrip.load.required_trips === 3, String(tollsMultiTrip.load.required_trips));
  ok(
    'toll_cost === 150 (R50/trip × 3 trips), not 50',
    Math.abs(tollsMultiTrip.costs.toll_cost - 150) < 0.01,
    String(tollsMultiTrip.costs.toll_cost),
  );

  console.log('\n=== Scenario 8: missing labour rates surface governance flags ===');
  ok(
    "Shopline/Dalton calc (CS70HKZN, ungoverned labour rates) reports labour_rates_governed=false",
    shopline.costs.labour_rates_governed === false,
  );
  ok(
    'warnings name the exact assumed rates used',
    shopline.warnings.some((w) => w.includes('R150') && w.includes('R100')),
    JSON.stringify(shopline.warnings),
  );

  console.log('\n=== Scenario 9: vehicle override reason persists ===');
  const overrideCalc = track(await calculateDeliveryCost({
    order: { total_lpg_kg: 480 },
    route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
    vehicle: { mode: 'override', vehicle_id: cs70hkzn.id, override_reason: 'Customer requested small vehicle' },
  }));
  ok('vehicle.selection === "override"', overrideCalc.vehicle.selection === 'override');
  ok(
    'vehicle.reason echoes the override reason',
    overrideCalc.vehicle.reason.includes('Customer requested small vehicle'),
    overrideCalc.vehicle.reason,
  );
  const overridePersisted = await prisma.deliveryCostCalculation.findUnique({ where: { id: overrideCalc.calculation_id } });
  ok(
    'vehicle_override_reason column persisted verbatim',
    overridePersisted?.vehicleOverrideReason === 'Customer requested small vehicle',
    overridePersisted?.vehicleOverrideReason ?? 'null',
  );

  console.log('\n=== Scenario 10: no valid effective profile fails clearly, never invents one ===');
  const orphanVehicle = await prisma.vehicle.create({
    data: { registration: 'TEST-NO-PROFILE-ACCEPT', vehicleType: 'test_fixture', maximumPayloadKg: 500 },
  });
  await expectThrows('override against a vehicle with zero cost profiles throws (not a fabricated rate)', () =>
    calculateDeliveryCost({
      order: { total_lpg_kg: 480 },
      route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
      vehicle: { mode: 'override', vehicle_id: orphanVehicle.id, override_reason: 'acceptance test' },
    }),
  );
  const noPayloadVehicle = await prisma.vehicle.create({
    data: { registration: 'TEST-NO-PAYLOAD-ACCEPT', vehicleType: 'test_fixture' },
  });
  await expectThrows('override against a vehicle with no confirmed payload throws unless override_payload_kg is given', () =>
    calculateDeliveryCost({
      order: { total_lpg_kg: 480 },
      route: { round_trip_km: 98, estimated_trip_hours: 2.5 },
      vehicle: { mode: 'override', vehicle_id: noPayloadVehicle.id },
    }),
  );

  // --- cleanup: remove every record this run created ---
  console.log('\n=== Cleanup ===');
  const tempVehicleIds = [testSmall.id, testLarge.id, orphanVehicle.id, noPayloadVehicle.id, temporalVehicle.id, snapVehicle.id];
  const delCalcs = await prisma.deliveryCostCalculation.deleteMany({
    where: { OR: [{ id: { in: createdCalculationIds } }, { vehicleId: { in: tempVehicleIds } }] },
  });
  const delProfiles = await prisma.vehicleCostProfile.deleteMany({ where: { vehicleId: { in: tempVehicleIds } } });
  const delVehicles = await prisma.vehicle.deleteMany({ where: { id: { in: tempVehicleIds } } });
  const leftover = await prisma.vehicle.count({ where: { registration: { startsWith: 'TEST-' } } });
  const leftoverCalcs = await prisma.deliveryCostCalculation.count({ where: { id: { in: createdCalculationIds } } });
  console.log(`  deleted: ${delCalcs.count} calculations (${createdCalculationIds.length} tracked), ${delProfiles.count} profiles, ${delVehicles.count} vehicles`);
  ok('cleanup complete: no TEST-* vehicles and no tracked calculations remain', leftover === 0 && leftoverCalcs === 0, `vehicles=${leftover} calcs=${leftoverCalcs}`);
  const fleetAfter = await realFleetFingerprint();
  console.log(`Real fleet fingerprint (after):    ${fleetAfter}`);
  ok('real fleet rows (CS70HKZN/CS70HMZN + their cost profiles) unchanged by the whole run', fleetAfter === fleetBaseline);

  console.log(`\n=== Result: ${passed} passed, ${failed} failed ===\n`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Acceptance run crashed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
