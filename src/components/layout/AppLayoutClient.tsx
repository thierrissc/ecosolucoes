'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/layout/TopNav';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-surface-0 transition-colors duration-400 w-full">
      <TopNav pathname={pathname} />
      <main className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-6 md:py-8 lg:py-10 w-full">
        <div className="max-w-[1440px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
