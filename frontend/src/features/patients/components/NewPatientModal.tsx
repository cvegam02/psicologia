'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { patientsApi } from '../api';
import type { Patient, PatientCreate } from '../types';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';

interface NewPatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
    patient?: Patient; // Optional patient for edit mode
}

export default function NewPatientModal({ onClose, onSuccess, patient }: NewPatientModalProps) {
    const { user } = useUserRole();
    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const [formData, setFormData] = useState({
        full_name: patient?.full_name || '',
        email: patient?.email || '',
        phone: patient?.phone || '',
        birth_date: patient?.birth_date || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);

            if (patient) {
                // Edit mode
                await patientsApi.update(patient.id, formData as Partial<PatientCreate>);
            } else {
                // Create mode
                if (!user?.id) throw new Error('No se encontró el ID del psicólogo');
                await patientsApi.create({
                    ...formData,
                    psychologist_id: user.id,
                    status: 'active'
                } as any);
            }

            onSuccess();
        } catch (error) {
            alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    const isEdit = !!patient;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="glass-card w-full max-w-xl bg-white shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-10 border-b border-[var(--cream)]/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-semibold serif tracking-tight">
                            {isEdit ? 'Editar Expediente' : 'Nuevo Expediente'}
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--bronze)] font-bold mt-2">
                            {isEdit ? 'Actualización de registro clínico' : 'Creación de registro clínico'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full hover:bg-[var(--beige-light)] text-[var(--muted)] hover:text-[var(--espresso)] transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] flex items-center gap-2">
                                <User size={12} className="text-[var(--bronze)]" /> Nombre Completo
                            </label>
                            <input
                                required
                                className="input-field"
                                placeholder="Ej. Ana García"
                                value={formData.full_name}
                                onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] flex items-center gap-2">
                                <Mail size={12} className="text-[var(--bronze)]" /> Email (Opcional)
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="ana@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] flex items-center gap-2">
                                <Phone size={12} className="text-[var(--bronze)]" /> Teléfono
                            </label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="+52 ..."
                                value={formData.phone}
                                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <PremiumDatePicker
                                value={formData.birth_date}
                                onChange={(val: string) => setFormData(p => ({ ...p, birth_date: val }))}
                                label="Fecha de Nacimiento"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-xl border border-[var(--cream)] text-[var(--muted)] font-medium hover:bg-[var(--beige-light)] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 premium-button premium-button-primary flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Save size={20} /> {isSaving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Expediente')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
