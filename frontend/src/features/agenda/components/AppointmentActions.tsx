'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Check,
    UserCheck,
    UserMinus,
    XCircle,
    RotateCcw,
    MoreHorizontal,
    X,
    Calendar,
    ArrowRight,
    Edit,
    Search,
    AlertCircle
} from 'lucide-react';
import { agendaApi } from '../api';
import type { Appointment, AppointmentStatus } from '../types';
import EditAppointmentModal from './EditAppointmentModal';

interface AppointmentActionsProps {
    appointment: Appointment;
    onUpdate: () => void;
    onAttended: (appointment: Appointment) => void;
    trigger?: React.ReactNode;
}

export default function AppointmentActions({ appointment, onUpdate, onAttended, trigger }: AppointmentActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStatusChange = async (newStatus: AppointmentStatus) => {
        setError(null);
        if (newStatus === 'attended') {
            setIsOpen(false);
            onAttended(appointment);
            return;
        }

        setLoading(true);
        try {
            await agendaApi.updateStatus(appointment.id, newStatus);
            setIsOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Error al actualizar: Posible restricción de permisos');
        } finally {
            setLoading(false);
        }
    };

    const actions = [
        {
            id: 'confirmed',
            label: 'Confirmar Cita',
            icon: Check,
            color: 'text-sky-600',
            bg: 'bg-sky-50',
            show: appointment.status === 'scheduled'
        },
        {
            id: 'attended',
            label: 'Marcar como Atendida',
            icon: UserCheck,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            show: appointment.status === 'scheduled' || appointment.status === 'confirmed'
        },
        {
            id: 'no_show',
            label: 'No asistió',
            icon: UserMinus,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            show: appointment.status === 'scheduled' || appointment.status === 'confirmed'
        },
        {
            id: 'cancelled',
            label: 'Cancelar Cita',
            icon: XCircle,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            show: appointment.status === 'scheduled' || appointment.status === 'confirmed'
        },
        {
            id: 'edit',
            label: 'Editar Cita',
            icon: Edit,
            color: 'text-[var(--bronze)]',
            bg: 'bg-[var(--bronze)]/5',
            show: appointment.status === 'scheduled' || appointment.status === 'confirmed',
            isSpecial: true
        },
        {
            id: 'rescheduled',
            label: 'Reagendar',
            icon: RotateCcw,
            color: 'text-[var(--espresso)]',
            bg: 'bg-[var(--cream)]',
            show: appointment.status === 'no_show' || appointment.status === 'cancelled' || appointment.status === 'attended'
        }
    ].filter(a => a.show);

    return (
        <div className="flex items-center gap-2 w-full">
            {/* Unified Action Trigger */}
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer w-full">
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-[var(--silk)] text-[var(--espresso)] border border-[var(--glass-border)] hover:bg-[var(--bronze)]/10 hover:text-[var(--bronze)] hover:border-[var(--bronze)]/30 active:scale-95 transition-all shadow-sm group"
                >
                    <MoreHorizontal size={16} className="text-[var(--bronze)] group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Acciones</span>
                </button>
            )}

            {/* Action Sheet / Modal Portal */}
            {isOpen && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Panel */}
                    <div className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-slide-up sm:animate-scale-in pb-10 sm:pb-8 px-6 pt-4 flex flex-col gap-6">
                        {/* Handle - Only visible on mobile */}
                        <div className="sm:hidden w-12 h-1.5 bg-[var(--cream)] rounded-full mx-auto mb-2 opacity-50" />

                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-xl font-serif font-semibold text-[var(--espresso)]">Acciones</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">
                                    Cita con {appointment.patients?.full_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 bg-[var(--beige-light)] rounded-full text-[var(--espresso)]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase tracking-wider animate-pulse">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="grid gap-3">
                            {actions.map(action => (
                                <button
                                    key={action.id}
                                    disabled={loading}
                                    onClick={() => {
                                        if (action.id === 'edit') {
                                            setIsEditOpen(true);
                                            setIsOpen(false);
                                        } else {
                                            handleStatusChange(action.id as AppointmentStatus);
                                        }
                                    }}
                                    className={`flex items-center justify-between w-full p-5 rounded-2xl ${action.bg} transition-all active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center border border-white/50 shadow-sm relative`}>
                                            <action.icon size={20} className={action.color} />
                                            {loading && (
                                                <div className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <div className="w-4 h-4 border-2 border-[var(--bronze)] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`font-medium ${action.color}`}>{action.label}</span>
                                    </div>
                                    <ArrowRight size={18} className="opacity-30" />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 text-sm font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--espresso)] transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {isEditOpen && (
                <EditAppointmentModal
                    appointment={appointment}
                    onClose={() => setIsEditOpen(false)}
                    onSuccess={() => {
                        setIsEditOpen(false);
                        onUpdate();
                    }}
                />
            )}
        </div>
    );
}
