'use client'; // Para poder usar usePathname

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from '@/i18n/I18nProvider';
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtenemos la ruta actual
  const pathname = usePathname();

  // Decidimos si mostrar el header
  // Por ejemplo, que solo aparezca en "/" y "/login"
  // y se oculte en cualquier otra ruta (ej: "/dashboard").
  const showHeader = (pathname === '/' || pathname.startsWith('/login'));

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <I18nProvider>

          {/* Renderiza el header solo si showHeader es true */}
          {showHeader && (
            <header style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
              <h1 style={{ margin: 0 }}>Let's Help</h1>
              {/* Selector de idioma en la esquina superior derecha */}
              <LanguageSwitcher />
            </header>
          )}

          <main>
            {children}
          </main>

        </I18nProvider>
      </body>
    </html>
  );
}
