'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-xl border-b border-[var(--cream)]/30 flex items-center justify-between px-6 z-50 lg:hidden">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-[var(--muted)] hover:text-[var(--bronze)] active:scale-90 transition-all"
            >
                <Menu size={24} strokeWidth={1.5} />
            </button>

            <div className="flex flex-col items-center flex-1">
                <span className="font-serif font-bold text-[var(--espresso)] text-lg leading-tight tracking-tight">Ana López</span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-[var(--bronze)] font-bold opacity-70">Psicología Clínica</span>
            </div>

            <div className="flex items-center gap-1">
                <button className="p-2.5 text-[var(--muted)] hover:text-[var(--bronze)] active:scale-90 transition-all">
                    <Search size={20} strokeWidth={1.5} />
                </button>
                <button className="p-2.5 text-[var(--muted)] hover:text-[var(--bronze)] relative active:scale-90 transition-all">
                    <Bell size={20} strokeWidth={1.5} />
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white" />
                </button>
            </div>
        </header>
    );
}
