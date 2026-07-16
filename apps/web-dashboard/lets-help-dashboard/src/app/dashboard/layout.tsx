'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAccessTokenCookie, setAccessTokenCookie } from '@/lib/authCookies';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      clearAccessTokenCookie();
      router.replace('/login');
      return;
    }

    setAccessTokenCookie(token);
  }, [router]);

  return children;
}
