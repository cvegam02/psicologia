'use client';

import { useState, useEffect, useCallback } from 'react';
import { patientsApi } from '../api';
import type { Patient } from '../types';

export function usePatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPatients = useCallback(async () => {
        try {
            setLoading(true);
            const data = await patientsApi.getAll();
            setPatients(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch patients'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return {
        patients,
        loading,
        error,
        refresh: fetchPatients
    };
}
