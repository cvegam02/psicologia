'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { agendaApi } from '../api';
import { supabase } from '@/lib/supabase';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';
import PremiumSelect from '@/components/ui/PremiumSelect';
import TimeSlotPicker from './TimeSlotPicker';
import { useAvailability } from '../hooks/useAvailability';

interface NewAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialPatientId?: string;
    initialNotes?: string;
}

export default function NewAppointmentModal({
    onClose,
    onSuccess,
    initialPatientId = '',
    initialNotes = ''
}: NewAppointmentModalProps) {
    const { patients } = usePatients();
    const { user } = useUserRole();
    const [mounted, setMounted] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(initialPatientId);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState(60); // Default to 60 mins
    const [notes, setNotes] = useState(initialNotes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { slots, loading: loadingAvailability } = useAvailability(date, user?.id);

    const patientOptions = patients.map(p => ({
        id: p.id,
        label: p.full_name,
        description: p.phone || 'Sin teléfono',
        icon: <User size={18} />
    }));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Final validation for past dates/times (Using robust local components)
            const [y, m, d] = date.split('-').map(Number);
            const [h, min_val] = time.split(':').map(Number);
            const scheduledAtDate = new Date(y, m - 1, d, h, min_val);

            if (scheduledAtDate < new Date()) {
                throw new Error('No se pueden agendar citas en el pasado');
            }

            // Get current user ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            // Construct ISO date string (This will correctly reflect the local time as UTC)
            const scheduledAt = scheduledAtDate.toISOString();

            await agendaApi.create({
                patient_id: selectedPatient,
                psychologist_id: user.id, // Explicitly set or rely on RLS default if column allows
                scheduled_at: scheduledAt,
                duration,
                notes
            });

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al agendar cita');
        } finally {
            setLoading(false);
        }
    }

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="relative h-32 bg-[var(--espresso)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="text-center relative z-10">
                        <div className="w-12 h-12 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md mb-3 text-[var(--bronze)] border border-white/10">
                            <CalendarIcon size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-white tracking-wide">Nueva Cita</h2>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="flex items-center gap-2 p-3 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <PremiumSelect
                            label="Paciente"
                            placeholder="Buscar paciente..."
                            options={patientOptions}
                            value={selectedPatient}
                            onChange={setSelectedPatient}
                            icon={<User size={14} />}
                            required
                        />

                        <div className="space-y-4">
                            <PremiumDatePicker
                                value={date}
                                onChange={(newDate) => {
                                    setDate(newDate);
                                    setTime(''); // Reset time when date changes
                                }}
                                label="Fecha de la Cita"
                                required
                                minDate={new Date()}
                            />

                            {date ? (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                                            Duración de la Sesión
                                        </label>
                                        <div className="flex bg-[var(--silk)] p-1 rounded-2xl border border-[var(--glass-border)]">
                                            {[30, 45, 60, 90].map((d) => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => setDuration(d)}
                                                    className={`
                                                        flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                                        ${duration === d
                                                            ? 'bg-white text-[var(--bronze)] shadow-sm'
                                                            : 'text-[var(--muted)] hover:text-[var(--espresso)]'
                                                        }
                                                    `}
                                                >
                                                    {d} min
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                                            <Clock size={14} /> Horarios Disponibles
                                        </label>
                                        <TimeSlotPicker
                                            slots={slots}
                                            selectedTime={time}
                                            onSelect={setTime}
                                            loading={loadingAvailability}
                                            selectedDate={date}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center border-2 border-dashed border-[var(--cream)] rounded-3xl bg-[var(--silk)]/30">
                                    <CalendarIcon size={32} className="mx-auto mb-3 text-[var(--muted)] opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Selecciona una fecha para ver disponibilidad</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Notas (Opcional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="input-field h-24 resize-none"
                                placeholder="Detalles sobre la sesión..."
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !selectedPatient || !date || !time}
                                className="w-full premium-button premium-button-primary py-4 text-sm shadow-xl shadow-[var(--bronze)]/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                {loading ? 'Agendando...' : 'Confirmar Cita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
