'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import type { UserProfile } from '../types';

export function useProfiles() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await authApi.getProfiles();
            setProfiles(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error al cargar perfiles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    return {
        profiles,
        loading,
        error,
        refresh: fetchProfiles
    };
}
