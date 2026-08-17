import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { supabase } from "../_shared/client.ts";
import { logAudit } from "../_shared/services/auditService.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Kept in sync by hand with the `record_receipt_extraction` tool schema below —
// the tool schema constrains what the model returns, zod is the independent check on it.
const ReceiptExtractionSchema = z.object({
  documentType: z.enum(["delivery_note", "cylinder_returns", "other"]),
  supplier: z.string().nullable(),
  documentNumber: z.string().nullable(),
  documentDate: z.string().nullable(),
  customerName: z.string().nullable(),
  customerNumber: z.string().nullable(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      productCode: z.string().nullable(),
      orderedQty: z.number().nullable(),
      shippedQty: z.number().nullable(),
      unit: z.string().nullable(),
      confidence: z.number().min(0).max(100),
    })
  ),
  statedTotal: z.number().nullable(),
  handwrittenNotes: z.array(z.string()),
  signaturesPresent: z.object({
    driver: z.boolean(),
    receivedBy: z.boolean(),
    approvedBy: z.boolean(),
  }),
  overallConfidence: z.number().min(0).max(100),
  lowConfidenceFields: z.array(z.string()),
});

type ReceiptExtraction = z.infer<typeof ReceiptExtractionSchema>;

const RECEIPT_TOOL = {
  name: "record_receipt_extraction",
  description:
    "Record the structured data extracted from a delivery note or cylinder returns document image.",
  input_schema: {
    type: "object",
    properties: {
      documentType: { type: "string", enum: ["delivery_note", "cylinder_returns", "other"] },
      supplier: { type: ["string", "null"] },
      documentNumber: { type: ["string", "null"] },
      documentDate: { type: ["string", "null"], description: "ISO 8601 date if it can be determined" },
      customerName: { type: ["string", "null"] },
      customerNumber: { type: ["string", "null"] },
      lineItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            productCode: { type: ["string", "null"] },
            orderedQty: { type: ["number", "null"] },
            shippedQty: { type: ["number", "null"] },
            unit: { type: ["string", "null"] },
            confidence: { type: "number", description: "0-100 confidence for this line" },
          },
          required: ["description", "productCode", "orderedQty", "shippedQty", "unit", "confidence"],
        },
      },
      statedTotal: { type: ["number", "null"], description: "The document's own printed/written grand total, if present" },
      handwrittenNotes: { type: "array", items: { type: "string" } },
      signaturesPresent: {
        type: "object",
        properties: {
          driver: { type: "boolean" },
          receivedBy: { type: "boolean" },
          approvedBy: { type: "boolean" },
        },
        required: ["driver", "receivedBy", "approvedBy"],
      },
      overallConfidence: { type: "number", description: "0-100 overall confidence in this extraction" },
      lowConfidenceFields: { type: "array", items: { type: "string" }, description: "Names of fields the model is unsure about, e.g. illegible handwriting" },
    },
    required: [
      "documentType", "supplier", "documentNumber", "documentDate", "customerName",
      "customerNumber", "lineItems", "statedTotal", "handwrittenNotes",
      "signaturesPresent", "overallConfidence", "lowConfidenceFields",
    ],
  },
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function extractFromImage(imageUrl: string, documentTypeHint?: string): Promise<ReceiptExtraction> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured in environment");
  const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-4-5-20250929";

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Could not fetch image at ${imageUrl}`);
  const mediaType = imageRes.headers.get("content-type") ?? "image/jpeg";
  const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
  const base64Data = toBase64(imageBytes);

  const prompt = [
    "Extract structured data from this LPG delivery/returns document photo.",
    "Read both printed text and handwriting. Cylinder-count grids are common (size/quantity tables) — represent",
    "each populated size/row as a lineItem, using the size as the description and the handwritten count as shippedQty.",
    "If a field is illegible or you are guessing, still fill it in with your best read but add its name to lowConfidenceFields",
    "and give it a low per-field confidence rather than omitting it.",
    documentTypeHint ? `The uploader hinted this is a "${documentTypeHint}" document.` : "",
  ].filter(Boolean).join(" ");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      tools: [RECEIPT_TOOL],
      tool_choice: { type: "tool", name: RECEIPT_TOOL.name },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Vision model request failed (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  const toolUse = (result.content as Array<{ type: string; input?: unknown }> | undefined)
    ?.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Vision model did not return a structured extraction");

  const parsed = ReceiptExtractionSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    throw new Error(`Extraction failed schema validation: ${parsed.error.message}`);
  }
  return parsed.data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method === "POST" && req.url.endsWith("/extract")) {
      const { imageUrl, documentTypeHint } = await req.json();
      if (!imageUrl) throw new Error("Missing required field: imageUrl");

      const extraction = await extractFromImage(imageUrl, documentTypeHint);

      const { data: row, error } = await supabase
        .from("receipt_extractions")
        .insert({
          image_url: imageUrl,
          document_type: extraction.documentType,
          supplier_name: extraction.supplier,
          document_number: extraction.documentNumber,
          document_date: extraction.documentDate,
          extracted_data: extraction,
          system_confidence: extraction.overallConfidence,
          status: "PENDING_REVIEW",
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data: row }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (req.method === "POST" && req.url.endsWith("/review")) {
      const { id, decision, reviewedData, reasonCodes, notes, humanConfidence, reviewedBy } = await req.json();
      if (!id || !decision) throw new Error("Missing required fields: id, decision");

      const validDecisions = ["ACCEPT", "REJECT", "MODIFY", "ESCALATE"];
      if (!validDecisions.includes(decision)) throw new Error(`Invalid decision: ${decision}`);

      // A human overriding or escalating the model's read must leave a reason on the record.
      if (decision !== "ACCEPT" && (!reasonCodes || reasonCodes.length === 0)) {
        throw new Error("reasonCodes is required when decision is not ACCEPT");
      }

      const { data: existing, error: fetchError } = await supabase
        .from("receipt_extractions")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) throw new Error("Receipt extraction not found");
      if (existing.status !== "PENDING_REVIEW") throw new Error(`Extraction already ${existing.status}`);

      const nextStatus = decision === "REJECT" ? "REJECTED" : "CONFIRMED";

      const { data: updated, error: updateError } = await supabase
        .from("receipt_extractions")
        .update({
          status: nextStatus,
          decision,
          reviewed_data: reviewedData ?? null,
          human_confidence: humanConfidence ?? null,
          reason_codes: reasonCodes ?? [],
          notes: notes ?? null,
          reviewed_by: reviewedBy ?? "system",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;

      await logAudit({
        action: "receiptExtractionReviewed",
        from_state: "PENDING_REVIEW",
        to_state: nextStatus,
        user: reviewedBy ?? "system",
        metadata: { receiptExtractionId: id, decision, reasonCodes },
      });

      return new Response(JSON.stringify({ success: true, data: updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  } catch (err) {
    console.error("[ReceiptExtraction] Error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
