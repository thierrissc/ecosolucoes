'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-0 w-full flex flex-col">
      <TopNav pathname={pathname} />
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 md:py-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
