'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* Root Sidebar (Desktop) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 scrollbar-hide">
                    <div className="max-w-7xl mx-auto px-6 py-6 lg:px-10 lg:py-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
