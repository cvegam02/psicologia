import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { agendaApi } from '../api';
import type { Appointment } from '../types';
import AppointmentActions from './AppointmentActions';
import PremiumCalendar from '@/components/ui/PremiumCalendar';
import PremiumDatePicker from '@/components/ui/PremiumDatePicker';
import PremiumModal from '@/components/ui/PremiumModal';

interface AgendaCalendarProps {
    refreshTrigger: number;
    onAttended: (appt: Appointment) => void;
    onSuccess: () => void;
}

export default function AgendaCalendar({ refreshTrigger, onAttended, onSuccess }: AgendaCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
    const [selectedDayFilter, setSelectedDayFilter] = useState<Date | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Fetch appointments for the current view
    useEffect(() => {
        async function fetchAgenda() {
            setLoading(true);
            try {
                let start = new Date(currentDate);
                let end = new Date(currentDate);

                if (viewMode === 'day') {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                } else if (viewMode === 'week') {
                    start.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
                    start.setHours(0, 0, 0, 0);
                    end = new Date(start);
                    end.setDate(start.getDate() + 6); // Saturday
                    end.setHours(23, 59, 59, 999);
                } else if (viewMode === 'month') {
                    start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    end.setHours(23, 59, 59, 999);
                }

                const data = await agendaApi.getAppointments(start, end);
                setAppointments(data);
            } catch (error) {
                console.error('Error fetching agenda:', JSON.stringify(error, null, 2));
            } finally {
                setLoading(false);
            }
        }

        fetchAgenda();
    }, [currentDate, viewMode, refreshTrigger]);


    // Reset filter when view mode changes
    useEffect(() => {
        setSelectedDayFilter(null);
    }, [viewMode]);

    const viewDays = Array.from({
        length: viewMode === 'day' ? 1
            : viewMode === 'week' ? (selectedDayFilter ? 1 : 7)
                : 0
    }, (_, i) => {
        if (viewMode === 'day') return currentDate;
        if (viewMode === 'week' && selectedDayFilter) return selectedDayFilter;

        const d = new Date(currentDate);
        d.setDate(currentDate.getDate() - currentDate.getDay() + i);
        return d;
    });

    // For Month view, we iterate over appointments or days that have appointments
    // But for the list below, we just need the sorted unique days from the results
    const monthDaysList = viewMode === 'month' ?
        Array.from(new Set(appointments.map(a => new Date(a.scheduled_at).toDateString())))
            .map(dateStr => new Date(dateStr))
            .sort((a, b) => a.getTime() - b.getTime())
        : [];

    const getAppointmentsForDay = (date: Date) => {
        return appointments.filter((apt: Appointment) => {
            const aptDate = new Date(apt.scheduled_at);
            return aptDate.getDate() === date.getDate() &&
                aptDate.getMonth() === date.getMonth();
        });
    };

    function navigateForward() {
        const d = new Date(currentDate);
        if (viewMode === 'day') d.setDate(d.getDate() + 1);
        else if (viewMode === 'week') {
            d.setDate(d.getDate() + 7);
            setSelectedDayFilter(null);
        }
        else if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
        setCurrentDate(d);
    }

    function navigateBackward() {
        const d = new Date(currentDate);
        if (viewMode === 'day') d.setDate(d.getDate() - 1);
        else if (viewMode === 'week') {
            d.setDate(d.getDate() - 7);
            setSelectedDayFilter(null);
        }
        else if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
        setCurrentDate(d);
    }

    return (
        <div className="space-y-6 md:space-y-8 font-[family-name:var(--font-inter)]">
            {/* Header & Controls - Sticky for better mobile UX */}
            <div className="sticky top-0 z-40 bg-[var(--beige-light)]/80 backdrop-blur-md pb-4 pt-1 -mx-4 px-4 md:static md:bg-transparent md:backdrop-blur-none md:p-0 md:m-0">
                <div className="flex flex-col gap-4 md:gap-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                            <button onClick={navigateBackward} className="p-2 hover:bg-[var(--silk)] rounded-full text-[var(--muted)] transition-colors active:scale-90">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex flex-col items-center min-w-[140px] md:min-w-[180px]">
                                <h2 className="text-base md:text-xl font-bold text-[var(--espresso)] capitalize font-[family-name:var(--font-outfit)] tracking-tight text-center">
                                    {viewMode === 'day'
                                        ? currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                                        : currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                                    }
                                </h2>
                                {viewMode === 'week' && (
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--bronze)] mt-0.5 md:mt-1 opacity-70">
                                        Semana {Math.ceil((currentDate.getDate() + (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay())) / 7)}
                                    </span>
                                )}
                            </div>
                            <button onClick={navigateForward} className="p-2 hover:bg-[var(--silk)] rounded-full text-[var(--muted)] transition-colors active:scale-90">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* View Switcher - Full width on mobile */}
                        <div className="flex w-full md:w-auto p-1 bg-[var(--silk)] rounded-2xl border border-[var(--glass-border)]">
                            {(['day', 'week', 'month'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`
                                        flex-1 md:flex-none px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all
                                        ${viewMode === mode
                                            ? 'bg-white text-[var(--bronze)] shadow-sm'
                                            : 'text-[var(--muted)] hover:text-[var(--espresso)]'
                                        }
                                    `}
                                >
                                    {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCalendarOpen(true)}
                                className={`
                                    text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-3 md:px-4 py-2 rounded-full transition-all flex items-center gap-2 active:scale-95
                                    ${isCalendarOpen
                                        ? 'bg-[var(--bronze)] text-white'
                                        : 'text-[var(--muted)] bg-[var(--silk)] border border-[var(--glass-border)] hover:bg-[var(--bronze)]/5 hover:text-[var(--bronze)]'
                                    }
                                `}
                            >
                                <CalendarIcon size={12} />
                                <span className="hidden xs:inline">Ir a fecha</span>
                                <span className="xs:hidden">Fecha</span>
                            </button>
                            <button
                                onClick={() => {
                                    setCurrentDate(new Date());
                                    setSelectedDayFilter(null);
                                }}
                                className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--bronze)] bg-[var(--bronze)]/5 px-4 py-2 rounded-full hover:bg-[var(--bronze)]/10 transition-all active:scale-95"
                            >
                                Hoy
                            </button>
                        </div>

                        <PremiumModal
                            isOpen={isCalendarOpen}
                            onClose={() => setIsCalendarOpen(false)}
                            title="Ir a Fecha"
                            subtitle="Selecciona un día en la agenda"
                        >
                            <div className="p-2">
                                <PremiumCalendar
                                    value={currentDate}
                                    onChange={(date) => {
                                        setCurrentDate(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    onClose={() => setIsCalendarOpen(false)}
                                    className="!border-none !shadow-none !bg-transparent !p-0 !max-w-none"
                                />
                            </div>
                        </PremiumModal>
                    </div>
                </div>
            </div>

            {/* Weekly Grid - Scrollable on Mobile */}
            {viewMode === 'week' && (
                <div className="flex flex-col gap-4">
                    <div className="flex md:grid md:grid-cols-7 gap-2 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 custom-scrollbar-hide -mx-4 px-4 md:m-0 md:p-0">
                        {Array.from({ length: 7 }, (_, i) => {
                            const d = new Date(currentDate);
                            d.setDate(currentDate.getDate() - currentDate.getDay() + i);
                            return d;
                        }).map((day: Date, i: number) => {
                            const isFiltered = selectedDayFilter?.toDateString() === day.toDateString();
                            const isToday = day.toDateString() === new Date().toDateString();

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDayFilter(isFiltered ? null : day)}
                                    className={`
                                        flex flex-col items-center min-w-[60px] md:min-w-0 pb-3 md:pb-4 border-b-2 transition-all active:scale-95
                                        ${isFiltered ? 'border-[var(--bronze)] bg-[var(--bronze)]/5' : 'border-transparent opacity-60 hover:opacity-100'}
                                    `}
                                >
                                    <div className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 ${isFiltered ? 'text-[var(--bronze)]' : 'text-[var(--muted)]'}`}>
                                        {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </div>
                                    <div className={`
                                        relative text-lg md:text-xl font-bold font-[family-name:var(--font-outfit)]
                                        ${isFiltered ? 'text-[var(--bronze)]' : 'text-[var(--espresso)]'}
                                    `}>
                                        {day.getDate()}
                                        {isToday && !isFiltered && (
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--bronze)] rounded-full" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {selectedDayFilter && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setSelectedDayFilter(null)}
                                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-[var(--silk)] text-[var(--bronze)] rounded-full border border-[var(--bronze)]/20 hover:bg-[var(--bronze)]/5 transition-all"
                            >
                                Ver toda la semana
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Appointments List Grouped by Day */}
            <div className="space-y-6 md:space-y-8 relative font-[family-name:var(--font-inter)]">
                {/* Timeline line - hidden on mobile */}
                <div className="hidden md:block absolute left-[3.5rem] top-0 bottom-0 w-px bg-[var(--cream)]/30 -z-10" />

                {loading ? (
                    <div className="py-20 text-center text-[var(--muted)] flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-[var(--bronze)] border-t-transparent rounded-full animate-spin"></div>
                        <p className="italic text-sm">Actualizando agenda profesional...</p>
                    </div>
                ) : (
                    (viewMode === 'month' ? monthDaysList : viewDays).map((day: Date) => {
                        const dayAppointments = getAppointmentsForDay(day);
                        if (dayAppointments.length === 0) return null;

                        return (
                            <div key={day.toISOString()} className="relative animate-fade-in">
                                <div className="flex flex-col md:flex-row gap-4 md:gap-8 group">
                                    <div className="w-full md:w-14 flex md:flex-col items-baseline md:items-end gap-2 md:gap-0 pt-2 border-b border-[var(--cream)]/10 md:border-b-0 pb-2 md:pb-0">
                                        <div className="text-[10px] md:text-xs font-bold uppercase text-[var(--bronze)] md:text-[var(--muted)]">
                                            {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                                        </div>
                                        <div className="text-xl md:text-sm font-bold text-[var(--espresso)] md:font-bold">
                                            {day.getDate()}
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 pb-4 md:pb-8">
                                        {dayAppointments.map(appt => {
                                            const date = new Date(appt.scheduled_at);
                                            const timeStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
                                            const [time, ampm] = timeStr.split(' ');

                                            return (
                                                <AppointmentActions
                                                    key={appt.id}
                                                    appointment={appt}
                                                    onUpdate={onSuccess}
                                                    onAttended={onAttended}
                                                    trigger={
                                                        <div className="glass-card w-full p-4 md:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 group hover:bg-white transition-all hover:translate-y-[-1px] hover:shadow-md border-l-4 border-l-[var(--bronze)] cursor-pointer overflow-hidden mb-3">
                                                            {/* Time Section - Consistent with Dashboard */}
                                                            <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-[85px] md:w-[95px] relative shrink-0 py-1 sm:py-0 border-b sm:border-b-0 border-[var(--cream)]/10 sm:border-r sm:border-r-[var(--cream)]/10 mr-0 sm:mr-2">
                                                                <div className="flex flex-row sm:flex-col items-center gap-1.5 sm:gap-0">
                                                                    <span className="text-lg md:text-xl font-black text-[var(--espresso)] font-[family-name:var(--font-outfit)] leading-none tracking-tight">
                                                                        {time}
                                                                    </span>
                                                                    <span className="text-[10px] md:text-[11px] font-black text-[var(--bronze)] uppercase tracking-[0.1em] sm:mt-0.5">
                                                                        {ampm}
                                                                    </span>
                                                                </div>
                                                                <span className="sm:hidden text-[9px] font-bold bg-[var(--silk)] text-[var(--espresso)]/60 px-2 py-0.5 rounded-full border border-[var(--cream)]/30">
                                                                    {appt.duration || 60} min
                                                                </span>
                                                            </div>

                                                            {/* Details Section */}
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
                                </div>
                            </div>
                        );
                    })
                )}

                {!loading && appointments.length === 0 && (
                    <div className="py-20 text-center glass-card border-dashed bg-white/20">
                        <CalendarIcon size={48} className="mx-auto text-[var(--bronze)] opacity-20 mb-4" strokeWidth={1} />
                        <p className="text-[var(--muted)] font-medium text-sm">No hay citas programadas para este periodo.</p>
                        <p className="text-[10px] text-[var(--muted)] opacity-60 mt-2">Prueba cambiando la vista o seleccionando otra fecha.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
