export interface Patient {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    status: 'active' | 'inactive';
    last_session: string | null;
    created_at: string;
}

export type PatientCreate = Omit<Patient, 'id' | 'created_at' | 'last_session'>;

export interface ClinicalNote {
    id: string;
    patient_id: string;
    content: string;
    tags: string[];
    created_at: string;
}
