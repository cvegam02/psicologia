'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserRole, UserProfile } from '../types';

export function useUserRole() {
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        // Initial fetch
        async function fetchRole() {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setRole(profile.role);
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: profile.full_name,
                        role: profile.role
                    });
                }
            } else {
                setRole(null);
                setUser(null);
            }
            setLoading(false);
        }

        fetchRole();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setRole(profile.role);
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: profile.full_name,
                        role: profile.role
                    });
                }
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const isOwner = role === 'owner';
    const isPsychologist = role === 'psychologist';
    const isReceptionist = role === 'receptionist';

    // Helper to check permissions
    const canViewClinicalNotes = isOwner || isPsychologist;
    const canViewFinancials = isOwner;

    return {
        role,
        loading,
        user,
        isOwner,
        isPsychologist,
        isReceptionist,
        permissions: {
            canViewClinicalNotes,
            canViewFinancials
        }
    };
}
