import { supabase } from '@/lib/supabase';
import type { PsychologistSchedule } from './types';

export const schedulesApi = {
    async getSchedules(psychologistId: string): Promise<PsychologistSchedule[]> {
        const { data, error } = await supabase
            .from('psychologist_schedules')
            .select('*')
            .eq('psychologist_id', psychologistId)
            .order('day_of_week', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async updateSchedule(psychologistId: string, dayOfWeek: number, updates: Partial<PsychologistSchedule>): Promise<void> {
        const { error } = await supabase
            .from('psychologist_schedules')
            .upsert({
                psychologist_id: psychologistId,
                day_of_week: dayOfWeek,
                ...updates
            }, {
                onConflict: 'psychologist_id,day_of_week'
            });

        if (error) throw error;
    }
};
