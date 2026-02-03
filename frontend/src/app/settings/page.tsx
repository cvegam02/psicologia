'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Users as UsersIcon,
    MessageCircle,
    ChevronRight,
    Search,
    UserPlus,
    Trash2
} from 'lucide-react';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/features/auth/hooks/useProfiles';
import { authApi } from '@/features/auth/api';
import NewUserModal from '@/features/auth/components/NewUserModal';

type SettingsTab = 'general' | 'users' | 'whatsapp';

export default function Settings() {
    const { isOwner, loading: authLoading } = useUserRole();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    if (authLoading) return <div className="p-8 text-center italic text-[var(--muted)]">Verificando accesos...</div>;

    if (!isOwner) {
        router.push('/');
        return null;
    }

    const tabs = [
        { id: 'general', label: 'General', icon: SettingsIcon },
        { id: 'users', label: 'Gestión de Usuarios', icon: UsersIcon },
        { id: 'whatsapp', label: 'WhatsApp & Automatización', icon: MessageCircle },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div>
                <div className="flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                    <SettingsIcon size={12} /> Administración
                </div>
                <h1 className="text-4xl lg:text-5xl font-semibold text-[var(--espresso)] serif tracking-tight">
                    Configuración <span className="text-[var(--bronze)] italic">Sistema</span>
                </h1>
                <p className="mt-4 text-[var(--muted)] font-light max-w-xl leading-relaxed">
                    Gestiona los accesos del equipo, credenciales de WhatsApp y ajustes generales de la plataforma.
                </p>
            </div>

            <div className="flex gap-4 border-b border-[var(--cream)]/30 overflow-x-auto pb-4 hide-scrollbar">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SettingsTab)}
                            className={`
                                flex items-center gap-3 px-6 py-3 rounded-2xl transition-all whitespace-nowrap
                                ${isActive
                                    ? 'bg-[var(--espresso)] text-white shadow-lg shadow-[var(--espresso)]/20'
                                    : 'text-[var(--muted)] hover:bg-[var(--beige-light)] hover:text-[var(--espresso)]'}
                            `}
                        >
                            <tab.icon size={18} />
                            <span className="text-sm font-medium tracking-wide">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'whatsapp' && <WhatsAppSettings />}
            </div>
        </div>
    );
}

function GeneralSettings() {
    return (
        <div className="glass-card p-8 space-y-8 max-w-4xl">
            <div>
                <h3 className="text-xl font-serif text-[var(--espresso)] font-semibold mb-4 text-center">Información de la Clínica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Nombre Comercial</label>
                        <input type="text" className="input-field" defaultValue="Consultorio Ana López" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Especialidad Principal</label>
                        <input type="text" className="input-field" defaultValue="Psicología Clínica" />
                    </div>
                </div>
                <button className="premium-button premium-button-primary mt-8 float-right">Guardar Cambios</button>
                <div className="clear-both" />
            </div>
        </div>
    );
}

function UserManagement() {
    const { profiles, loading, refresh } = useProfiles();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string, email: string) => {
        if (confirm(`¿Estás seguro de que quieres eliminar a ${email}?`)) {
            try {
                await authApi.deleteUser(id);
                refresh();
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        className="input-field pl-12"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-button premium-button-primary flex items-center gap-3"
                >
                    <UserPlus size={18} /> Nuevo Usuario
                </button>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--beige-light)]/50 border-b border-[var(--cream)]/30">
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Usuario</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Correo</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Rol</th>
                            <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--cream)]/30">
                        {loading ? (
                            <tr><td colSpan={4} className="p-12 text-center text-[var(--muted)] italic">Cargando usuarios...</td></tr>
                        ) : filteredProfiles.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-[var(--muted)] italic">No se encontraron usuarios.</td></tr>
                        ) : filteredProfiles.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--beige-light)]/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--cream)]/30 flex items-center justify-center text-[var(--espresso)] font-bold">
                                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-[var(--espresso)]">{user.full_name || 'Sin nombre'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-sm text-[var(--muted)] font-light">{user.email}</td>
                                <td className="px-8 py-6">
                                    <span className={`
                                        text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full
                                        ${user.role === 'owner' ? 'bg-amber-100 text-amber-700' :
                                            user.role === 'psychologist' ? 'bg-emerald-100 text-emerald-700' :
                                                'bg-sky-100 text-sky-700'}
                                    `}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {user.role !== 'owner' && (
                                        <button
                                            onClick={() => handleDelete(user.id, user.email)}
                                            className="text-rose-400 hover:text-rose-600 transition-colors p-2"
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <NewUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refresh}
            />
        </div>
    );
}

function WhatsAppSettings() {
    return (
        <div className="glass-card p-8 space-y-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/10">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-[var(--espresso)] font-semibold">Meta Business API</h3>
                    <p className="text-xs text-[var(--muted)]">Configura el envío automático de recordatorios por WhatsApp.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">ID del Número de Teléfono</label>
                        <input type="text" className="input-field" placeholder="Pega aquí el Phone ID de Meta" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Token de Acceso (Permanente)</label>
                        <input type="password" className="input-field" placeholder="••••••••••••••••••••••••" />
                    </div>
                </div>

                <div className="p-6 bg-[var(--beige-light)]/50 rounded-2xl border border-[var(--cream)]/30">
                    <h4 className="text-sm font-bold text-[var(--espresso)] uppercase tracking-wider mb-4">Prueba de Conexión</h4>
                    <p className="text-xs text-[var(--muted)] mb-6 font-light leading-relaxed">
                        Envía un mensaje de prueba al número administrador para verificar que los recordatorios funcionarán correctamente.
                    </p>
                    <div className="flex gap-4">
                        <input type="text" className="input-field max-w-[200px]" placeholder="+52 ..." />
                        <button className="premium-button premium-button-secondary">Enviar Test</button>
                    </div>
                </div>
            </div>

            <button className="premium-button premium-button-primary mt-8 float-right">Guardar Conexión</button>
            <div className="clear-both" />
        </div>
    );
}
