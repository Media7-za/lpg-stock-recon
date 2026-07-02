import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'Depot Manager' | 'Invoice Clerk' | 'Yard Counter';

export function useAuth() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            // No Supabase project configured at all — nothing to authenticate
            // against, so fall back to a local-dev stub role.
            setUserRole('Depot Manager');
            setLoading(false);
            return;
        }

        function applySession(nextSession: Session | null) {
            setSession(nextSession);
            setUserRole((nextSession?.user.user_metadata?.role as UserRole) ?? null);
            setLoading(false);
        }

        supabase.auth.getSession().then(({ data }) => applySession(data.session));

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            applySession(nextSession);
        });

        return () => subscription.subscription.unsubscribe();
    }, []);

    return { userRole, session, loading, isAuthenticated: !!supabase ? !!session : true };
}
