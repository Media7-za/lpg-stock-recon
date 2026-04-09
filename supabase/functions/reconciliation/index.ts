import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";
import { assertNotLocked } from "../_shared/services/lockService.ts";
import { logAudit } from "../_shared/services/auditService.ts";

serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  try {
    if (method === "POST" && url.pathname.endsWith("/start")) {
      const { sessionId, idempotencyKey } = await req.json();
      
      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(JSON.stringify(existing), { status: 202 });

      const { data: session } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (!session) throw { code: "SESSION_NOT_FOUND" };
      
      assertNotLocked(session);

      if (session.current_state === "CLOSED") {
        throw { code: "INVALID_STATE_TRANSITION" };
      }

      // 🔒 Lock session and start pipeline
      await supabase
        .from("sessions")
        .update({ locked: true, current_state: "RECONCILING", updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      await logAudit({
        session_id: sessionId,
        action: "startReconciliation",
        from_state: session.current_state,
        to_state: "RECONCILING"
      });
      
      await supabase.from("reconciliation_pipeline").upsert({
        session_id: sessionId,
        stage: "VALIDATE_INPUT",
        progress: 0
      });

      const response = { started: true };
      await storeIdempotency(idempotencyKey, response);
      return new Response(JSON.stringify(response), { status: 202 });
    }

    if (method === "GET" && sessionId) {
      if (url.pathname.endsWith("/status")) {
        const { data, error } = await supabase
          .from("reconciliation_pipeline")
          .select("*")
          .eq("session_id", sessionId)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { status: 200 });
      }

      if (url.pathname.endsWith("/report")) {
        const { data, error } = await supabase
          .from("reconciliation_reports")
          .select("*")
          .eq("session_id", sessionId)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 400 });
  }
});
