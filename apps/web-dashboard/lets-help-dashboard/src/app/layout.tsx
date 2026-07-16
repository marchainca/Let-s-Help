'use client'; // Para poder usar usePathname

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from '@/i18n/I18nProvider';
import PublicAppBar from './components/PublicAppBar';
import { usePathname } from 'next/navigation';
import QueryProvider from '@/providers/QueryProvider';
import AppThemeProvider from '@/providers/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appBarHeight = 64;

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
          <QueryProvider>
            <AppThemeProvider>
              {showHeader && <PublicAppBar />}

              <main
                style={{
                  marginTop: showHeader ? `${appBarHeight}px` : 0,
                  minHeight: showHeader ? `calc(100vh - ${appBarHeight}px)` : '100vh',
                }}
              >
                {children}
              </main>
            </AppThemeProvider>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
