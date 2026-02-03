'use client';

import React, { useState } from 'react';
import { X, Mail, Key, User, Shield } from 'lucide-react';
import { authApi } from '../api';
import type { UserRole } from '../types';

interface NewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NewUserModal({ isOpen, onClose, onSuccess }: NewUserModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('psychologist');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authApi.createUser({
                email,
                password,
                full_name: fullName,
                role
            });
            onSuccess();
            onClose();
            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('psychologist');
        } catch (err: any) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-[var(--cream)]/30 flex justify-between items-center bg-[var(--beige-light)]/30">
                    <div>
                        <h2 className="text-2xl font-serif text-[var(--espresso)] font-semibold">Nuevo Usuario</h2>
                        <p className="text-xs text-[var(--muted)] uppercase tracking-widest mt-1">Registrar Colega</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                            <input
                                required
                                type="text"
                                className="input-field pl-12"
                                placeholder="P. ej. Laura Pérez"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                            <input
                                required
                                type="email"
                                className="input-field pl-12"
                                placeholder="correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Contraseña Provisoria</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                            <input
                                required
                                type="password"
                                className="input-field pl-12"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] ml-1">Rol de Usuario</label>
                        <div className="relative">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                            <select
                                className="input-field pl-12 appearance-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                            >
                                <option value="psychologist">Psicólogo</option>
                                <option value="receptionist">Recepcionista</option>
                                <option value="owner">Dueño / Administrador</option>
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="premium-button premium-button-primary w-full py-4 mt-4"
                    >
                        {loading ? 'Creando...' : 'Crear Cuenta'}
                    </button>
                </form>
            </div>
        </div>
    );
}
