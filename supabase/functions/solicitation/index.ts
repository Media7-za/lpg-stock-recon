import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const addDaysTo = (isoDate: string, n: number) => {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// ---- rulebook -------------------------------------------------------------

async function getRulebook() {
  const { data, error } = await supabase
    .from("app_config")
    .select("config_data")
    .eq("config_key", "SOLICITATION_RULEBOOK")
    .single();
  if (error) throw error;
  return data.config_data as Record<string, any>;
}

// ---- last-order lookups (commercial_customer_last_order view) -------------

async function getLastLpgOrderDate(customerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("commercial_customer_last_order")
    .select("last_lpg_order_date")
    .eq("commercial_customer_id", customerId)
    .maybeSingle();
  if (error) throw error;
  return data?.last_lpg_order_date ?? null;
}

async function attachLastOrderDates<T extends { commercial_customer_id: string }>(
  rows: T[],
): Promise<(T & { last_lpg_order_date: string | null })[]> {
  const ids = [...new Set(rows.map((r) => r.commercial_customer_id))];
  if (ids.length === 0) return rows as (T & { last_lpg_order_date: string | null })[];

  const { data, error } = await supabase
    .from("commercial_customer_last_order")
    .select("commercial_customer_id, last_lpg_order_date")
    .in("commercial_customer_id", ids);
  if (error) throw error;

  const map = new Map((data ?? []).map((d) => [d.commercial_customer_id, d.last_lpg_order_date]));
  return rows.map((r) => ({ ...r, last_lpg_order_date: map.get(r.commercial_customer_id) ?? null }));
}

// ---- ON_HOLD auto-lift ------------------------------------------------------
// Rulebook: on_hold_auto_lift - before computing any push, check every ON_HOLD
// row for a new Invoice-type transaction_items row (any product) dated after
// the row's updated_at. If found, fall the row back through normal
// commercial_status/desk-routing logic.

async function liftEligibleHolds() {
  const { data: holds, error } = await supabase
    .from("solicitation_queue")
    .select("id, commercial_customer_id, updated_at, commercial_customers(commercial_status, avg_cycle_days)")
    .eq("status", "ON_HOLD");
  if (error) throw error;
  if (!holds || holds.length === 0) return;

  for (const row of holds as any[]) {
    const { data: accounts, error: acctErr } = await supabase
      .from("commercial_customer_accounts")
      .select("account_no")
      .eq("commercial_customer_id", row.commercial_customer_id);
    if (acctErr) throw acctErr;
    const accountNos = (accounts ?? []).map((a) => a.account_no);
    if (accountNos.length === 0) continue;

    const { data: newInvoices, error: txErr } = await supabase
      .from("transaction_items")
      .select("tx_date")
      .in("account_no", accountNos)
      .eq("entry_type", "Invoice")
      .gt("tx_date", row.updated_at)
      .limit(1);
    if (txErr) throw txErr;
    if (!newInvoices || newInvoices.length === 0) continue;

    const cc = row.commercial_customers;
    let newStatus = "PENDING";
    let dueDate = today();
    if (cc?.commercial_status === "win_back") {
      newStatus = "LEAD";
    } else {
      const lastOrder = await getLastLpgOrderDate(row.commercial_customer_id);
      const avgCycle = cc?.avg_cycle_days ?? 16;
      dueDate = lastOrder ? addDaysTo(lastOrder, avgCycle) : addDays(avgCycle);
    }

    const { error: updErr } = await supabase
      .from("solicitation_queue")
      .update({ status: newStatus, predicted_due_date: dueDate, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) throw updErr;
  }
}

// ---- desk queries -----------------------------------------------------------

async function fetchDesk(status: "PENDING" | "LEAD" | "REVIEW_FLAGGED") {
  await liftEligibleHolds();

  let query = supabase
    .from("solicitation_queue")
    .select("*, commercial_customers(*)")
    .eq("status", status)
    .order("predicted_due_date", { ascending: true });

  if (status === "PENDING") {
    query = query.lte("predicted_due_date", today());
  }

  const { data, error } = await query;
  if (error) throw error;

  const withLastOrder = await attachLastOrderDates((data ?? []) as any[]);
  return withLastOrder;
}

// ---- classify (operator reply -> effect) ------------------------------------

const touchQueue = async (queueId: string, replyText: string, extra: Record<string, unknown> = {}) => {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("solicitation_queue")
    .update({ notes: replyText, last_contacted_at: now, updated_at: now, ...extra })
    .eq("id", queueId);
  if (error) throw error;
};

const requireStatus = (queueRow: any, expected: string, intent: string) => {
  if (queueRow.status !== expected) {
    throw new Error(`${intent} is only valid on a ${expected} queue row (row ${queueRow.id} is ${queueRow.status})`);
  }
};

async function insertNextPendingCycle(commercialCustomerId: string) {
  const { data: cust, error: custErr } = await supabase
    .from("commercial_customers")
    .select("avg_cycle_days")
    .eq("id", commercialCustomerId)
    .single();
  if (custErr) throw custErr;

  const nextDue = addDays(cust.avg_cycle_days ?? 16);
  const { error } = await supabase
    .from("solicitation_queue")
    .insert({ commercial_customer_id: commercialCustomerId, predicted_due_date: nextDue, status: "PENDING" });
  if (error) throw error;
}

async function classify(body: any) {
  const { queueId, intent, replyText, nDays, name, phone, commercialCustomerId } = body;

  const rulebook = await getRulebook();
  if (!rulebook.intents?.[intent]) {
    throw new Error(`Unknown intent: ${intent}`);
  }

  if (intent === "UPDATE_CONTACT") {
    if (!commercialCustomerId) throw new Error("UPDATE_CONTACT requires commercialCustomerId");
    const { error } = await supabase
      .from("commercial_customers")
      .update({ primary_contact: name, contact_phone: phone, updated_at: new Date().toISOString() })
      .eq("id", commercialCustomerId);
    if (error) throw error;
    return { ok: true, intent };
  }

  if (!queueId) throw new Error(`${intent} requires queueId`);
  const { data: queueRow, error: queueErr } = await supabase
    .from("solicitation_queue")
    .select("*")
    .eq("id", queueId)
    .single();
  if (queueErr) throw queueErr;

  const customerId = queueRow.commercial_customer_id;
  const now = new Date().toISOString();

  switch (intent) {
    case "SNOOZE": {
      await touchQueue(queueId, replyText, { predicted_due_date: addDays(nDays ?? 7) });
      break;
    }

    case "NO_ANSWER": {
      await touchQueue(queueId, replyText, { predicted_due_date: addDays(1) });
      break;
    }

    case "ORDERED": {
      await touchQueue(queueId, replyText, { status: "ORDERED" });
      await insertNextPendingCycle(customerId);
      break;
    }

    case "LEAD_CONVERTED": {
      requireStatus(queueRow, "LEAD", intent);
      await touchQueue(queueId, replyText, { status: "ORDERED" });
      await insertNextPendingCycle(customerId);
      break;
    }

    case "DECLINED": {
      await touchQueue(queueId, replyText, { status: "DECLINED" });
      const { error } = await supabase
        .from("commercial_customers")
        .update({ commercial_status: "lost", updated_at: now })
        .eq("id", customerId);
      if (error) throw error;
      break;
    }

    case "LEAD_DEAD": {
      requireStatus(queueRow, "LEAD", intent);
      await touchQueue(queueId, replyText, { status: "DECLINED" });
      const { error } = await supabase
        .from("commercial_customers")
        .update({ commercial_status: "lost", updated_at: now })
        .eq("id", customerId);
      if (error) throw error;
      break;
    }

    case "LEAD_CONTACTED": {
      requireStatus(queueRow, "LEAD", intent);
      await touchQueue(queueId, replyText, { predicted_due_date: addDays(14) });
      break;
    }

    case "LEAD_INTERESTED": {
      requireStatus(queueRow, "LEAD", intent);
      await touchQueue(queueId, replyText, { predicted_due_date: addDays(3) });
      break;
    }

    case "ACCOUNT_ON_HOLD": {
      await touchQueue(queueId, replyText, { status: "ON_HOLD" });
      break;
    }

    case "IGNORE_INDIVIDUAL": {
      await touchQueue(queueId, replyText, { status: "DECLINED" });
      const { error } = await supabase
        .from("commercial_customers")
        .update({ commercial_status: "lost", updated_at: now })
        .eq("id", customerId);
      if (error) throw error;
      break;
    }

    case "CONFIRM_BUSINESS": {
      requireStatus(queueRow, "REVIEW_FLAGGED", intent);
      const { data: cust, error: custErr } = await supabase
        .from("commercial_customers")
        .select("avg_cycle_days")
        .eq("id", customerId)
        .single();
      if (custErr) throw custErr;
      const lastOrder = await getLastLpgOrderDate(customerId);
      const avgCycle = cust.avg_cycle_days ?? 16;
      const dueDate = lastOrder ? addDaysTo(lastOrder, avgCycle) : addDays(avgCycle);
      await touchQueue(queueId, replyText, { status: "PENDING", predicted_due_date: dueDate });
      break;
    }

    case "CLARIFY": {
      return { ok: true, intent, message: "No changes made — clarification needed, ask a follow-up question." };
    }

    default:
      throw new Error(`Intent ${intent} has no classify handler implemented`);
  }

  return { ok: true, intent, queueId };
}

// ---- routing ------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    if (req.method === "GET" && url.pathname.endsWith("/rulebook")) {
      return json(await getRulebook());
    }

    if (req.method === "GET" && url.pathname.endsWith("/targets")) {
      return json(await fetchDesk("PENDING"));
    }

    if (req.method === "GET" && url.pathname.endsWith("/leads")) {
      return json(await fetchDesk("LEAD"));
    }

    if (req.method === "GET" && url.pathname.endsWith("/review")) {
      return json(await fetchDesk("REVIEW_FLAGGED"));
    }

    if (req.method === "POST" && url.pathname.endsWith("/classify")) {
      const body = await req.json();
      const result = await classify(body);
      return json(result);
    }

    return json({ error: "Not Found" }, 404);
  } catch (err: any) {
    console.error("[Solicitation] Error:", err);
    return json({ error: err.message ?? String(err) }, 400);
  }
});
