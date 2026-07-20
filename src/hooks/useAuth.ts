import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'Depot Manager' | 'Invoice Clerk' | 'Yard Counter';

export function useAuth() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const bypassedRole = localStorage.getItem('bypass_auth_role') as UserRole;
        if (bypassedRole) {
            setUserRole(bypassedRole);
            setLoading(false);
            return;
        }

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
            // Only update session if not in bypass mode
            const activeBypass = localStorage.getItem('bypass_auth_role');
            if (!activeBypass) {
                applySession(nextSession);
            }
        });

        return () => subscription.subscription.unsubscribe();
    }, []);

    const logout = async () => {
        localStorage.removeItem('bypass_auth_role');
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUserRole(null);
        setSession(null);
        window.location.href = '/';
    };

    const isBypassed = typeof window !== 'undefined' && !!localStorage.getItem('bypass_auth_role');
    const isAuthenticated = isBypassed ? true : (!!supabase ? !!session : true);

    return { userRole, session, loading, isAuthenticated, isBypassed, logout };
}

