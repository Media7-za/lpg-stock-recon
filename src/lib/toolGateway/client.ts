const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[apiClient] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Edge Function calls will fail.');
}

export const apiClient = {
  post: async (url: string, body: any) => {
    const res = await fetch(`${SUPABASE_URL ?? ''}/functions/v1${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY ?? ''}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const error = await res.json();
      return { error };
    }

    if (res.status === 204) return { data: null };
    return res.json();
  },

  get: async (url: string) => {
    const res = await fetch(`${SUPABASE_URL ?? ''}/functions/v1${url}`, {
      headers: {
        "Authorization": `Bearer ${SUPABASE_ANON_KEY ?? ''}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      return { error };
    }
    return res.json();
  }
};
