'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, User, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { patientsApi } from '../api';
import type { PatientCreate } from '../types';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';

interface NewPatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewPatientModal({ onClose, onSuccess }: NewPatientModalProps) {
    const [mounted, setMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await patientsApi.create(formData as PatientCreate);
            onSuccess();
        } catch (error) {
            alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="glass-card w-full max-w-xl bg-white shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-10 border-b border-[var(--cream)]/20 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-semibold serif tracking-tight">Nuevo Expediente</h2>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--bronze)] font-bold mt-2">Creación de registro clínico</p>
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
                                onChange={(val) => setFormData(p => ({ ...p, birth_date: val }))}
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
                            <Save size={20} /> {isSaving ? 'Guardando...' : 'Crear Expediente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
