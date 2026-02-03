'use client';

import React, { useState, useRef } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import PremiumCalendar from './PremiumCalendar';
import PremiumModal from './PremiumModal';

interface PremiumDatePickerProps {
    value?: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export default function PremiumDatePicker({
    value,
    onChange,
    label,
    placeholder = 'Seleccionar fecha...',
    required = false,
    className = ''
}: PremiumDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Convert string 'YYYY-MM-DD' to Date object for the calendar
    const selectedDate = value ? new Date(value + 'T00:00:00') : undefined;


    const handleDateChange = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const clearDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className={`space-y-2 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                    <CalendarIcon size={14} /> {label}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    input-field cursor-pointer flex items-center justify-between group
                    ${isOpen ? 'border-[var(--bronze)] ring-4 ring-[var(--accent-glow)]' : ''}
                `}
            >
                <span className={value ? 'text-[var(--espresso)] font-medium' : 'text-[var(--muted)]'}>
                    {value ? new Date(value + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    }) : placeholder}
                </span>

                <div className="flex items-center gap-2">
                    {value && !required && (
                        <button
                            onClick={clearDate}
                            className="p-1 hover:bg-[var(--silk)] rounded-full text-[var(--muted)] hover:text-rose-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <CalendarIcon size={16} className={`transition-colors ${isOpen ? 'text-[var(--bronze)]' : 'text-[var(--muted)] group-hover:text-[var(--bronze)]'}`} />
                </div>
            </div>

            <PremiumModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={label || "Seleccionar Fecha"}
                subtitle="Elige un día para el registro"
            >
                <PremiumCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    onClose={() => setIsOpen(false)}
                    className="!border-none !shadow-none !bg-transparent !p-0 !max-w-none"
                />
            </PremiumModal>
        </div>
    );
}
