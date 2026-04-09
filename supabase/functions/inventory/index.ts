import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";
import { assertNotLocked } from "../_shared/services/lockService.ts";
import { logAudit } from "../_shared/services/auditService.ts";

serve(async (req) => {
  const { method } = req;
  const url = new URL(req.url);

  try {
    if (method === "POST") {
      const body = await req.json();
      const { idempotencyKey } = body;
      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(null, { status: 202 });

      if (url.pathname.endsWith("/snapshot")) {
        const { snapshot } = body;
        const { error } = await supabase.from("erp_snapshots").upsert(snapshot);
        if (error) throw error;
      } else if (url.pathname.endsWith("/movements")) {
        const { movement } = body;
        const { error } = await supabase.from("movement_data").upsert(movement);
        if (error) throw error;
      } else if (url.pathname.endsWith("/counts")) {
        const { sessionId, payload } = body;
        const { data: session } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
        
        if (!session) throw { code: "SESSION_NOT_FOUND" };
        
        assertNotLocked(session);

        if (session.current_state === "RECONCILING" || session.current_state === "CLOSED") {
          throw { code: "INVALID_STATE_TRANSITION" };
        }

        // 💾 Insert counts
        const { error } = await supabase
          .from("counts")
          .insert({
            session_id: sessionId,
            data: payload
          });
        
        if (error) throw error;

        // 🔄 Move to COUNTING if OPEN
        if (session.current_state === "OPEN") {
          await supabase
            .from("sessions")
            .update({ current_state: "COUNTING" })
            .eq("id", sessionId);
          await logAudit({
            session_id: sessionId,
            action: "submitPhysicalCount",
            from_state: "OPEN",
            to_state: "COUNTING",
            metadata: { count: payload.length }
          });
        } else {
          await logAudit({
            session_id: sessionId,
            action: "submitPhysicalCount",
            from_state: "COUNTING",
            to_state: "COUNTING",
            metadata: { count: payload.length }
          });
        }
      }

      const response = { success: true };
      await storeIdempotency(idempotencyKey, response);
      return new Response(JSON.stringify(response), { status: 202 });
    }

    if (method === "GET" && url.pathname.endsWith("/snapshot")) {
      const date = url.searchParams.get("date");
      const { data, error } = await supabase
        .from("erp_snapshots")
        .select("*")
        .eq("date", date)
        .single();
      
      if (error) throw { code: "SNAPSHOT_MISSING" };
      return new Response(JSON.stringify(data), { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 400 });
  }
});
