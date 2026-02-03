import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentCreate, AppointmentStatus } from './types';

export const agendaApi = {
    async getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]> {
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                patients (full_name)
            `)
            .gte('scheduled_at', startDate.toISOString())
            .lte('scheduled_at', endDate.toISOString())
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async create(appointment: AppointmentCreate): Promise<Appointment> {
        const { data, error } = await supabase
            .from('appointments')
            .insert([appointment])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<AppointmentCreate>): Promise<Appointment> {
        const { data, error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
        const { error } = await supabase
            .from('appointments')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    }
};
