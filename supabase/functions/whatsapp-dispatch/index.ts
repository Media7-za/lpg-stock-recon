import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { logId, docNo, whatsappNumber, mergedDocUrl } = await req.json();

    if (!logId || !whatsappNumber || !mergedDocUrl) {
      throw new Error("Missing required fields (logId, whatsappNumber, mergedDocUrl)");
    }

    const whapiApiKey = Deno.env.get("WHAPI_API_KEY");
    if (!whapiApiKey) {
      throw new Error("WHAPI_API_KEY not configured in environment");
    }

    // 1. Send via Whapi.Cloud
    // Template: "Hello [Account Name], please find attached your Invoice [Doc No] and signed Delivery Note for your transaction on [Date]. Please contact us if you have any questions. Regards, LPG Dispatch Team."
    // Note: account_name and tx_date would ideally be passed or fetched, but for now we use a generic caption as per PRD.
    const caption = `Hello, please find attached your Invoice ${docNo} and signed Delivery Note. Please contact us if you have any questions. Regards, LPG Dispatch Team.`;

    const response = await fetch("https://gate.whapi.cloud/messages/document", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: whatsappNumber,
        media: mergedDocUrl,
        caption: caption,
        filename: `Invoice_${docNo}.pdf`
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[Whapi] Error:", result);
      
      // Update log to FAILED
      await supabase
        .from("invoice_dispatch_logs")
        .update({ 
          status: "FAILED", 
          error_details: JSON.stringify(result) 
        })
        .eq("id", logId);

      return new Response(JSON.stringify({ success: false, error: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 2. Update log to SENT
    await supabase
      .from("invoice_dispatch_logs")
      .update({ 
        status: "SENT",
        sent_at: new Date().toISOString()
      })
      .eq("id", logId);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("[Dispatch] Unexpected Error:", err);
    
    // Attempt to update log if we have the ID
    try {
      const { logId } = await req.clone().json();
      if (logId) {
        await supabase
          .from("invoice_dispatch_logs")
          .update({ 
            status: "FAILED", 
            error_details: `Internal Error: ${err.message}`
          })
          .eq("id", logId);
      }
    } catch (e) {
      console.error("[Dispatch] Could not update log in catch block:", e);
    }

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
