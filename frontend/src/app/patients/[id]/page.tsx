'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    User,
    Save,
    Clock,
    Calendar,
    StickyNote,
    ChevronRight,
    Brain,
    History
} from 'lucide-react';
import { patientsApi } from '@/features/patients/api';
import type { Patient, ClinicalNote } from '@/features/patients/types';

import { useUserRole } from '@/features/auth/hooks/useUserRole';

export default function ExpedientePage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.id as string;
    const { permissions, loading: roleLoading } = useUserRole();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [notes, setNotes] = useState<ClinicalNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = useCallback(async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            const [patientData, notesData] = await Promise.all([
                patientsApi.getById(patientId),
                patientsApi.getNotes(patientId)
            ]);
            setPatient(patientData);
            setNotes(notesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    async function handleSaveNote() {
        if (!newNote.trim() || !patientId) return;
        try {
            setIsSaving(true);
            await patientsApi.addNote(patientId, newNote);
            setNewNote('');
            await fetchData();
        } catch (error) {
            alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Navigation & Header */}
            <div className="flex flex-col gap-8">
                <button
                    onClick={() => router.push('/patients')}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-[var(--muted)] hover:text-[var(--bronze)] transition-all group w-fit"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver a Pacientes
                </button>

                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-white border-2 border-[var(--cream)] flex items-center justify-center text-[var(--bronze)] shadow-2xl shadow-[var(--bronze)]/5 group-hover:rotate-6 transition-transform duration-500 relative z-10 overflow-hidden ring-8 ring-[var(--beige-light)]">
                            <User size={56} strokeWidth={1} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-emerald-500 border-4 border-white z-20 shadow-sm" />
                    </div>

                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-5xl lg:text-6xl font-semibold text-[var(--espresso)] serif tracking-tight">
                            {patient?.full_name || (loading ? '...' : 'Paciente')}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className="px-3 py-1 rounded-full bg-[var(--bronze)]/10 text-[var(--bronze)] text-[11px] font-bold uppercase tracking-widest border border-[var(--bronze)]/10">
                                Sesiones: {notes.length}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-widest border border-slate-200">
                                Última: {notes[0] ? new Date(notes[0].created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
                {/* Left: Evolution & Editor */}
                <div className="lg:col-span-2 space-y-16">
                    {roleLoading || loading ? (
                        <div className="space-y-8">
                            <div className="glass-card h-64 animate-pulse bg-slate-50/50" />
                            <div className="space-y-4">
                                <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg" />
                                <div className="glass-card h-40 animate-pulse bg-slate-50/50" />
                            </div>
                        </div>
                    ) : permissions.canViewClinicalNotes ? (
                        <>
                            {/* New Session Card */}
                            <div className="glass-card overflow-hidden bg-white border-[var(--bronze)]/10 shadow-xl shadow-[var(--bronze)]/5">
                                {/* ... existing content ... */}
                                <div className="p-8 lg:p-12 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-semibold text-[var(--espresso)] serif flex items-center gap-3">
                                            <Brain className="text-[var(--bronze)]" size={24} /> Nota de Evolución
                                        </h3>
                                        <div className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-[0.2em] bg-[var(--beige-light)] px-4 py-1.5 rounded-full">
                                            Hoy, {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                        </div>
                                    </div>

                                    <textarea
                                        className="w-full h-64 bg-[var(--beige-light)]/30 border border-[var(--cream)]/40 rounded-3xl p-8 text-[var(--espresso)] text-lg leading-relaxed font-light italic focus:bg-white focus:border-[var(--bronze)] focus:ring-8 focus:ring-[var(--bronze)]/5 outline-none transition-all placeholder-[var(--muted)]/40 resize-none"
                                        placeholder="Describe los avances, objetivos y observaciones de esta sesión..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                    />

                                    <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                                        <div className="flex gap-2">
                                            <span className="px-4 py-2 rounded-xl bg-[var(--beige-light)] text-[var(--muted)] text-[11px] font-bold uppercase tracking-widest border border-[var(--cream)]/20 cursor-pointer hover:border-[var(--bronze)]/30 transition-all">
                                                #Evolucion
                                            </span>
                                            <span className="px-4 py-2 rounded-xl bg-[var(--beige-light)] text-[var(--muted)] text-[11px] font-bold uppercase tracking-widest border border-[var(--cream)]/20 cursor-pointer hover:border-[var(--bronze)]/30 transition-all">
                                                #Animo
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleSaveNote}
                                            disabled={isSaving || !newNote.trim()}
                                            className="premium-button premium-button-primary flex items-center gap-3 px-10 shadow-lg shadow-[var(--bronze)]/20 disabled:opacity-50"
                                        >
                                            <Save size={20} /> {isSaving ? 'Guardando...' : 'Registrar Sesión'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Section */}
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-3xl font-semibold text-[var(--espresso)] serif tracking-tight">Historial Clínico</h3>
                                    <div className="h-px flex-1 bg-[var(--cream)]/30" />
                                    <History size={20} className="text-[var(--muted)] opacity-30" />
                                </div>

                                {notes.length === 0 ? (
                                    <div className="text-center py-24 glass-card border-dashed border-2 opacity-60">
                                        <StickyNote className="mx-auto mb-4 text-[var(--muted)]" size={40} strokeWidth={1} />
                                        <p className="text-[var(--muted)] font-light italic">Aún no hay sesiones registradas para este paciente.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-px before:bg-[var(--cream)]">
                                        {notes.map((note) => (
                                            <div key={note.id} className="relative pl-14 group">
                                                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-2 border-[var(--cream)] flex items-center justify-center text-[var(--muted)] z-10 shadow-sm group-hover:border-[var(--bronze)] group-hover:text-[var(--bronze)] transition-all">
                                                    <Calendar size={18} />
                                                </div>

                                                <div className="glass-card p-8 bg-white border-[var(--cream)]/40 hover:border-[var(--bronze)] transition-all duration-500">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-semibold text-[var(--espresso)]">
                                                                {new Date(note.created_at).toLocaleDateString('es-ES', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                                <Clock size={12} /> {new Date(note.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {note.tags?.map(tag => (
                                                                <span key={tag} className="text-[9px] uppercase tracking-widest font-bold text-[var(--bronze)] bg-[var(--bronze)]/5 px-2 py-0.5 rounded border border-[var(--bronze)]/10">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <p className="text-[var(--espresso)] text-lg leading-relaxed font-light whitespace-pre-wrap">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="glass-card p-12 text-center space-y-4 border-dashed border-2 border-[var(--cream)]">
                            <div className="w-16 h-16 bg-[var(--beige-light)] rounded-full flex items-center justify-center mx-auto text-[var(--muted)]">
                                <User size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-[var(--espresso)]">Acceso Restringido</h3>
                            <p className="text-[var(--muted)] max-w-md mx-auto">
                                Como recepcionista, solo tienes acceso a la información de contacto y agenda del paciente. El expediente clínico es confidencial.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Context & Metadata */}
                <div className="space-y-8">
                    <div className="glass-card p-10 bg-[var(--beige-light)]/30 border-[var(--cream)]/40">
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--bronze)] mb-8 flex items-center gap-2">
                            <User size={14} /> Información General
                        </h4>

                        <div className="space-y-8">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-[var(--muted)] font-bold tracking-widest opacity-60">Teléfono</label>
                                <p className="text-[var(--espresso)] font-medium">{patient?.phone || 'No registrado'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-[var(--muted)] font-bold tracking-widest opacity-60">Email</label>
                                <p className="text-[var(--espresso)] font-medium truncate">{patient?.email || 'No registrado'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase text-[var(--muted)] font-bold tracking-widest opacity-60">En tratamiento desde</label>
                                <p className="text-[var(--espresso)] font-medium">{patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : '...'}</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-[var(--cream)]/30 space-y-4">
                            <p className="text-xs text-[var(--muted)] italic leading-relaxed">
                                &quot;Ana, recuerda mantener actualizados los datos de contacto para los recordatorios automáticos de citas.&quot;
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white border border-[var(--cream)] hover:shadow-lg transition-all group">
                            <span className="text-sm font-semibold text-[var(--espresso)] tracking-tight">Exportar PDF</span>
                            <ChevronRight size={18} className="text-[var(--muted)] group-hover:text-[var(--bronze)]" />
                        </button>
                        <button className="w-full flex items-center justify-between p-6 rounded-2xl bg-white border border-[var(--cream)] hover:shadow-lg transition-all group">
                            <span className="text-sm font-semibold text-[var(--espresso)] tracking-tight">Agendar Próxima Cita</span>
                            <ChevronRight size={18} className="text-[var(--muted)] group-hover:text-[var(--bronze)]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
