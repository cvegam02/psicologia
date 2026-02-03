'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Calendar, ArrowRight, MessageSquare } from 'lucide-react';
import type { Appointment } from '../types';
import { agendaApi } from '../api';
import { patientsApi } from '@/features/patients/api';

interface SessionClosingModalProps {
    appointment: Appointment;
    onClose: () => void;
    onNextAppointment: (patientId: string) => void;
    onSuccess: () => void;
}

export default function SessionClosingModal({ appointment, onClose, onNextAppointment, onSuccess }: SessionClosingModalProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'notes' | 'next_prompt'>('notes');

    const handleSaveNotesAndAttend = async () => {
        setLoading(true);
        try {
            // 1. Update appointment to 'attended'
            await agendaApi.updateStatus(appointment.id, 'attended');

            // 2. Save clinical note
            await patientsApi.addNote(appointment.patient_id, notes, ['evolucion']);

            setStep('next_prompt');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
                {step === 'notes' ? (
                    <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-serif text-[var(--espresso)] font-semibold text-center">Finalizar Sesión</h2>
                                <p className="text-xs text-[var(--muted)] uppercase tracking-widest mt-1">Paciente: {appointment.patients?.full_name}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1 flex items-center gap-2">
                                <FileText size={14} /> Resumen de la Sesión
                            </label>
                            <textarea
                                className="input-field h-40 resize-none"
                                placeholder="Escribe aquí los puntos clave tratados en la sesión..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button
                            disabled={loading || !notes}
                            onClick={handleSaveNotesAndAttend}
                            className="premium-button premium-button-primary w-full py-4 flex items-center justify-center gap-3"
                        >
                            {loading ? 'Guardando...' : (<>Guardar y Cerrar Sesión <ArrowRight size={18} /></>)}
                        </button>
                    </div>
                ) : (
                    <div className="p-8 text-center space-y-8 py-12">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare size={40} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-serif text-[var(--espresso)] font-semibold">¡Sesión Guardada!</h2>
                            <p className="text-[var(--muted)] mt-2 font-light">¿Deseas agendar la próxima sesión con {appointment.patients?.full_name} de una vez?</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    onNextAppointment(appointment.patient_id);
                                    onClose();
                                }}
                                className="premium-button premium-button-primary w-full py-4 flex items-center justify-center gap-3"
                            >
                                <Calendar size={18} /> Sí, Agendar Ahora
                            </button>
                            <button
                                onClick={() => {
                                    onSuccess();
                                    onClose();
                                }}
                                className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--espresso)] py-2 transition-colors"
                            >
                                Quizás más tarde
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
