'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface PremiumCalendarProps {
    value?: Date;
    minDate?: Date;
    onChange: (date: Date) => void;
    onClose?: () => void;
    className?: string;
}

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export default function PremiumCalendar({ value, minDate, onChange, onClose, className = '' }: PremiumCalendarProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentViewDate, setCurrentViewDate] = useState(value || today);
    const [isYearView, setIsYearView] = useState(false);
    const [isMonthView, setIsMonthView] = useState(false); // New state for month selection

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days from previous month to fill the first week
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
        day: prevMonthLastDate - firstDayOfMonth + i + 1,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
    }));

    // Days of the current month
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        month,
        year,
        isCurrentMonth: true
    }));

    // Days from next month to complete the grid (total 42 cells for 6 weeks)
    const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
    const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => ({
        day: i + 1,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
    }));

    const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    // Generate years for year selector (1900 - current year + 5)
    const years = Array.from({ length: new Date().getFullYear() + 5 - 1900 + 1 }, (_, i) => 1900 + i).reverse();

    const handlePrevMonth = () => {
        setCurrentViewDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate(new Date(year, month + 1, 1));
    };

    const handleDateSelect = (d: number, m: number, y: number) => {
        const selected = new Date(y, m, d);

        if (minDate) {
            const normalizedSelected = new Date(y, m, d);
            const normalizedMinDate = new Date(minDate);
            normalizedMinDate.setHours(0, 0, 0, 0);
            if (normalizedSelected < normalizedMinDate) return;
        }

        onChange(selected);
        if (onClose) onClose();
    };

    const handleYearSelect = (selectedYear: number) => {
        const newDate = new Date(currentViewDate);
        newDate.setFullYear(selectedYear);
        setCurrentViewDate(newDate);
        setIsYearView(false);
    };

    const handleMonthSelect = (selectedMonthIndex: number) => {
        const newDate = new Date(currentViewDate);
        newDate.setMonth(selectedMonthIndex);
        setCurrentViewDate(newDate);
        setIsMonthView(false);
    };

    const isSelected = (d: number, m: number, y: number) => {
        if (!value) return false;
        return value.getDate() === d && value.getMonth() === m && value.getFullYear() === y;
    };

    const isToday = (d: number, m: number, y: number) => {
        const now = new Date();
        return now.getDate() === d && now.getMonth() === m && now.getFullYear() === y;
    };

    const isDisabled = (d: number, m: number, y: number) => {
        if (!minDate) return false;

        // Normalize checkDate and minDate to midnight local time for fair comparison
        const checkDate = new Date(y, m, d);
        const normalizedMinDate = new Date(minDate);
        normalizedMinDate.setHours(0, 0, 0, 0);

        return checkDate < normalizedMinDate;
    };

    return (
        <div className={`glass-card p-5 bg-white/95 backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl max-w-sm w-full mx-auto animate-fade-in ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--bronze)] mb-1">
                        {isYearView ? 'Seleccionar Año' : isMonthView ? 'Seleccionar Mes' : 'Seleccionar Fecha'}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--espresso)] font-[family-name:var(--font-outfit)] tracking-tight flex items-center gap-1">
                        {/* Month Selector */}
                        {!isYearView && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMonthView(!isMonthView);
                                    if (isYearView) setIsYearView(false);
                                }}
                                className={`
                                    rounded-md px-1 -ml-1 transition-all hover:bg-[var(--silk)] 
                                    ${isMonthView ? 'bg-[var(--silk)] text-[var(--espresso)]' : 'hover:scale-105 active:scale-95'}
                                `}
                            >
                                {MONTHS[month]}
                            </button>
                        )}

                        {/* Year Selector */}
                        {!isMonthView && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsYearView(!isYearView);
                                    if (isMonthView) setIsMonthView(false);
                                }}
                                className={`
                                    rounded-md px-1 transition-all hover:bg-[var(--silk)]
                                    ${isYearView ? 'bg-[var(--silk)] text-[var(--espresso)]' : 'text-[var(--muted)] font-normal hover:text-[var(--espresso)]'}
                                `}
                            >
                                {year}
                            </button>
                        )}
                    </h3>
                </div>
                {!isYearView && !isMonthView && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-[var(--silk)] rounded-xl text-[var(--muted)] transition-all active:scale-90"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-[var(--silk)] rounded-xl text-[var(--muted)] transition-all active:scale-90"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {isYearView ? (
                /* Years Grid */
                <div className="grid grid-cols-4 gap-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {years.map(y => (
                        <button
                            key={y}
                            onClick={() => handleYearSelect(y)}
                            className={`
                                py-2 rounded-lg text-sm font-medium transition-all
                                ${y === year
                                    ? 'bg-[var(--bronze)] text-white shadow-md'
                                    : 'text-[var(--muted)] hover:bg-[var(--silk)] hover:text-[var(--espresso)]'
                                }
                            `}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            ) : isMonthView ? (
                /* Months Grid */
                <div className="grid grid-cols-3 gap-3 h-64 overflow-y-auto content-start">
                    {MONTHS.map((m, idx) => (
                        <button
                            key={m}
                            onClick={() => handleMonthSelect(idx)}
                            className={`
                                py-3 rounded-xl text-sm font-medium transition-all
                                ${idx === month
                                    ? 'bg-[var(--bronze)] text-white shadow-md'
                                    : 'text-[var(--muted)] hover:bg-[var(--silk)] hover:text-[var(--espresso)]'
                                }
                            `}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            ) : (
                /* Days Grid */
                <>
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {allDays.map((dateObj, idx) => {
                            const selected = isSelected(dateObj.day, dateObj.month, dateObj.year);
                            const current = isToday(dateObj.day, dateObj.month, dateObj.year);
                            const disabled = isDisabled(dateObj.day, dateObj.month, dateObj.year);

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleDateSelect(dateObj.day, dateObj.month, dateObj.year)}
                                    className={`
                                        relative h-10 w-full flex items-center justify-center rounded-xl text-xs font-semibold transition-all
                                        ${!dateObj.isCurrentMonth ? 'text-[var(--muted)]/30' : 'text-[var(--espresso)]'}
                                        ${disabled ? 'opacity-20 cursor-not-allowed' : ''}
                                        ${selected
                                            ? 'bg-[var(--bronze)] text-white shadow-lg shadow-[var(--bronze)]/20 scale-105 z-10'
                                            : !disabled ? 'hover:bg-[var(--silk)]' : ''
                                        }
                                        ${current && !selected ? 'text-[var(--bronze)] ring-1 ring-[var(--bronze)]/30' : ''}
                                    `}
                                >
                                    {dateObj.day}
                                    {current && !selected && (
                                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--bronze)] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => {
                        const now = new Date();
                        setCurrentViewDate(now);
                        onChange(now);
                        setIsYearView(false);
                        setIsMonthView(false);
                        if (onClose) onClose();
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-[var(--bronze)] bg-[var(--bronze)]/5 px-4 py-2 rounded-full hover:bg-[var(--bronze)]/10 transition-all"
                >
                    Hoy
                </button>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--espresso)] transition-all"
                    >
                        Cerrar
                    </button>
                )}
            </div>
        </div>
    );
}
