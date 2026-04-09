import { supabase } from "../client.ts";

export const logAudit = async ({
  session_id,
  action,
  from_state,
  to_state,
  metadata,
  user
}: any) => {
  await supabase.from("audit_log").insert({
    session_id,
    action,
    from_state,
    to_state,
    metadata,
    performed_by: user || 'system'
  });
};
