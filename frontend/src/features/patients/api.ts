import { supabase } from '@/lib/supabase';
import type { Patient, PatientCreate, ClinicalNote } from './types';

export const patientsApi = {
    async getAll(): Promise<Patient[]> {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Patient | null> {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(patient: PatientCreate): Promise<Patient> {
        const { data, error } = await supabase
            .from('patients')
            .insert([{ ...patient, status: 'active' }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getNotes(patientId: string): Promise<ClinicalNote[]> {
        const { data, error } = await supabase
            .from('clinical_notes')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async addNote(patientId: string, content: string, tags: string[] = ['evolucion']): Promise<ClinicalNote> {
        const { data, error } = await supabase
            .from('clinical_notes')
            .insert([{ patient_id: patientId, content, tags }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getBirthdaysThisWeek(): Promise<Patient[]> {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .not('birth_date', 'is', null);

        if (error) throw error;

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return (data || []).filter(p => {
            if (!p.birth_date) return false;
            const bday = new Date(p.birth_date);
            // Ignore year, just compare month and day
            const bdayThisYear = new Date(now.getFullYear(), bday.getUTCMonth(), bday.getUTCDate());
            return bdayThisYear >= startOfWeek && bdayThisYear <= endOfWeek;
        });
    },

    async getMissingNotes(): Promise<any[]> {
        // Get attended appointments from the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: appointments, error: apptError } = await supabase
            .from('appointments')
            .select('*, patients(full_name)')
            .eq('status', 'attended')
            .gte('scheduled_at', sevenDaysAgo.toISOString());

        if (apptError) throw apptError;

        // Get clinical notes from the last 7 days
        const { data: notes, error: notesError } = await supabase
            .from('clinical_notes')
            .select('patient_id, session_date')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (notesError) throw notesError;

        // Filter appointments that don't have a note on the same day for the same patient
        return (appointments || []).filter(appt => {
            const apptDate = appt.scheduled_at.split('T')[0];
            return !notes?.some(n =>
                n.patient_id === appt.patient_id &&
                n.session_date === apptDate
            );
        });
    }
};
