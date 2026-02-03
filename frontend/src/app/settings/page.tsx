'use client';

import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Users as UsersIcon,
    MessageCircle,
    ChevronRight,
    Search,
    UserPlus,
    Trash2,
    Clock,
    Calendar,
    Save,
    Check,
    User,
    ChevronLeft,
    Monitor,
    ShieldCheck,
    Smartphone
} from 'lucide-react';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/features/auth/hooks/useProfiles';
import { authApi } from '@/features/auth/api';
import NewUserModal from '@/features/auth/components/NewUserModal';
import { supabase } from '@/lib/supabase';
import PremiumSelect from '@/components/ui/PremiumSelect';

type SettingsTab = 'general' | 'users' | 'schedules' | 'whatsapp';

export default function Settings() {
    const { isOwner, loading: authLoading } = useUserRole();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);

    if (authLoading) return <div className="p-8 text-center italic text-[var(--muted)]">Verificando accesos...</div>;

    if (!isOwner) {
        router.push('/');
        return null;
    }

    const tabs = [
        {
            id: 'general',
            label: 'General',
            description: 'Nombre de la clínica y ajustes básicos de identidad.',
            icon: SettingsIcon,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            id: 'users',
            label: 'Usuarios',
            description: 'Gestiona accesos, roles y perfiles del equipo.',
            icon: UsersIcon,
            color: 'bg-purple-50 text-purple-600'
        },
        {
            id: 'schedules',
            label: 'Horarios',
            description: 'Define jornadas laborales y disponibilidad profesional.',
            icon: Clock,
            color: 'bg-amber-50 text-amber-600'
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            description: 'Meta Business API y automatización de mensajes.',
            icon: MessageCircle,
            color: 'bg-emerald-50 text-emerald-600'
        },
    ];

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto">
            {!activeTab ? (
                /* --- BENTO HUB VIEW (ALL DEVICES) --- */
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-[0.3em]">
                            <ShieldCheck size={12} /> Administración
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-[var(--espresso)] serif tracking-tight">
                            Configuración <span className="text-[var(--bronze)] italic">Sistema</span>
                        </h1>
                        <p className="max-w-xl text-[var(--muted)] font-light leading-relaxed">
                            Accede a las herramientas de gestión administrativa y técnica para optimizar tu consulta.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as SettingsTab)}
                                className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-[var(--cream)]/30 hover:border-[var(--bronze)]/50 hover:shadow-2xl hover:shadow-[var(--bronze)]/5 transition-all duration-500 text-left group relative overflow-hidden"
                            >
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${tab.color}`}>
                                    <tab.icon size={24} className="sm:hidden" />
                                    <tab.icon size={26} className="hidden sm:block" />
                                </div>
                                <div className="space-y-1.5 sm:space-y-2">
                                    <h3 className="font-bold text-xl tracking-tight text-[var(--espresso)] leading-tight">{tab.label}</h3>
                                    <p className="text-xs font-medium leading-relaxed text-[var(--muted)] opacity-80">
                                        {tab.description}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-4 flex items-center gap-2 text-[var(--bronze)] text-[10px] font-bold uppercase tracking-widest sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    Configurar <ChevronRight size={12} />
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[var(--silk)] rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 -z-0 opacity-50 transition-transform group-hover:scale-110" />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* --- DETAIL VIEW (ALL DEVICES) --- */
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Interior Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--cream)]/30 pb-10">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setActiveTab(null)}
                                className="w-12 h-12 rounded-2xl bg-white border border-[var(--cream)]/30 shadow-sm flex items-center justify-center text-[var(--espresso)] hover:border-[var(--bronze)]/50 hover:text-[var(--bronze)] transition-all active:scale-95"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${currentTab?.color}`}>
                                    {currentTab && <currentTab.icon size={22} />}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif text-[var(--espresso)] font-semibold leading-tight">
                                        {currentTab?.label}
                                    </h2>
                                    <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1">
                                        Configuración / {currentTab?.label}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 p-1 bg-[var(--silk)] rounded-2xl border border-[var(--cream)]/20">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                                    className={`
                                        p-2 rounded-xl transition-all
                                        ${activeTab === tab.id
                                            ? 'bg-white shadow-sm text-[var(--bronze)]'
                                            : 'text-[var(--muted)]/50 hover:text-[var(--bronze)]'}
                                    `}
                                    title={tab.label}
                                >
                                    <tab.icon size={18} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'schedules' && <ScheduleManagement />}
                        {activeTab === 'whatsapp' && <WhatsAppSettings />}
                    </div>
                </div>
            )}
        </div>
    );
}

function GeneralSettings() {
    return (
        <div className="glass-card p-5 sm:p-8 space-y-8 max-w-4xl">
            <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                        <SettingsIcon size={20} />
                    </div>
                    <h3 className="text-xl font-serif text-[var(--espresso)] font-semibold">Información de la Clínica</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Nombre Comercial</label>
                        <input type="text" className="input-field h-12 sm:h-auto" defaultValue="Consultorio Ana López" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Especialidad Principal</label>
                        <input type="text" className="input-field h-12 sm:h-auto" defaultValue="Psicología Clínica" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button className="premium-button premium-button-primary w-full sm:w-auto h-12 sm:h-auto">
                        Guardar Cambios
                    </button>
                </div>
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

    const RoleBadge = ({ role }: { role: string }) => {
        const styles = {
            owner: 'bg-amber-100 text-amber-700 border-amber-200',
            psychologist: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            assistant: 'bg-sky-100 text-sky-700 border-sky-200'
        }[role] || 'bg-slate-100 text-slate-700 border-slate-200';

        const label = {
            owner: 'Admin',
            psychologist: 'Psicólogo',
            assistant: 'Asistente'
        }[role] || role;

        return (
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${styles}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Header / Search Controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--bronze)] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        className="input-field pl-12 h-14"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-button premium-button-primary flex items-center gap-3 h-14 px-8 shadow-xl shadow-[var(--bronze)]/20"
                >
                    <UserPlus size={18} /> <span className="whitespace-nowrap">Nuevo Usuario</span>
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-[var(--muted)] italic animate-pulse">Cargando equipo...</div>
            ) : filteredProfiles.length === 0 ? (
                <div className="py-20 text-center text-[var(--muted)] italic glass-card bg-[var(--silk)]/30">
                    No se encontraron usuarios que coincidan con la búsqueda.
                </div>
            ) : (
                <>
                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden md:block glass-card overflow-hidden border-[var(--cream)]/30">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--silk)]/50 border-b border-[var(--cream)]/30">
                                    <th className="pl-8 pr-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Equipo</th>
                                    <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Contacto</th>
                                    <th className="px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Acceso</th>
                                    <th className="pl-4 pr-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--cream)]/20">
                                {filteredProfiles.map((user) => (
                                    <tr key={user.id} className="hover:bg-[var(--silk)]/40 transition-colors group">
                                        <td className="pl-8 pr-4 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-[var(--cream)]/30 flex items-center justify-center text-[var(--espresso)] font-bold shadow-sm">
                                                    {user.full_name?.charAt(0) || user.email.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-[var(--espresso)] tracking-tight">{user.full_name || 'Personal sin nombre'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-6 text-sm text-[var(--muted)] font-light">{user.email}</td>
                                        <td className="px-4 py-6">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="pl-4 pr-8 py-6 text-right">
                                            {user.role !== 'owner' && (
                                                <button
                                                    onClick={() => handleDelete(user.id, user.email)}
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
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

                        {/* MOBILE CARDS VIEW */}
                    </div>
                    <div className="md:hidden space-y-4">
                        {filteredProfiles.map((user) => (
                            <div key={user.id} className="glass-card p-5 flex flex-col gap-4 border-[var(--cream)]/30 hover:border-[var(--bronze)]/20 transition-all active:scale-[0.98]">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4 text-left min-w-0">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--cream)]/30 flex items-center justify-center text-[var(--espresso)] font-bold text-xl shadow-sm border border-white/50 shrink-0">
                                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <span className="font-bold text-[var(--espresso)] text-lg leading-tight tracking-tight truncate">
                                                {user.full_name || 'Personal'}
                                            </span>
                                            <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest truncate">
                                                ID: {user.id.substring(0, 8)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <RoleBadge role={user.role} />
                                        {user.role !== 'owner' && (
                                            <button
                                                onClick={() => handleDelete(user.id, user.email)}
                                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-50 text-rose-500 active:bg-rose-100 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[var(--silk)] flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--silk)] flex items-center justify-center text-[var(--muted)]">
                                        <MessageCircle size={14} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.1em]">Contacto Directo</span>
                                        <span className="text-sm font-medium text-[var(--espresso)] truncate">{user.email}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <NewUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refresh}
            />
        </div>
    );
}

function ScheduleManagement() {
    const { profiles, loading: loadingProfiles } = useProfiles();
    const [selectedPsychologist, setSelectedPsychologist] = useState<string>('');
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const psychologists = profiles.filter(p => p.role === 'psychologist' || p.role === 'owner');

    useEffect(() => {
        if (selectedPsychologist) {
            loadSchedules();
        }
    }, [selectedPsychologist]);

    const loadSchedules = async () => {
        setLoadingSchedules(true);
        try {
            const { data, error } = await supabase
                .from('psychologist_schedules')
                .select('*')
                .eq('psychologist_id', selectedPsychologist)
                .order('day_of_week', { ascending: true });

            if (error) throw error;

            // Ensure all 7 days are present
            const fullSchedule = Array.from({ length: 7 }, (_, i) => {
                const existing = data?.find(s => s.day_of_week === i);
                return existing || {
                    psychologist_id: selectedPsychologist,
                    day_of_week: i,
                    start_time: '08:00:00',
                    end_time: '20:00:00',
                    is_active: i > 0 && i < 6 // Active Mon-Fri by default
                };
            });

            setSchedules(fullSchedule);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('psychologist_schedules')
                .upsert(schedules, { onConflict: 'psychologist_id,day_of_week' });

            if (error) throw error;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Error al guardar horarios');
        } finally {
            setSaving(false);
        }
    };

    const updateDay = (dayIndex: number, updates: any) => {
        setSchedules(prev => prev.map(s => s.day_of_week === dayIndex ? { ...s, ...updates } : s));
    };

    const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="glass-card p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/10 shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-[var(--espresso)] font-semibold leading-tight">Horarios de Atención</h3>
                        <p className="text-xs text-[var(--muted)] mt-1">Configura las jornadas laborales de cada psicólogo para la agenda.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="max-w-md w-full">
                        <PremiumSelect
                            label="Seleccionar Psicólogo"
                            options={psychologists.map(p => ({
                                id: p.id,
                                label: p.full_name || p.email,
                                description: p.role === 'owner' ? 'Administrador / Psicólogo' : 'Psicólogo Clínico',
                                icon: <User size={18} />
                            }))}
                            value={selectedPsychologist}
                            onChange={setSelectedPsychologist}
                            placeholder="Selecciona un profesional..."
                            icon={<UsersIcon size={12} />}
                        />
                    </div>

                    {loadingProfiles && <div className="py-12 text-center text-[var(--muted)] italic">Buscando psicólogos...</div>}

                    {selectedPsychologist && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 gap-3">
                                {schedules.map((day) => (
                                    <div
                                        key={day.day_of_week}
                                        className={`
                                            flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-2xl border transition-all
                                            ${day.is_active ? 'bg-white border-[var(--bronze)]/20 shadow-sm' : 'bg-[var(--silk)]/30 border-transparent opacity-60'}
                                        `}
                                    >
                                        <div
                                            className="flex items-center gap-3 w-full sm:w-32 shrink-0 cursor-pointer select-none"
                                            onClick={() => updateDay(day.day_of_week, { is_active: !day.is_active })}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                ${day.is_active ? 'bg-[var(--bronze)] border-[var(--bronze)]' : 'bg-white border-black/10'}
                                            `}>
                                                {day.is_active && <Check size={12} className="text-white" />}
                                            </div>
                                            <span className={`text-sm font-bold ${day.is_active ? 'text-[var(--espresso)]' : 'text-[var(--muted)]'}`}>
                                                {weekDays[day.day_of_week]}
                                            </span>
                                        </div>

                                        {day.is_active ? (
                                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                                                <div className="flex-1 sm:flex-none relative">
                                                    <input
                                                        type="time"
                                                        className="input-field py-2 px-3 text-sm h-[48px] sm:h-10 w-full sm:w-32 text-center sm:text-left"
                                                        value={day.start_time.substring(0, 5)}
                                                        onChange={(e) => updateDay(day.day_of_week, { start_time: e.target.value + ':00' })}
                                                    />
                                                </div>
                                                <span className="text-[var(--muted)] font-medium px-1">a</span>
                                                <div className="flex-1 sm:flex-none relative">
                                                    <input
                                                        type="time"
                                                        className="input-field py-2 px-3 text-sm h-[48px] sm:h-10 w-full sm:w-32 text-center sm:text-left"
                                                        value={day.end_time.substring(0, 5)}
                                                        onChange={(e) => updateDay(day.day_of_week, { end_time: e.target.value + ':00' })}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)] px-1">Descanso</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[var(--cream)]/30">
                                <p className="text-[10px] text-[var(--muted)] text-center sm:text-left leading-relaxed max-w-[240px]">
                                    Los cambios afectarán inmediatamente a los espacios disponibles en la agenda del psicólogo seleccionado.
                                </p>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="premium-button premium-button-primary w-full sm:w-auto flex items-center justify-center gap-3 h-[52px] sm:h-auto group"
                                >
                                    {saving ? 'Guardando...' : success ? <><Check size={18} /> Guardado</> : <><Save size={18} className="group-hover:scale-110 transition-transform" /> Guardar Horarios</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function WhatsAppSettings() {
    return (
        <div className="glass-card p-5 sm:p-8 space-y-8 max-w-4xl">
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/10">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-[var(--espresso)] font-semibold">Meta Business API</h3>
                    <p className="text-xs text-[var(--muted)]">Configura el envío automático de recordatorios por WhatsApp.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">ID del Número de Teléfono</label>
                        <input type="text" className="input-field h-12 sm:h-auto" placeholder="Pega aquí el Phone ID de Meta" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Token de Acceso (Permanente)</label>
                        <input type="password" className="input-field h-12 sm:h-auto" placeholder="••••••••••••••••••••••••" />
                    </div>
                </div>

                <div className="p-5 sm:p-6 bg-[var(--silk)]/50 rounded-2xl border border-[var(--cream)]/30">
                    <h4 className="text-sm font-bold text-[var(--espresso)] uppercase tracking-wider mb-4">Prueba de Conexión</h4>
                    <p className="text-xs text-[var(--muted)] mb-6 font-light leading-relaxed">
                        Envía un mensaje de prueba al número administrador para verificar que los recordatorios funcionarán correctamente.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" className="input-field sm:max-w-[200px] h-12 sm:h-auto text-center sm:text-left" placeholder="+52 ..." />
                        <button className="premium-button premium-button-secondary w-full sm:w-auto h-12 sm:h-auto">Enviar Test</button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button className="premium-button premium-button-primary w-full sm:w-auto h-12 sm:h-auto">
                    Guardar Conexión
                </button>
            </div>
        </div>
    );
}
