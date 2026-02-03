import type { Metadata } from 'next';
import './globals.css';
import MainLayout from '@/components/layout/MainLayout';
import { Outfit, Inter, Lora } from 'next/font/google';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const lora = Lora({
    subsets: ['latin'],
    variable: '--font-lora',
    display: 'swap',
    style: ['italic', 'normal'],
});

export const metadata: Metadata = {
    title: 'Ana López | Psicología Clínica',
    description: 'Asistente inteligente y gestión clínica para la práctica de Ana López.',
    manifest: '/manifest.json',
};

export const viewport = {
    themeColor: '#8E6B20',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={`scroll-smooth ${outfit.variable} ${inter.variable} ${lora.variable}`}>
            <body className="min-h-screen selection:bg-[#8E6B20]/20 selection:text-[#8E6B20] font-sans antialiased">
                <MainLayout>{children}</MainLayout>
            </body>
        </html>
    );
}
