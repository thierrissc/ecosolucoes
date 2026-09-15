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
        <main className="flex-1 px-6 md:px-10 lg:px-12 xl:px-16 py-8 md:py-10 lg:py-12 overflow-auto w-full">
          <div className="max-w-[1600px] mx-auto w-full space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
