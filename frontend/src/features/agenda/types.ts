export type AppointmentStatus = 'scheduled' | 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'rescheduled';

export interface Appointment {
    id: string;
    patient_id: string;
    psychologist_id: string;
    scheduled_at: string; // ISO 8601
    duration: number; // in minutes
    status: AppointmentStatus;
    notes?: string;
    created_at: string;

    // Optional Join Fields
    patients?: {
        full_name: string;
    };
}

export interface AppointmentCreate {
    patient_id: string;
    psychologist_id?: string;
    scheduled_at: string;
    duration: number;
    notes?: string;
    status?: AppointmentStatus;
}

export interface PsychologistSchedule {
    id: string;
    psychologist_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}
