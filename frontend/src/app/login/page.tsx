'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Brain, Lock, Mail, ArrowRight, Loader } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[var(--beige-light)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--bronze)] blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--espresso)] blur-[100px]" />
            </div>

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[var(--espresso)] rounded-3xl mx-auto flex items-center justify-center text-[var(--bronze)] shadow-2xl shadow-[var(--espresso)]/20 rotate-3 mb-6">
                        <Brain size={40} />
                    </div>
                    <h1 className="text-4xl font-serif text-[var(--espresso)] mb-2">Ana López</h1>
                    <p className="text-[var(--bronze)] text-xs font-bold uppercase tracking-[0.3em] opacity-80">Portal Clínico Profesional</p>
                </div>

                <div className="glass-card p-10 bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2 animate-shake">
                                <Lock size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] pl-1">Email Profesional</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--bronze)] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--beige-light)]/50 border border-[var(--cream)] focus:border-[var(--bronze)] focus:bg-white focus:ring-4 focus:ring-[var(--bronze)]/5 outline-none transition-all text-[var(--espresso)] font-medium placeholder-[var(--muted)]/50"
                                    placeholder="nombre@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] pl-1">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--bronze)] transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--beige-light)]/50 border border-[var(--cream)] focus:border-[var(--bronze)] focus:bg-white focus:ring-4 focus:ring-[var(--bronze)]/5 outline-none transition-all text-[var(--espresso)] font-medium placeholder-[var(--muted)]/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-[var(--espresso)] text-white font-medium shadow-lg shadow-[var(--espresso)]/20 hover:translate-y-[-2px] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : (
                                <>Ingresar al Sistema <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[var(--muted)] text-xs">
                    Software de Gestión Clínica v1.0 <br />
                    Acceso exclusivo para personal autorizado.
                </p>
            </div>
        </div>
    );
}
