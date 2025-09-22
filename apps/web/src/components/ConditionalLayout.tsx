'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Auth va Dashboard sahifalarida navbar va footer ko'rsatmaslik
  const isAuthPage = pathname?.startsWith('/auth/');
  const isDashboardPage = pathname === '/dashboard';
  
  if (isAuthPage || isDashboardPage) {
    return (
      <main className="min-h-screen">
        {children}
      </main>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
