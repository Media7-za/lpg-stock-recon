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

const addDays = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// ---- customer search (admin form picker) -----------------------------------

async function searchCustomers(q: string) {
  let query = supabase
    .from("commercial_customers")
    .select("id, customer_name, contact_phone")
    .order("customer_name", { ascending: true })
    .limit(20);

  if (q) {
    query = query.ilike("customer_name", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ---- desk list --------------------------------------------------------------

async function listRecords() {
  const { data, error } = await supabase
    .from("outstanding_payments")
    .select("*, commercial_customers(customer_name, primary_contact, contact_phone)")
    .neq("status", "PAID")
    .order("follow_up_date", { ascending: true, nullsFirst: true });
  if (error) throw error;
  return data ?? [];
}

// ---- admin create/update (one running balance per customer) ----------------

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function upsertRecord(body: any) {
  const { commercialCustomerId, amountDue, fileBase64, fileName, contentType } = body;
  if (!commercialCustomerId) throw new Error("commercialCustomerId is required");
  if (amountDue === undefined || amountDue === null || Number.isNaN(Number(amountDue))) {
    throw new Error("amountDue is required and must be a number");
  }

  let statementUrl: string | undefined;
  let statementFilename: string | undefined;

  if (fileBase64 && fileName) {
    const bytes = base64ToBytes(fileBase64);
    const path = `${commercialCustomerId}/${Date.now()}_${fileName}`;
    const { error: uploadErr } = await supabase.storage
      .from("payment-statements")
      .upload(path, bytes, { contentType: contentType || "application/octet-stream", upsert: false });
    if (uploadErr) throw uploadErr;

    const { data: publicUrlData } = supabase.storage.from("payment-statements").getPublicUrl(path);
    statementUrl = publicUrlData.publicUrl;
    statementFilename = fileName;
  }

  const now = new Date().toISOString();
  const record: Record<string, unknown> = {
    commercial_customer_id: commercialCustomerId,
    amount_due: Number(amountDue),
    status: "OUTSTANDING",
    follow_up_date: null,
    updated_at: now,
  };
  if (statementUrl) {
    record.statement_url = statementUrl;
    record.statement_filename = statementFilename;
  }

  const { data, error } = await supabase
    .from("outstanding_payments")
    .upsert(record, { onConflict: "commercial_customer_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- outcomes -----------------------------------------------------------

async function classify(body: any) {
  const { paymentId, outcome, note, followUpDate } = body;
  if (!paymentId) throw new Error("paymentId is required");

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { notes: note ?? null, last_contacted_at: now, updated_at: now };

  switch (outcome) {
    case "PAYMENT_RECEIVED":
      patch.status = "PAID";
      patch.follow_up_date = null;
      break;
    case "STILL_OUTSTANDING":
      patch.status = "OUTSTANDING";
      patch.follow_up_date = followUpDate || addDays(7);
      break;
    case "ESCALATED":
      patch.status = "ESCALATED";
      patch.follow_up_date = followUpDate || null;
      break;
    case "PAYMENT_PLAN_AGREED":
      patch.status = "PAYMENT_PLAN";
      patch.follow_up_date = followUpDate || addDays(14);
      break;
    default:
      throw new Error(`Unknown outcome: ${outcome}`);
  }

  const { data, error } = await supabase
    .from("outstanding_payments")
    .update(patch)
    .eq("id", paymentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---- routing ------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    if (req.method === "GET" && url.pathname.endsWith("/customers")) {
      const q = url.searchParams.get("q") ?? "";
      return json(await searchCustomers(q));
    }

    if (req.method === "GET" && url.pathname.endsWith("/records")) {
      return json(await listRecords());
    }

    if (req.method === "POST" && url.pathname.endsWith("/records")) {
      const body = await req.json();
      return json(await upsertRecord(body), 201);
    }

    if (req.method === "POST" && url.pathname.endsWith("/records/classify")) {
      const body = await req.json();
      return json(await classify(body));
    }

    return json({ error: "Not Found" }, 404);
  } catch (err: any) {
    console.error("[PaymentCollections] Error:", err);
    return json({ error: err.message ?? String(err) }, 400);
  }
});
