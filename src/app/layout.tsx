import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import AppLayoutClient from '../components/layout/AppLayoutClient';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] });

export const metadata: Metadata = {
  title: 'Eco Soluções — Plataforma Corporativa',
  description: 'Plataforma corporativa digital para gestão interna e comunicação entre setores.',
  keywords: 'gestão corporativa, mural digital, demandas, setores, produtividade',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider>
          <AppProvider>
            <AppLayoutClient>{children}</AppLayoutClient>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
