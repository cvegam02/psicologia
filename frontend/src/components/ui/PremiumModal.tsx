'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string; // e.g. 'max-w-md'
}

export default function PremiumModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    maxWidth = 'max-w-md'
}: PremiumModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className={`
                relative w-full ${maxWidth} bg-white 
                rounded-t-[2rem] sm:rounded-[2.5rem] 
                shadow-2xl animate-slide-up sm:animate-fade-in
                pb-10 sm:pb-8 px-6 pt-4 sm:pt-6
                flex flex-col gap-6
            `}>
                {/* Mobile Handle */}
                <div className="w-12 h-1.5 bg-[var(--cream)] rounded-full mx-auto mb-2 opacity-50 sm:hidden" />

                {/* Header */}
                {(title || subtitle) && (
                    <div className="flex justify-between items-start">
                        <div>
                            {title && <h3 className="text-2xl font-bold text-[var(--espresso)] font-[family-name:var(--font-outfit)] tracking-tight">{title}</h3>}
                            {subtitle && <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-[var(--silk)] hover:bg-[var(--cream)]/30 rounded-full text-[var(--espresso)] transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="w-full">
                    {children}
                </div>

                {/* Footer Close (Mobile Only, if needed) */}
                <div className="sm:hidden -mt-4">
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-xs font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--espresso)] transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
