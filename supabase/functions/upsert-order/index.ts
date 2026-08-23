// Orders-Module migration, Phase 4 Step 3.
// Atomic create/update for Order + OrderItem + OrderEvent, per the confirmed
// architecture rule: "Edge Functions ONLY for atomic multi-table transactions."
// Deliberately does NOT touch Delivery/Trip — that's Step 5's data layer,
// which doesn't exist yet ("form only" scope for this step). Modeled on the
// existing driver-mobile `complete-stop` function's raw-Postgres-transaction
// pattern for true atomicity (a sequence of supabase-js calls would not be
// atomic — see the Step 3 report for why this needed to be an Edge Function
// at all).
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

// DATABASE_URL must be set as a Supabase Edge Function secret:
//   supabase secrets set DATABASE_URL="postgresql://postgres.[ref]:[pass]@[host]:5432/postgres"
// This is a DIFFERENT secret store than local .env / Vercel env vars.
function getDb() {
  const url = Deno.env.get("DATABASE_URL");
  if (!url) throw new Error("[upsert-order] DATABASE_URL secret is not configured");
  return postgres(url, {
    max: 2,
    ssl: "require",
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const TERMINAL_ORDER_STATES = ["delivered", "cancelled"];

interface OrderItemInput {
  productId: string;
  quantity: number;
  notes?: string | null;
}

// Ported from Orders-Module's lib/generators.ts generateOrderNumber, run
// inside the same transaction as the insert (an improvement on the original,
// which read the sequence outside its Prisma $transaction — a small,
// pre-existing race window this closes rather than reintroduces).
async function generateOrderNumber(sql: postgres.TransactionSql, date: Date): Promise<string> {
  const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const rows = await sql`
    SELECT order_number FROM orders
    WHERE order_number LIKE ${dateStr + "-%"}
    ORDER BY order_number DESC
    LIMIT 1
  `;
  let sequence = 1;
  if (rows.length > 0) {
    const parts = (rows[0].order_number as string).split("-");
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

    const mode = body.mode === "update" ? "update" : "create";
    db = getDb();

    if (mode === "create") {
      const { customerId, orderType, requestedDeliveryDate, priority, specialInstructions, items } = body as {
        customerId?: string;
        orderType?: string;
        requestedDeliveryDate?: string | null;
        priority?: string;
        specialInstructions?: string | null;
        items?: OrderItemInput[];
      };

      if (!customerId) return json({ error: "customerId is required" }, 400);
      if (!orderType) return json({ error: "orderType is required" }, 400);
      if (!Array.isArray(items) || items.length === 0) {
        return json({ error: "items must be a non-empty array" }, 400);
      }

      const result = await db.begin(async (sql) => {
        const orderNumber = await generateOrderNumber(sql, new Date());

        const [order] = await sql`
          INSERT INTO orders (order_number, customer_id, order_type, status, requested_delivery_date, priority, special_instructions, updated_at)
          VALUES (
            ${orderNumber},
            ${customerId},
            ${orderType},
            'pending',
            ${requestedDeliveryDate ? new Date(requestedDeliveryDate) : null},
            ${priority || "normal"},
            ${specialInstructions ?? null},
            now()
          )
          RETURNING *
        `;

        const orderItems = [];
        for (const item of items) {
          const [oi] = await sql`
            INSERT INTO order_items (order_id, product_id, quantity_ordered, quantity_remaining, notes)
            VALUES (${order.id}, ${item.productId}, ${item.quantity}, ${item.quantity}, ${item.notes ?? null})
            RETURNING *
          `;
          orderItems.push(oi);
        }

        await sql`
          INSERT INTO order_events (order_id, type, message)
          VALUES (${order.id}, 'CREATION', 'Order created')
        `;

        return { order, orderItems };
      });

      return json(result, 200);
    }

    // mode === "update"
    const { orderId, orderType, requestedDeliveryDate, priority, specialInstructions, status, items } = body as {
      orderId?: number;
      orderType?: string;
      requestedDeliveryDate?: string | null;
      priority?: string;
      specialInstructions?: string | null;
      status?: string;
      items?: OrderItemInput[];
    };

    if (!orderId) return json({ error: "orderId is required" }, 400);
    const normalizedStatus = typeof status === "string" ? status.toLowerCase() : undefined;

    const result = await db.begin(async (sql) => {
      const currentRows = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
      if (currentRows.length === 0) throw new HttpError(404, "Order not found");
      const current = currentRows[0];

      const isStatusTransition = !!normalizedStatus;
      if (isStatusTransition && TERMINAL_ORDER_STATES.includes(String(current.status).toLowerCase())) {
        throw new HttpError(400, "Cannot change status of an order in a terminal state");
      }

      const isEdit = !normalizedStatus && (
        orderType !== undefined || items !== undefined || requestedDeliveryDate !== undefined ||
        priority !== undefined || specialInstructions !== undefined
      );
      if (isEdit && !["pending", "assigned"].includes(String(current.status).toLowerCase())) {
        throw new HttpError(400, "Order cannot be edited in its current status");
      }

      const [order] = await sql`
        UPDATE orders SET
          order_type = ${orderType ?? sql`order_type`},
          requested_delivery_date = ${requestedDeliveryDate !== undefined
            ? (requestedDeliveryDate ? new Date(requestedDeliveryDate) : null)
            : sql`requested_delivery_date`},
          priority = ${priority ?? sql`priority`},
          special_instructions = ${specialInstructions !== undefined ? specialInstructions : sql`special_instructions`},
          status = ${normalizedStatus ?? sql`status`},
          updated_at = now()
        WHERE id = ${orderId}
        RETURNING *
      `;

      let orderItems: unknown[] | null = null;
      if (Array.isArray(items)) {
        await sql`DELETE FROM order_items WHERE order_id = ${orderId}`;
        orderItems = [];
        for (const item of items) {
          const [oi] = await sql`
            INSERT INTO order_items (order_id, product_id, quantity_ordered, quantity_remaining, notes)
            VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.quantity}, ${item.notes ?? null})
            RETURNING *
          `;
          orderItems.push(oi);
        }
      }

      const eventType = isEdit ? "UPDATE" : (normalizedStatus === "cancelled" ? "CANCELLED" : "UPDATE");
      const eventMessage = isEdit ? "Order updated through Edit UI" : `Order status changed to ${normalizedStatus}`;
      await sql`INSERT INTO order_events (order_id, type, message) VALUES (${orderId}, ${eventType}, ${eventMessage})`;

      return { order, orderItems };
    });

    return json(result, 200);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("UPSERT_ORDER_ERROR", err instanceof Error ? { message: err.message, stack: err.stack } : err);
    return json({ error: "An unexpected error occurred" }, 500);
  } finally {
    if (db) await db.end();
  }
});
