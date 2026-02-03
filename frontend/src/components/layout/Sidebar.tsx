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
                fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-[var(--cream)]/30 flex flex-col
                transition-transform duration-500 var(--ease-out-expo)
                lg:static lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Section - Editorial Style */}
                <div className="p-8 pb-10 flex flex-col items-center relative">
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute top-6 right-6 p-2 text-[var(--muted)] hover:text-[var(--espresso)] transition-colors"
                    >
                        <X size={22} />
                    </button>

                    <div className="relative group mb-6">
                        <div className="absolute inset-0 bg-[var(--bronze)]/20 blur-2xl rounded-full group-hover:bg-[var(--bronze)]/30 transition-all duration-700" />
                        <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-[var(--espresso)] to-[#2D241E] flex items-center justify-center text-white relative z-10 shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
                            <BrainCircuit size={32} strokeWidth={1.2} className="text-[var(--bronze)]" />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-serif font-bold text-[var(--espresso)] tracking-normal">
                            Ana López
                        </h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-[1px] w-4 bg-[var(--bronze)]/30" />
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--bronze)] font-bold">
                                Psicología
                            </p>
                            <div className="h-[1px] w-4 bg-[var(--bronze)]/30" />
                        </div>
                    </div>
                </div>

                {/* Navigation - Premium List */}
                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden
                                    ${isActive
                                        ? 'bg-[var(--silk)] text-[var(--espresso)]'
                                        : 'text-[var(--muted)] hover:text-[var(--espresso)] hover:bg-[var(--silk)]/50'
                                    }
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                                    ${isActive ? 'bg-white shadow-sm text-[var(--bronze)]' : 'bg-transparent group-hover:bg-white group-hover:shadow-sm text-[var(--muted)] group-hover:text-[var(--bronze)]'}
                                `}>
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2 : 1.5}
                                    />
                                </div>
                                <span className={`text-sm tracking-tight transition-all duration-300 ${isActive ? 'font-bold' : 'font-medium group-hover:translate-x-1'}`}>
                                    {item.name}
                                </span>

                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--bronze)] rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer - Professional Profile Section */}
                <div className="p-6 pb-8 mt-auto space-y-3 border-t border-[var(--cream)]/20 bg-[var(--silk)]/30">
                    {loading ? (
                        <div className="h-12 w-full bg-[var(--cream)]/20 animate-pulse rounded-2xl" />
                    ) : (
                        <div className="mb-4 px-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--espresso)] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-[var(--espresso)]/10">
                                AL
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-[var(--espresso)] truncate">Dra. Ana López</span>
                                <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider font-bold">Administrador</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        {isOwner && (
                            <Link
                                href="/settings"
                                onClick={onClose}
                                className={`flex items-center justify-center gap-2 h-11 rounded-xl transition-all border text-[10px] font-bold uppercase tracking-widest ${pathname === '/settings'
                                        ? 'bg-[var(--silk)] text-[var(--espresso)] border-[var(--bronze)]/50 shadow-inner'
                                        : 'bg-white text-[var(--muted)] border-[var(--cream)]/50 hover:border-[var(--bronze)]/50 hover:text-[var(--espresso)]'
                                    }`}
                                title="Configuración"
                            >
                                <Settings size={14} />
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 h-11 rounded-xl transition-all border border-rose-100 bg-rose-50/30 text-rose-500 hover:bg-rose-50 text-[10px] font-bold uppercase tracking-widest"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
