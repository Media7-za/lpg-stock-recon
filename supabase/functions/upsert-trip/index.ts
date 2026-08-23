// Orders-Module migration, Phase 4 Step 4.
// WRITTEN BUT NOT DEPLOYED — held per instruction until upsert-order (Step 3)
// is confirmed working. Same DATABASE_URL-secret dependency and the same
// unverified-from-this-sandbox caveat apply here; fix that once, not twice.
//
// Atomic create-trip-with-assignments, and single-delivery-to-existing-trip
// assignment, in one function (two modes) — both are the same underlying
// operation (link delivery rows to a trip + log an ASSIGNMENT event), so
// TripAssignmentModal's "assign one delivery to an existing trip" flow also
// goes through this function rather than a separate, less-atomic direct
// write path. Modeled on upsert-order's raw-Postgres-transaction pattern.
//
// Deliberately does NOT touch DeliveryItem/DeliveryReturn/DeliveryProof
// beyond what already exists — Step 5 scope.
import postgres from "npm:postgres@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// DATABASE_URL must be set as a Supabase Edge Function secret — see
// upsert-order/index.ts for the same note. Not confirmed configured in this
// project as of Step 4.
function getDb() {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) throw new Error("[upsert-trip] DATABASE_URL secret is not configured");
  return postgres(url, {
    max: 2,
    ssl: "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

// Ported from Orders-Module's lib/generators.ts generateTripNumber, run
// inside the transaction (same reasoning as upsert-order's
// generateOrderNumber: closes a small pre-existing race window rather than
// reintroducing it).
async function generateTripNumber(sql: postgres.TransactionSql, date: Date): Promise<string> {
  const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const rows = await sql`
    SELECT trip_number FROM trips
    WHERE trip_number LIKE ${dateStr + "-%"}
    ORDER BY trip_number DESC
    LIMIT 1
  `;
  let sequence = 1;
  if (rows.length > 0) {
    const parts = (rows[0].trip_number as string).split("-");
    if (parts.length > 1) sequence = parseInt(parts[1], 10) + 1;
  }
  return `${dateStr}-${String(sequence).padStart(3, "0")}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  let db: ReturnType<typeof getDb> | null = null;

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }

    const mode = body.mode === "assign" ? "assign" : "create";
    db = getDb();

    if (mode === "create") {
      const { driverId, vehicleId, routeId, tripDate, deliveryIds } = body as {
        driverId?: number;
        vehicleId?: number;
        routeId?: number;
        tripDate?: string;
        deliveryIds?: number[];
      };

      if (!vehicleId) return json({ error: "vehicleId is required" }, 400);
      if (!Array.isArray(deliveryIds) || deliveryIds.length === 0) {
        return json({ error: "deliveryIds must be a non-empty array" }, 400);
      }

      const result = await db.begin(async (sql) => {
        // INV-010: reject if vehicle is already on an active trip.
        const conflictRows = await sql`
          SELECT id, trip_number FROM trips
          WHERE vehicle_id = ${vehicleId} AND status IN ('planned', 'in-progress')
          LIMIT 1
        `;
        if (conflictRows.length > 0) {
          throw new HttpError(409, `Vehicle already assigned to an active trip (${conflictRows[0].trip_number})`);
        }

        const tripDateValue = tripDate ? new Date(tripDate) : new Date();
        const tripNumber = await generateTripNumber(sql, tripDateValue);

        const [trip] = await sql`
          INSERT INTO trips (trip_number, driver_id, vehicle_id, route_id, trip_date, status)
          VALUES (${tripNumber}, ${driverId ?? null}, ${vehicleId}, ${routeId ?? null}, ${tripDateValue}, 'planned')
          RETURNING *
        `;

        const affectedOrderIds: number[] = [];
        for (let i = 0; i < deliveryIds.length; i++) {
          const [updated] = await sql`
            UPDATE deliveries
            SET trip_id = ${trip.id}, status = 'assigned', delivery_sequence = ${i + 1}
            WHERE id = ${deliveryIds[i]}
            RETURNING order_id
          `;
          if (updated) affectedOrderIds.push(updated.order_id);
        }

        for (const orderId of affectedOrderIds) {
          await sql`
            INSERT INTO order_events (order_id, type, message)
            VALUES (${orderId}, 'ASSIGNMENT', 'Order assigned to trip')
          `;
        }

        return { trip, assignedDeliveryIds: deliveryIds };
      });

      return json(result, 200);
    }

    // mode === "assign" — a single delivery onto an existing trip
    const { deliveryId, tripId } = body as { deliveryId?: number; tripId?: number };
    if (!deliveryId || !tripId) {
      return json({ error: "deliveryId and tripId are required" }, 400);
    }

    const result = await db.begin(async (sql) => {
      const deliveryRows = await sql`SELECT id, order_id FROM deliveries WHERE id = ${deliveryId}`;
      if (deliveryRows.length === 0) throw new HttpError(404, "Delivery not found");
      const delivery = deliveryRows[0];

      const tripRows = await sql`SELECT id, trip_number FROM trips WHERE id = ${tripId}`;
      if (tripRows.length === 0) throw new HttpError(404, "Trip not found");
      const trip = tripRows[0];

      const [updatedDelivery] = await sql`
        UPDATE deliveries SET trip_id = ${tripId}, status = 'assigned'
        WHERE id = ${deliveryId}
        RETURNING *
      `;

      await sql`
        INSERT INTO order_events (order_id, type, message)
        VALUES (${delivery.order_id}, 'ASSIGNMENT', ${`Delivery #${deliveryId} assigned to Trip ${trip.trip_number}`})
      `;

      return { delivery: updatedDelivery };
    });

    return json(result, 200);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("UPSERT_TRIP_ERROR", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return json({ error: "An unexpected error occurred" }, 500);
  } finally {
    if (db) await db.end();
  }
});
