'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import PremiumModal from './PremiumModal';

interface Option {
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
}

interface PremiumSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    required?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export default function PremiumSelect({
    options,
    value,
    onChange,
    label,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    required = false,
    className = '',
    icon
}: PremiumSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        (opt.description && opt.description.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className={`space-y-2 relative ${className}`} ref={containerRef}>
            {label && (
                <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
                    {icon} {label}
                </label>
            )}

            <div
                onClick={() => setIsOpen(true)}
                className={`
                    input-field cursor-pointer flex items-center justify-between group h-[52px]
                    ${isOpen ? 'border-[var(--bronze)] ring-4 ring-[var(--accent-glow)]' : ''}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedOption?.icon && <div className="text-[var(--bronze)]">{selectedOption.icon}</div>}
                    <span className={`truncate ${value ? 'text-[var(--espresso)] font-medium' : 'text-[var(--muted)]'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--bronze)]' : 'text-[var(--muted)] group-hover:text-[var(--bronze)]'}`} />
            </div>

            <PremiumModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={label || "Seleccionar Opciones"}
                subtitle={placeholder}
            >
                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[var(--silk)] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[var(--bronze)]/20 text-[var(--espresso)] font-medium"
                            autoFocus
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-full text-[var(--muted)] transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Options List */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleSelect(option.id)}
                                    className={`
                                        w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]
                                        ${value === option.id
                                            ? 'bg-[var(--bronze)]/10 text-[var(--bronze)]'
                                            : 'hover:bg-[var(--silk)] text-[var(--espresso)]'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        {option.icon && (
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${value === option.id ? 'bg-white border-white/50' : 'bg-white border-black/5'}`}>
                                                {option.icon}
                                            </div>
                                        )}
                                        <div className="text-left overflow-hidden">
                                            <div className="font-bold text-sm truncate">{option.label}</div>
                                            {option.description && (
                                                <div className={`text-[10px] uppercase tracking-wider font-bold opacity-60 truncate`}>
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {value === option.id && <Check size={18} className="shrink-0" />}
                                </button>
                            ))
                        ) : (
                            <div className="py-10 text-center space-y-2 opacity-40">
                                <Search size={32} className="mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">Sin resultados</p>
                            </div>
                        )}
                    </div>
                </div>
            </PremiumModal>
        </div>
    );
}
