'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    Clock,
    Activity,
    Plus,
    Search,
    FileText,
    ChevronRight,
    LogOut,
    AlertCircle,
    UserPlus,
    Bell,
    CalendarPlus,
    Gift,
    Clock3,
    CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { patientsApi } from '@/features/patients/api';
import { agendaApi } from '@/features/agenda/api';
import type { Appointment } from '@/features/agenda/types';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

import NewAppointmentModal from '@/features/agenda/components/NewAppointmentModal';
import AppointmentActions from '@/features/agenda/components/AppointmentActions';
import SessionClosingModal from '@/features/agenda/components/SessionClosingModal';
import NewPatientModal from '@/features/patients/components/NewPatientModal';

export default function Dashboard() {
    const router = useRouter();
    const { patients, loading: patientsLoading } = usePatients();
    const { permissions, loading: roleLoading } = useUserRole();

    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [missingNotes, setMissingNotes] = useState<any[]>([]);
    const [birthdays, setBirthdays] = useState<any[]>([]);
    const [todayHours, setTodayHours] = useState(0);
    const [todayNotesCount, setTodayNotesCount] = useState(0);
    const [agendaLoading, setAgendaLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Modal states
    const [isNewApptOpen, setIsNewApptOpen] = useState(false);
    const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
    const [prefilledPatientId, setPrefilledPatientId] = useState<string | undefined>(undefined);

    const fetchDashboardData = async () => {
        setAgendaLoading(true);
        setFetchError(null);
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            // 1. Fetch Today's Appointments
            const appts = await agendaApi.getAppointments(startOfDay, endOfDay);
            setTodayAppointments(appts);

            // 2. Fetch Missing Notes (Attended without notes in last 7 days)
            const missing = await patientsApi.getMissingNotes();
            setMissingNotes(missing);

            // 3. Fetch Birthdays this week
            const bd = await patientsApi.getBirthdaysThisWeek();
            setBirthdays(bd);

            // 4. Calculate Today's Hours & Notes Count
            const hours = appts
                .filter(a => a.status === 'attended' || a.status === 'scheduled')
                .reduce((acc, a) => acc + (a.duration || 60), 0) / 60;
            setTodayHours(Math.round(hours * 10) / 10);

            const { count } = await supabase
                .from('clinical_notes')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', startOfDay.toISOString())
                .lte('created_at', endOfDay.toISOString());
            setTodayNotesCount(count || 0);

        } catch (e: any) {
            console.error("Error in fetchDashboardData:", e);
            setFetchError(e.message || "Error al cargar la información del dashboard");
        } finally {
            setAgendaLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const handleAttended = (appt: Appointment) => {
        setSelectedAppt(appt);
        setIsClosingModalOpen(true);
    };

    const handleNextAppointment = (patientId: string) => {
        setPrefilledPatientId(patientId);
        setIsNewApptOpen(true);
    };

    // KPI Calculations
    const activePatients = patients.length;
    const todayCount = todayAppointments.length;

    return (
        <div className="relative space-y-6 md:space-y-8 animate-fade-in pb-10 min-h-screen">
            {/* Subtle Ambient Background - Localized for Dashboard */}
            <div className="fixed inset-0 pointer-events-none opacity-40 z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--bronze)]/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-[var(--cream)]/40 blur-[100px] rounded-full" />
            </div>

            {/* Header Area - Optimized for Mobile */}
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                            Panel Administrativo
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-[var(--espresso)] serif tracking-tight">
                            Panel de <span className="text-[var(--bronze)] italic">Control</span>
                        </h1>
                        <p className="max-w-xl text-[var(--muted)] font-light leading-relaxed mt-4">
                            Resumen de actividad y gestión clínica para tu práctica.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-rose-600 bg-rose-50 rounded-full hover:bg-rose-100 transition-colors md:hidden"
                        title="Salir"
                    >
                        <LogOut size={20} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="hidden md:flex premium-button bg-rose-50 text-rose-600 border border-rose-100 items-center gap-2 hover:bg-rose-100"
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>

                <div className="grid grid-cols-2 md:flex gap-3">
                    <button
                        onClick={() => setIsNewPatientOpen(true)}
                        className="premium-button premium-button-secondary flex items-center justify-center gap-2 py-3 px-4 w-full md:w-auto"
                    >
                        <UserPlus size={16} /> <span className="text-[11px] md:text-sm">Agregar Paciente</span>
                    </button>
                    <button
                        onClick={() => {
                            setPrefilledPatientId(undefined);
                            setIsNewApptOpen(true);
                        }}
                        className="premium-button premium-button-primary flex items-center justify-center gap-2 py-3 px-4 w-full md:w-auto"
                    >
                        <CalendarPlus size={16} /> <span className="text-[11px] md:text-sm">Agregar Cita</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards - Grid optimized for mobile and tablets */}
            {!roleLoading && permissions.canViewFinancials && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: 'Pacientes', value: activePatients, icon: Users, alert: false },
                        { label: 'Citas Hoy', value: todayCount, icon: Calendar, alert: false },
                        { label: 'Horas', value: todayHours.toString(), icon: Clock, alert: false },
                        { label: 'Notas', value: todayNotesCount.toString(), icon: FileText, alert: false },
                    ].map((stat, i) => (
                        <div key={i} className="glass-card p-4 md:p-6 flex flex-col justify-between hover:bg-white transition-all hover:translate-y-[-2px]">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{stat.label}</span>
                                <stat.icon size={16} className={stat.alert ? 'text-rose-500' : 'text-[var(--bronze)]'} />
                            </div>
                            <div>
                                <div className="text-xl md:text-3xl font-bold text-[var(--espresso)]">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Main Workspace Area (2/3 or 3/4) - AGENDA */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[var(--espresso)] tracking-tight font-[family-name:var(--font-outfit)]">Agenda de Hoy</h3>
                        <Link href="/agenda" className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[var(--bronze)] hover:underline flex items-center gap-1 font-[family-name:var(--font-inter)]">
                            Ver Todo <ChevronRight size={12} />
                        </Link>
                    </div>

                    <div className="relative space-y-4 px-1 pb-4">
                        {/* Vertical Timeline Line */}
                        {!agendaLoading && todayAppointments.length > 0 && (
                            <div className="absolute left-[2.25rem] md:left-[2.75rem] top-8 bottom-8 w-px bg-gradient-to-b from-[var(--bronze)]/40 via-[var(--bronze)]/10 to-transparent z-0 hidden xs:block" />
                        )}

                        {fetchError ? (
                            <div className="glass-card p-8 text-center text-rose-600 flex flex-col items-center gap-2">
                                <AlertCircle size={32} />
                                <p className="text-sm">{fetchError}</p>
                                <button onClick={fetchDashboardData} className="mt-2 text-[var(--bronze)] font-bold uppercase tracking-widest text-[10px] hover:underline">Reintentar</button>
                            </div>
                        ) : agendaLoading ? (
                            <div className="p-12 text-center flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-2 border-[var(--bronze)] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[var(--muted)] italic text-sm">Cargando agenda profesional...</p>
                            </div>
                        ) : todayAppointments.length === 0 ? (
                            <div className="glass-card p-10 text-center flex flex-col items-center justify-center gap-3 bg-white/40">
                                <Calendar size={36} className="text-[var(--cream)]" strokeWidth={1.5} />
                                <p className="text-[var(--muted)] font-light text-sm text-balance">No hay citas programadas para hoy.</p>
                                <button
                                    onClick={() => setIsNewApptOpen(true)}
                                    className="mt-2 text-[10px] font-bold text-[var(--bronze)] bg-[var(--bronze)]/10 px-4 py-2 rounded-full uppercase tracking-wider hover:bg-[var(--bronze)] hover:text-white transition-all shadow-sm"
                                >
                                    Agendar Primera Cita
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {todayAppointments.map((appt) => {
                                    const date = appt.scheduled_at ? new Date(appt.scheduled_at) : null;
                                    const timeStr = date ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';
                                    const [time, ampm] = timeStr.split(' ');

                                    return (
                                        <AppointmentActions
                                            key={appt.id}
                                            appointment={appt}
                                            onUpdate={fetchDashboardData}
                                            onAttended={handleAttended}
                                            trigger={
                                                <div className="glass-card w-full p-4 md:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 group hover:bg-white transition-all hover:translate-y-[-1px] hover:shadow-md border-l-4 border-l-[var(--bronze)] cursor-pointer overflow-hidden">
                                                    {/* Time Section - Improved Spacing & Formatting */}
                                                    <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-[85px] md:w-[95px] relative shrink-0 py-1 sm:py-0 border-b sm:border-b-0 border-[var(--cream)]/10 sm:border-r sm:border-r-[var(--cream)]/10 mr-0 sm:mr-2">
                                                        {/* Timeline Dot (Visible on xs+) */}
                                                        <div className="absolute -left-[1.85rem] md:-left-[2.35rem] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[var(--bronze)] z-10 hidden xs:block shadow-sm group-hover:scale-125 transition-transform" />

                                                        <div className="flex flex-row sm:flex-col items-center gap-1.5 sm:gap-0">
                                                            <span className="text-lg md:text-xl font-black text-[var(--espresso)] font-[family-name:var(--font-outfit)] leading-none tracking-tight">
                                                                {time}
                                                            </span>
                                                            <span className="text-[10px] md:text-[11px] font-black text-[var(--bronze)] uppercase tracking-[0.1em] sm:mt-0.5">
                                                                {ampm}
                                                            </span>
                                                        </div>

                                                        {/* Duration badge on mobile */}
                                                        <span className="sm:hidden text-[9px] font-bold bg-[var(--silk)] text-[var(--espresso)]/60 px-2 py-0.5 rounded-full border border-[var(--cream)]/30">
                                                            {appt.duration || 60} min
                                                        </span>
                                                    </div>

                                                    {/* Details Section - Full Width & Better Hierarchy */}
                                                    <div className="flex-1 min-w-0 space-y-1.5 py-1">
                                                        <div className="flex justify-between items-center gap-4">
                                                            <h4 className="font-bold text-[var(--espresso)] text-base md:text-lg tracking-tight font-[family-name:var(--font-outfit)] truncate group-hover:text-[var(--bronze)] transition-colors">
                                                                {appt.patients?.full_name || 'Paciente'}
                                                            </h4>
                                                            <span className={`shrink-0 text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full shadow-sm border ${appt.status === 'attended' ? 'bg-emerald-500 text-white border-emerald-400' :
                                                                appt.status === 'confirmed' ? 'bg-sky-500 text-white border-sky-400' :
                                                                    appt.status === 'no_show' ? 'bg-amber-500 text-white border-amber-400' :
                                                                        appt.status === 'cancelled' ? 'bg-rose-500 text-white border-rose-400' :
                                                                            'bg-[var(--bronze)] text-white border-[var(--bronze)]'
                                                                }`}>
                                                                {appt.status === 'scheduled' ? 'Agendada' :
                                                                    appt.status === 'confirmed' ? 'Confirmada' :
                                                                        appt.status === 'attended' ? 'Atendida' :
                                                                            appt.status === 'no_show' ? 'Faltó' :
                                                                                appt.status === 'cancelled' ? 'Cancelada' : 'Reagendada'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {appt.notes ? (
                                                                <p className="text-[var(--muted)] text-xs md:text-sm line-clamp-1 italic font-medium opacity-80 flex-1">
                                                                    "{appt.notes}"
                                                                </p>
                                                            ) : (
                                                                <p className="text-[var(--muted)]/40 text-[10px] md:text-xs flex-1">Sin observaciones para esta sesión</p>
                                                            )}
                                                            <span className="hidden sm:block text-[10px] font-bold text-[var(--muted)]/40 tabular-nums">
                                                                {appt.duration || 60} min
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:flex items-center text-[var(--bronze)] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 shrink-0">
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Panel (1/3) */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--espresso)] tracking-tight font-[family-name:var(--font-outfit)]">Pacientes Recientes</h3>
                            <Link href="/patients" className="text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--bronze)] font-[family-name:var(--font-inter)]">Ver Todo</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                            {patientsLoading ? (
                                <div className="p-4 text-center text-[var(--muted)] italic text-xs">Buscando expedientes...</div>
                            ) : patients.length === 0 ? (
                                <div className="glass-card p-6 text-center text-[var(--muted)] text-xs bg-white/40">No hay registros recientes</div>
                            ) : patients.slice(0, 5).map(p => {
                                const initials = p.full_name
                                    ?.split(' ')
                                    .map(n => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase() || 'P';

                                return (
                                    <Link
                                        key={p.id}
                                        href={`/patients/${p.id}`}
                                        className="glass-card p-3 flex items-center gap-3 transition-all hover:translate-x-1 hover:border-[var(--bronze)]/30 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--silk)] to-[var(--cream)] flex items-center justify-center text-[var(--bronze)] font-bold text-xs border border-[var(--bronze)]/10 shadow-inner group-hover:from-[var(--bronze)] group-hover:to-[#B8860B] group-hover:text-white transition-all">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-[var(--espresso)] text-sm truncate font-[family-name:var(--font-outfit)] tracking-tight">
                                                {p.full_name}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest">Activo</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-[var(--bronze)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions / Professional Tasks / Insights */}
                    <div className="space-y-6">
                        {/* Task Widget: Missing Notes */}
                        {missingNotes.length > 0 && (
                            <div className="glass-card p-5 border-l-4 border-l-amber-400 bg-amber-50/10">
                                <div className="flex items-center gap-2 mb-4 text-amber-700">
                                    <Clock3 size={18} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-outfit)]">Tareas Profesionales</h3>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-amber-800/60 uppercase tracking-widest px-1">Notas Pendientes ({missingNotes.length})</p>
                                    {missingNotes.slice(0, 3).map((appt) => (
                                        <div
                                            key={appt.id}
                                            onClick={() => handleAttended(appt)}
                                            className="flex flex-col p-2.5 rounded-xl bg-white/60 hover:bg-white cursor-pointer transition-all border border-amber-100/50 shadow-sm"
                                        >
                                            <span className="font-bold text-[var(--espresso)] text-xs truncate">{appt.patients?.full_name}</span>
                                            <span className="text-[9px] text-[var(--muted)] uppercase mt-0.5">Sesión del {new Date(appt.scheduled_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    ))}
                                    {missingNotes.length > 3 && (
                                        <p className="text-[9px] text-center text-amber-600 font-bold mt-2 cursor-pointer hover:underline">Y {missingNotes.length - 3} notas más...</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Insights Widget: Birthdays */}
                        {birthdays.length > 0 && (
                            <div className="glass-card p-5 border-l-4 border-l-sky-400 bg-sky-50/10">
                                <div className="flex items-center gap-2 mb-4 text-sky-700">
                                    <Gift size={18} />
                                    <h3 className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-outfit)]">Insights Clínicos</h3>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-sky-800/60 uppercase tracking-widest px-1">Cumpleaños de la semana</p>
                                    {birthdays.map((p) => (
                                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/60 border border-sky-100/50">
                                            <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-[10px] font-bold">
                                                {p.full_name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--espresso)] text-xs">{p.full_name}</span>
                                                <span className="text-[9px] text-sky-600 font-medium uppercase">{new Date(p.birth_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weekly Summary (Placeholder for value) */}
                        <div className="glass-card p-5 bg-gradient-to-br from-[var(--silk)] to-[var(--cream)] border-none">
                            <div className="flex items-center gap-2 mb-4 text-[var(--bronze)]">
                                <Activity size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider font-[family-name:var(--font-outfit)]">Resumen Semanal</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/60 rounded-2xl text-center">
                                    <div className="text-lg font-bold text-[var(--espresso)]">{todayAppointments.length}</div>
                                    <div className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">Hoy</div>
                                </div>
                                <div className="p-3 bg-white/60 rounded-2xl text-center">
                                    <div className="text-lg font-bold text-[var(--espresso)]">{activePatients}</div>
                                    <div className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest">Pacientes</div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-[var(--espresso)] text-white rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Eficiencia</span>
                                </div>
                                <span className="text-xs font-black">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isNewApptOpen && (
                <NewAppointmentModal
                    onClose={() => {
                        setIsNewApptOpen(false);
                        setPrefilledPatientId(undefined);
                    }}
                    onSuccess={() => {
                        setIsNewApptOpen(false);
                        setPrefilledPatientId(undefined);
                        fetchDashboardData();
                    }}
                    initialPatientId={prefilledPatientId}
                />
            )}

            {isClosingModalOpen && selectedAppt && (
                <SessionClosingModal
                    appointment={selectedAppt}
                    onClose={() => setIsClosingModalOpen(false)}
                    onSuccess={fetchDashboardData}
                    onNextAppointment={handleNextAppointment}
                />
            )}

            {isNewPatientOpen && (
                <NewPatientModal
                    onClose={() => setIsNewPatientOpen(false)}
                    onSuccess={() => {
                        setIsNewPatientOpen(false);
                    }}
                />
            )}
        </div>
    );
}
