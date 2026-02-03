'use client';

import React, { useState } from 'react';
import { Search, Plus, Filter, UserX } from 'lucide-react';
import PatientCard from './PatientCard';
import type { Patient } from '../types';

interface PatientListProps {
    patients: Patient[];
    loading: boolean;
    onNewClick: () => void;
}

export default function PatientList({ patients, loading, onNewClick }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--bronze)] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-14 shadow-sm"
                    />
                </div>

                <div className="flex gap-4">
                    <button className="px-5 py-3 rounded-xl border border-[var(--cream)] text-[var(--muted)] hover:bg-[var(--beige-light)] transition-all flex items-center gap-2 text-sm font-medium">
                        <Filter size={18} /> Filtrar
                    </button>
                    <button
                        onClick={onNewClick}
                        className="premium-button premium-button-primary flex items-center gap-2 justify-center"
                    >
                        <Plus size={18} /> Nuevo Paciente
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-64 animate-pulse bg-slate-50/50" />
                    ))}
                </div>
            ) : filteredPatients.length === 0 ? (
                <div className="text-center py-24 glass-card border-dashed border-2">
                    <div className="w-20 h-20 rounded-full bg-[var(--beige-light)] flex items-center justify-center text-[var(--muted)] mx-auto mb-6 opacity-50">
                        <UserX size={40} />
                    </div>
                    <p className="text-[var(--muted)] font-light italic">No se encontraron pacientes en tu base de datos.</p>
                    <button onClick={onNewClick} className="mt-8 text-[var(--bronze)] font-semibold hover:underline flex items-center gap-2 mx-auto uppercase text-xs tracking-widest">
                        Añadir mi primer paciente <Plus size={14} />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPatients.map((patient) => (
                        <PatientCard key={patient.id} patient={patient} />
                    ))}
                </div>
            )}
        </div>
    );
}
