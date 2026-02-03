'use client';

import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[var(--cream)] flex items-center justify-between px-6 z-50 lg:hidden">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-[var(--espresso)] hover:bg-[var(--silk)] rounded-xl active:scale-95 transition-transform"
                >
                    <Menu size={22} strokeWidth={1.5} />
                </button>
                <span className="font-bold text-[var(--espresso)] tracking-tighter font-[family-name:var(--font-outfit)]">Ana López</span>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 text-[var(--muted)] hover:text-[var(--bronze)] transition-colors">
                    <Search size={22} />
                </button>
                <button className="p-2 text-[var(--muted)] hover:text-[var(--bronze)] transition-colors relative">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>
            </div>
        </header>
    );
}
