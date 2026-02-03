'use client';

import { useState, useEffect, useCallback } from 'react';
import { agendaApi } from '../api';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '../types';

export interface TimeSlot {
    time: string;
    isAvailable: boolean;
    appointmentId?: string;
}

const BUSINESS_HOURS_DEFAULT = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // 8:00 AM to 8:00 PM
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minutes}`;
});

export function useAvailability(date: string, psychologistId?: string) {
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
            // Use local date construction to avoid UTC offsets shifting the day
            const [y, m, d] = date.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0);
            const end = new Date(y, m - 1, d, 23, 59, 59);
            const dayOfWeek = start.getDay();

            // 1. Fetch psychologist schedule for this day
            const targetPsychologistId = psychologistId || 'a437f893-6c8a-441d-9372-c0e869769062'; // Fallback if needed

            const { data: schedule } = await supabase
                .from('psychologist_schedules')
                .select('*')
                .eq('psychologist_id', targetPsychologistId)
                .eq('day_of_week', dayOfWeek)
                .single();

            // 2. Fetch appointments
            const appointments = await agendaApi.getAppointments(start, end);

            // 3. Define Business Hours (Dynamic)
            let businessHours: string[] = [];
            if (schedule && schedule.is_active) {
                const [startH] = schedule.start_time.split(':').map(Number);
                const [endH] = schedule.end_time.split(':').map(Number);

                for (let h = startH; h < endH; h++) {
                    businessHours.push(`${String(h).padStart(2, '0')}:00`);
                    businessHours.push(`${String(h).padStart(2, '0')}:30`);
                }
                // Add the last slot if it's exactly on the hour
                if (schedule.end_time.endsWith(':30')) {
                    businessHours.push(schedule.end_time.substring(0, 5));
                }
            } else if (!schedule) {
                // Default fallback if no schedule is set yet
                for (let h = 8; h < 20; h++) {
                    businessHours.push(`${String(h).padStart(2, '0')}:00`);
                    businessHours.push(`${String(h).padStart(2, '0')}:30`);
                }
            }

            const occupiedWindows = appointments.map((apt: Appointment) => {
                const startTime = new Date(apt.scheduled_at);
                const startMins = startTime.getHours() * 60 + startTime.getMinutes();
                const endMins = startMins + (apt.duration || 60);
                return { start: startMins, end: endMins };
            });

            const calculatedSlots = businessHours.map(timeStr => {
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
