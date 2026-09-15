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
    <div className="min-h-screen bg-brand-navy dark:bg-brand-navy light:bg-slate-100 flex">
      <Sidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header pathname={pathname} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
