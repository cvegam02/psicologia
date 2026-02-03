'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { agendaApi } from '../api';
import { supabase } from '@/lib/supabase';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';
import PremiumSelect from '@/components/ui/PremiumSelect';
import TimeSlotPicker from './TimeSlotPicker';
import { useAvailability } from '../hooks/useAvailability';
import type { Appointment } from '../types';

interface EditAppointmentModalProps {
    appointment: Appointment;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditAppointmentModal({
    appointment,
    onClose,
    onSuccess
}: EditAppointmentModalProps) {
    const { patients } = usePatients();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Initial values from appointment
    const initialDate = new Date(appointment.scheduled_at).toISOString().split('T')[0];
    const initialTime = new Date(appointment.scheduled_at).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).slice(0, 5);

    const [selectedPatient, setSelectedPatient] = useState(appointment.patient_id);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);
    const [duration, setDuration] = useState(appointment.duration || 60);
    const [notes, setNotes] = useState(appointment.notes || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { slots, loading: loadingAvailability } = useAvailability(date);

    const patientOptions = patients.map(p => ({
        id: p.id,
        label: p.full_name,
        description: p.phone || 'Sin teléfono',
        icon: <User size={18} />
    }));

    const isTodayOrTomorrow = (dateStr: string) => {
        const d = new Date(`${dateStr}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const checkDate = d.getTime();
        return checkDate === today.getTime() || checkDate === tomorrow.getTime();
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Check if status needs to revert to 'scheduled'
            // If it was confirmed and new date is NOT today or tomorrow
            let newStatus = appointment.status;
            if (appointment.status === 'confirmed' && !isTodayOrTomorrow(date)) {
                newStatus = 'scheduled';
            }

            const scheduledAt = new Date(`${date}T${time}`).toISOString();

            await agendaApi.update(appointment.id, {
                patient_id: selectedPatient,
                scheduled_at: scheduledAt,
                duration,
                notes,
                // We cast to any because AppointmentCreate might not have status, 
                // but the update method supports partial Appointment fields
                status: newStatus
            } as any);

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al modificar cita');
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
                        <h2 className="text-2xl font-serif text-white tracking-wide">Modificar Cita</h2>
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
                                    setTime('');
                                }}
                                label="Modificar Fecha"
                                required
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

                        {appointment.status === 'confirmed' && !isTodayOrTomorrow(date) && (
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 leading-normal">
                                    Aviso: La cita volverá al estado "Agendada" para enviar un nuevo recordatorio de confirmación.
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !selectedPatient || !date || !time}
                                className="w-full premium-button premium-button-primary py-4 text-sm shadow-xl shadow-[var(--bronze)]/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                {loading ? 'Guardando...' : 'Actualizar Cita'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
}
