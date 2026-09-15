'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg-body)] flex transition-colors duration-300 w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[var(--bg-body)]">
        <Header pathname={pathname} />
        <main className="flex-1 p-8 lg:p-12 overflow-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
