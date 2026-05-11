import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'Depot Manager' | 'Invoice Clerk' | 'Yard Counter';

export function useAuth() {
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getProfile() {
            if (!supabase) {
                // Stub for local development
                setUserRole('Depot Manager');
                setLoading(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // In a real app, you'd fetch this from a profiles table
                // For this module, we'll assume the role is in user_metadata
                setUserRole(user.user_metadata?.role as UserRole || 'Yard Counter');
            } else {
                // Mock for this demo if not logged in
                setUserRole('Depot Manager');
            }
            setLoading(false);
        }
        getProfile();
    }, []);

    return { userRole, loading };
}
