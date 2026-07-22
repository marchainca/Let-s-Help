'use client';

import { useEffect } from 'react';
import {
  ensureValidAccessToken,
  getMsUntilAccessTokenRefresh,
  getRefreshToken,
  hasAuthSession,
  isRefreshTokenExpired,
  redirectToLogin,
} from '@/lib/authSession';

interface AuthSessionProviderProps {
  children: React.ReactNode;
}

export default function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  useEffect(() => {
    if (!hasAuthSession()) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken || isRefreshTokenExpired()) {
        return;
      }

      const delay = getMsUntilAccessTokenRefresh();
      if (delay === null) return;

      timeoutId = setTimeout(() => {
        void ensureValidAccessToken()
          .then(() => {
            scheduleRefresh();
          })
          .catch(() => {
            redirectToLogin();
          });
      }, delay || 0);
    };

    scheduleRefresh();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return children;
}
