import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import AppLayoutClient from '@/components/layout/AppLayoutClient';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Eco Soluções — Plataforma Corporativa',
  description: 'Plataforma corporativa digital para gestão interna e comunicação entre setores.',
  keywords: 'gestão corporativa, mural digital, demandas, setores, produtividade',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <AppProvider>
            <AppLayoutClient>{children}</AppLayoutClient>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
