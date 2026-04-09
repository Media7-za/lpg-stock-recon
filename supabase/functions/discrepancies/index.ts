import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";
import { handleIdempotency, storeIdempotency } from "../_shared/services/idempotencyService.ts";
import { assertNotLocked } from "../_shared/services/lockService.ts";
import { logAudit } from "../_shared/services/auditService.ts";

serve(async (req) => {
  const { method } = req;

  try {
    if (method === "POST" && req.url.endsWith("/notes")) {
      const { sessionId, note, idempotencyKey } = await req.json();
      const existing = await handleIdempotency(idempotencyKey);
      if (existing) return new Response(null, { status: 200 });

      const { data: session } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      
      if (!session) throw { code: "SESSION_NOT_FOUND" };
      assertNotLocked(session);
      
      if (session.current_state === "CLOSED") {
        throw { code: "SESSION_CLOSED" };
      }

      // Upsert note
      const { error } = await supabase
        .from("discrepancy_notes")
        .upsert({ 
          session_id: sessionId, 
          note, 
          status: "REVIEWED",
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      
      const response = { success: true };
      if (session.current_state === "RECONCILED") {
        await supabase.from("sessions").update({ current_state: "REVIEWED" }).eq("id", sessionId);
        await logAudit({
          session_id: sessionId,
          action: "discrepancyReviewed",
          from_state: "RECONCILED",
          to_state: "REVIEWED"
        });
      }

      await storeIdempotency(idempotencyKey, response);
      return new Response(JSON.stringify(response), { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err }), { status: 400 });
  }
});
