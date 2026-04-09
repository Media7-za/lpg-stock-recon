import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";
import { assertValidTransition } from "../_shared/services/stateService.ts";
import { logAudit } from "../_shared/services/auditService.ts";

serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  try {
    if (method === "POST" && url.pathname.endsWith("/start")) {
      const { date, idempotencyKey } = await req.json();
      
      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(JSON.stringify(existing), { status: 200 });

      const { data, error } = await supabase
        .from("sessions")
        .insert({ date, current_state: "OPEN" })
        .select()
        .single();
      
      if (error) throw error;
      
      const response = { sessionId: data.id };
      await storeIdempotency(idempotencyKey, response);
      await logAudit({
        session_id: data.id,
        action: "startCountSession",
        from_state: "[*]",
        to_state: "OPEN",
        metadata: { date }
      });

      return new Response(JSON.stringify(response), { status: 201 });
    }

    if (method === "POST" && sessionId && url.pathname.endsWith("/close")) {
      const { idempotencyKey } = await req.json();
      
      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(null, { status: 204 });

      const { data: session } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (!session) throw { code: "SESSION_NOT_FOUND" };

      assertValidTransition(session.current_state, "CLOSED");
      
      const { error } = await supabase
        .from("sessions")
        .update({ current_state: "CLOSED", updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;
      
      await storeIdempotency(idempotencyKey, {});
      await logAudit({
        session_id: sessionId,
        action: "closeSession",
        from_state: session.current_state,
        to_state: "CLOSED"
      });

      return new Response(null, { status: 204 });
    }

    if (method === "GET" && sessionId) {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (error) throw { code: "SESSION_NOT_FOUND" };
      return new Response(JSON.stringify(data), { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 400 });
  }
});
