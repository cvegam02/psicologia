'use client';

import React, { useState } from 'react';
import { usePatients } from '@/features/patients/hooks/usePatients';
import PatientList from '@/features/patients/components/PatientList';
import NewPatientModal from '@/features/patients/components/NewPatientModal';
import { Sparkles } from 'lucide-react';

export default function PatientsPage() {
    const { patients, loading, refresh } = usePatients();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        refresh();
    };

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                        <Sparkles size={12} /> Gestión de Expedientes
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-semibold text-[var(--espresso)] serif tracking-tight">
                        Catálogo de <span className="text-[var(--bronze)] italic">Pacientes</span>
                    </h1>
                    <p className="mt-4 text-[var(--muted)] font-light max-w-xl leading-relaxed">
                        Administra los registros clínicos de tus pacientes de forma segura. Accede a sus historiales, notas y datos de contacto desde un solo lugar.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <PatientList
                patients={patients}
                loading={loading}
                onNewClick={() => setIsModalOpen(true)}
            />

            {/* Modal */}
            {isModalOpen && (
                <NewPatientModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
