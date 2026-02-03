'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Users,
    Calendar,
    LayoutDashboard,
    Settings,
    LogOut,
    BrainCircuit,
    X
} from 'lucide-react';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Pacientes', href: '/patients', icon: Users },
    { name: 'Agenda', href: '/agenda', icon: Calendar },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isOwner, loading } = useUserRole();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        onClose();
    };

    return (
        <>
            {/* Overlay (Mobile) */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar Content */}
            <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-[var(--item-bg)] border-r border-[var(--glass-border)] flex flex-col
        transition-transform duration-500 var(--ease-out-expo)
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo Section - Compacted */}
                <div className="p-6 flex flex-col items-center border-b border-[var(--glass-border)]">
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--espresso)]"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--bronze)] to-[#B8860B] flex items-center justify-center text-white mb-4 shadow-lg shadow-[var(--bronze)]/20 rotate-3 transition-transform hover:rotate-0 duration-500">
                        <BrainCircuit size={28} strokeWidth={1} />
                    </div>
                    <h1 className="text-xl font-bold text-[var(--espresso)] tracking-tighter text-center font-[family-name:var(--font-outfit)]">
                        Ana López
                    </h1>
                    <p className="text-[9px] items-center uppercase tracking-[0.2em] text-[var(--bronze)] mt-1 font-bold opacity-60">
                        Psicología Clínica
                    </p>
                </div>

                {/* Navigation - Compacted px */}
                <nav className="flex-1 px-4 space-y-1.5 mt-8">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-[family-name:var(--font-inter)]
                  ${isActive
                                        ? 'bg-[var(--accent-glow)] text-[var(--espresso)] shadow-sm'
                                        : 'text-[var(--muted)] hover:text-[var(--bronze)] hover:bg-[var(--silk)]'
                                    }
                `}
                            >
                                <item.icon
                                    size={18}
                                    strokeWidth={isActive ? 2 : 1.5}
                                    className={`transition-colors ${isActive ? 'text-[var(--bronze)]' : 'group-hover:text-[var(--bronze)]'}`}
                                />
                                <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-1 rounded-full bg-[var(--bronze)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer - Compacted */}
                <div className="p-4 mt-auto space-y-1.5 border-t border-[var(--glass-border)]">
                    {loading ? (
                        <div className="h-10 w-full bg-[var(--silk)] animate-pulse rounded-xl" />
                    ) : isOwner && (
                        <Link
                            href="/settings"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 w-full rounded-xl transition-all text-xs font-semibold font-[family-name:var(--font-inter)] ${pathname === '/settings'
                                ? 'bg-[var(--accent-glow)] text-[var(--espresso)] shadow-sm'
                                : 'text-[var(--muted)] hover:text-[var(--bronze)] hover:bg-[var(--silk)]'
                                }`}
                        >
                            <Settings size={16} strokeWidth={1.5} className={pathname === '/settings' ? 'text-[var(--bronze)]' : ''} />
                            Configuración
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-rose-500/80 hover:bg-rose-50 rounded-xl transition-all text-xs font-semibold font-[family-name:var(--font-inter)]"
                    >
                        <LogOut size={16} strokeWidth={1.5} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
}
