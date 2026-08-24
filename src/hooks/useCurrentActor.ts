import { useAuth } from './useAuth';

// A stable identity string for "who did this" fields (requestedBy,
// submittedBy, capturedBy, etc.) across the card recon epic. Mirrors the
// pattern in ReconciliationWorkspace.tsx (supabase.auth.getUser().id)
// but adds a bypass-mode fallback, since this app's dev-only auth bypass
// (localStorage bypass_auth_role) never creates a real Supabase session
// and several card recon writes need *some* actor id to record.
export function useCurrentActor(): { actorId: string | undefined; displayName: string | null } {
  const { session, userRole, isBypassed } = useAuth();

  if (session?.user.id) {
    return { actorId: session.user.id, displayName: userRole };
  }
  if (isBypassed && userRole) {
    return { actorId: `bypass:${userRole}`, displayName: userRole };
  }
  return { actorId: undefined, displayName: userRole };
}
