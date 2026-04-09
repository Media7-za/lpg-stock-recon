import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

export async function checkIdempotency(key: string): Promise<any | null> {
  const { data, error } = await supabase
    .from("idempotency_keys")
    .select("response")
    .eq("key", key)
    .single();

  if (data) return data.response;
  return null;
}

export async function saveIdempotency(key: string, response: any) {
  await supabase
    .from("idempotency_keys")
    .insert({ key, response });
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
  "OPEN": ["COUNTING", "CLOSED"],
  "COUNTING": ["SYNCED", "RECONCILING"],
  "SYNCED": ["RECONCILING"],
  "RECONCILING": ["RECONCILED", "FAILED"],
  "RECONCILED": ["REVIEWED", "RECONCILING"],
  "REVIEWED": ["CLOSED"],
  "FAILED": ["RECONCILING"],
  "CLOSED": []
};

/**
 * Standard Error Codes aligned to system blueprint
 */
export const ERROR_CODES = {
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  SESSION_CLOSED: "SESSION_CLOSED",
  SESSION_LOCKED: "SESSION_LOCKED",
  INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",
  SNAPSHOT_MISSING: "SNAPSHOT_MISSING",
  RECONCILIATION_ALREADY_RUNNING: "RECONCILIATION_ALREADY_RUNNING",
  DUPLICATE_REQUEST: "DUPLICATE_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED"
};

export async function validateStateTransition(sessionId: string, toState: string): Promise<string> {
  const { data: session, error } = await supabase
    .from("sessions")
    .select("current_state")
    .eq("id", sessionId)
    .single();

  if (error || !session) throw new Error(ERROR_CODES.SESSION_NOT_FOUND);
  
  const fromState = session.current_state;
  if (!VALID_TRANSITIONS[fromState]?.includes(toState)) {
    throw new Error(ERROR_CODES.INVALID_STATE_TRANSITION);
  }
  return fromState;
}

export async function auditLog(sessionId: string, action: string, from: string, to: string, userId: string, idempotencyKey: string, metadata: any) {
  await supabase.from("audit_log").insert({
    session_id: sessionId,
    action,
    from_state: from,
    to_state: to,
    performed_by: userId,
    metadata: { ...metadata, idempotencyKey }
  });
}
