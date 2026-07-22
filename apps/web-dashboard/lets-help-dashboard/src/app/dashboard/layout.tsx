'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  clearAuthSession,
  ensureValidAccessToken,
  getAccessToken,
  hasAuthSession,
} from '@/lib/authSession';
import { setAccessTokenCookie } from '@/lib/authCookies';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    if (!hasAuthSession()) {
      clearAuthSession();
      router.replace('/login');
      return;
    }

    void ensureValidAccessToken()
      .then((token) => {
        setAccessTokenCookie(token);
      })
      .catch(() => {
        clearAuthSession();
        router.replace('/login');
      });
  }, [router]);

  return children;
}
