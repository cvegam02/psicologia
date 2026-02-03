'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface TimeSlot {
    time: string; // HH:mm format
    isAvailable: boolean;
    appointmentId?: string;
}

interface TimeSlotPickerProps {
    slots: TimeSlot[];
    selectedTime: string;
    onSelect: (time: string) => void;
    loading?: boolean;
    selectedDate?: string; // YYYY-MM-DD
}

export default function TimeSlotPicker({
    slots,
    selectedTime,
    onSelect,
    loading = false,
    selectedDate
}: TimeSlotPickerProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-[var(--silk)] animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (slots.length === 0) {
        return (
            <div className="py-8 text-center text-[var(--muted)]">
                <Clock size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Sin horarios disponibles</p>
            </div>
        );
    }

    const isPastTime = (slotTime: string) => {
        if (!selectedDate) return false;

        const now = new Date();
        // Construct LOCAL YYYY-MM-DD string
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // If selected date is strictly after today, it's never "past"
        if (selectedDate > todayStr) return false;

        // If it's a past day (blocked by calendar normally), everything is "past"
        if (selectedDate < todayStr) return true;

        // If it's exactly Today, compare hours and minutes
        const [hours, minutes] = slotTime.split(':').map(Number);
        const slotDate = new Date();
        slotDate.setHours(hours, minutes, 0, 0);

        return slotDate < now;
    };

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {slots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const isPast = isPastTime(slot.time);
                const isOccupied = !slot.isAvailable;
                const disabled = isOccupied || isPast;

                return (
                    <button
                        key={slot.time}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(slot.time)}
                        className={`
                            relative h-14 flex flex-col items-center justify-center rounded-xl transition-all border group
                            ${disabled
                                ? isPast
                                    ? 'bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed'
                                    : 'bg-rose-50/50 border-rose-100 text-rose-300 cursor-not-allowed grayscale'
                                : isSelected
                                    ? 'bg-[var(--bronze)] border-[var(--bronze)] text-white shadow-lg shadow-[var(--bronze)]/20 scale-105 z-10'
                                    : 'bg-white border-black/5 text-[var(--espresso)] hover:border-[var(--bronze)]/50 hover:bg-[var(--silk)] active:scale-95'
                            }
                        `}
                    >
                        <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                            {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('es-MX', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).replace(' ', '')}
                        </span>

                        <div className="absolute top-1 right-1">
                            {isSelected ? (
                                <CheckCircle2 size={10} className="text-white" />
                            ) : isPast ? (
                                <Clock size={10} className="text-zinc-300" />
                            ) : isOccupied ? (
                                <XCircle size={10} className="text-rose-400" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                        </div>

                        <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-60 ${isSelected ? 'text-white/80' : ''}`}>
                            {isPast ? 'Pasado' : isOccupied ? 'Ocupado' : 'Libre'}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
