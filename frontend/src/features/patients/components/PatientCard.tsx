'use client';

import React from 'react';
import Link from 'next/link';
import { User, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';
import type { Patient } from '../types';

interface PatientCardProps {
    patient: Patient;
}

export default function PatientCard({ patient }: PatientCardProps) {
    return (
        <Link
            href={`/patients/${patient.id}`}
            className="glass-card p-8 block group hover:border-[var(--bronze)]/50 relative overflow-hidden"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--beige-light)] flex items-center justify-center text-[var(--bronze)] group-hover:bg-[var(--bronze)] group-hover:text-white transition-all duration-500 shadow-sm border border-[var(--cream)]/30">
                        <User size={30} strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-[var(--espresso)] serif leading-snug group-hover:text-[var(--bronze)] transition-colors">
                            {patient.full_name}
                        </h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                            Activo
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {patient.phone && (
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)] font-light">
                        <Phone size={14} className="text-[var(--bronze)]/60" />
                        {patient.phone}
                    </div>
                )}
                {patient.email && (
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)] font-light">
                        <Mail size={14} className="text-[var(--bronze)]/60" />
                        <span className="truncate">{patient.email}</span>
                    </div>
                )}
                {patient.birth_date && (
                    <div className="flex items-center gap-3 text-sm text-[var(--muted)] font-light">
                        <Calendar size={14} className="text-[var(--bronze)]/60" />
                        <span>Nac: {new Date(patient.birth_date).toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--cream)]/10 flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-light italic">
                    Ver expediente completo
                </span>
                <div className="p-2 rounded-full bg-[var(--cream)]/20 text-[var(--bronze)] group-hover:bg-[var(--bronze)] group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                </div>
            </div>

            {/* Subtle decorative background icon */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <User size={120} />
            </div>
        </Link>
    );
}
