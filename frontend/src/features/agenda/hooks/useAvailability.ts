'use client';

import { useState, useEffect, useCallback } from 'react';
import { agendaApi } from '../api';
import type { Appointment } from '../types';

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
    appointmentId?: string;
}

const BUSINESS_HOURS = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // 8:00 AM to 8:00 PM
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minutes}`;
});

export function useAvailability(date: string) {
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailability = useCallback(async () => {
        if (!date) {
            setSlots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const start = new Date(`${date}T00:00:00`);
            const end = new Date(`${date}T23:59:59`);

            const appointments = await agendaApi.getAppointments(start, end);

            const occupiedWindows = appointments.map((apt: Appointment) => {
                const startTime = new Date(apt.scheduled_at);
                const startMins = startTime.getHours() * 60 + startTime.getMinutes();
                const endMins = startMins + (apt.duration || 60);
                return { start: startMins, end: endMins };
            });

            const calculatedSlots = BUSINESS_HOURS.map(timeStr => {
                const [h, m] = timeStr.split(':').map(Number);
                const slotMins = h * 60 + m;

                const isOccupied = occupiedWindows.some(window =>
                    slotMins >= window.start && slotMins < window.end
                );

                return {
                    time: timeStr,
                    isAvailable: !isOccupied
                };
            });

            setSlots(calculatedSlots);
        } catch (err) {
            console.error('Error fetching availability:', err);
            setError('Error al cargar disponibilidad');
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    return { slots, loading, error, refetch: fetchAvailability };
}
