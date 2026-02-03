'use client';

import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import AgendaCalendar from '@/features/agenda/components/AgendaCalendar';
import NewAppointmentModal from '@/features/agenda/components/NewAppointmentModal';
import SessionClosingModal from '@/features/agenda/components/SessionClosingModal';
import type { Appointment } from '@/features/agenda/types';

export default function AgendaPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Workflow states
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [prefilledPatientId, setPrefilledPatientId] = useState<string | undefined>(undefined);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAttended = (appt: Appointment) => {
        setSelectedAppt(appt);
        setIsClosingModalOpen(true);
    };

    const handleNextAppointment = (patientId: string) => {
        setPrefilledPatientId(patientId);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2 md:space-y-4">
                    <div className="flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-[0.2em]">
                        <Calendar size={12} /> Gestión de Citas
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[var(--espresso)] serif tracking-tight">
                        Agenda <span className="text-[var(--bronze)] italic">Profesional</span>
                    </h1>
                    <p className="text-[var(--muted)] text-sm md:text-base font-medium font-[family-name:var(--font-inter)] max-w-xl leading-relaxed opacity-80">
                        Organiza tu semana clínica. Visualiza disponibilidad y asegura el seguimiento de tus pacientes.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-button premium-button-primary w-full md:w-auto shadow-lg shadow-[var(--bronze)]/10"
                >
                    <Plus size={20} /> Nueva Cita
                </button>
            </div>

            {/* Calendar View */}
            <div className="glass-card bg-white/50 p-4 md:p-8 border-[var(--glass-border)] lg:border-[var(--bronze)]/5">
                <AgendaCalendar
                    refreshTrigger={refreshTrigger}
                    onAttended={handleAttended}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                />
            </div>

            {/* Modals */}
            {isModalOpen && (
                <NewAppointmentModal
                    onClose={() => {
                        setIsModalOpen(false);
                        setPrefilledPatientId(undefined);
                    }}
                    onSuccess={handleSuccess}
                    initialPatientId={prefilledPatientId}
                />
            )}

            {isClosingModalOpen && selectedAppt && (
                <SessionClosingModal
                    appointment={selectedAppt}
                    onClose={() => setIsClosingModalOpen(false)}
                    onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    onNextAppointment={handleNextAppointment}
                />
            )}
        </div>
    );
}
