import { supabase } from "../client.ts";

export const handleIdempotency = async (key: string) => {
  const { data } = await supabase
    .from("idempotency_keys")
    .select("*")
    .eq("key", key)
    .single();

  if (data) {
    return data.response;
  }

  return null;
};

export const storeIdempotency = async (key: string, response: any) => {
  await supabase.from("idempotency_keys").insert({
    key,
    response
  });
};
