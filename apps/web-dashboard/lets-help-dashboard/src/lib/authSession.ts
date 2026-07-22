import { refreshTokenRequest } from '@/app/services/authService';
import { AuthSessionContent } from '@/types/auth';
import { clearAccessTokenCookie, setAccessTokenCookie } from '@/lib/authCookies';

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  userData: 'userData',
} as const;

const REFRESH_BUFFER_MS = 60_000;

let refreshPromise: Promise<string> | null = null;

function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function persistAuthSession(content: AuthSessionContent): void {
  if (typeof window === 'undefined') return;

  const accessTokenExpiresAt = Date.now() + content.expiresIn * 1000;

  localStorage.setItem(STORAGE_KEYS.accessToken, content.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, content.refreshToken);
  localStorage.setItem(STORAGE_KEYS.accessTokenExpiresAt, String(accessTokenExpiresAt));
  localStorage.setItem(STORAGE_KEYS.refreshTokenExpiresAt, content.refreshTokenExpiresAt);
  localStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(content.user));

  setAccessTokenCookie(content.accessToken);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  clearAccessTokenCookie();
}

export function getAccessToken(): string | null {
  return getStorageItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return getStorageItem(STORAGE_KEYS.refreshToken);
}

export function getAccessTokenExpiresAt(): number | null {
  const value = getStorageItem(STORAGE_KEYS.accessTokenExpiresAt);
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isAccessTokenExpired(): boolean {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return false;

  return Date.now() >= expiresAt - REFRESH_BUFFER_MS;
}

export function isRefreshTokenExpired(): boolean {
  const expiresAt = getStorageItem(STORAGE_KEYS.refreshTokenExpiresAt);
  if (!expiresAt) return true;

  return Date.now() >= new Date(expiresAt).getTime();
}

export function hasAuthSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken || isRefreshTokenExpired()) {
      throw new Error('Refresh token expired');
    }

    const response = await refreshTokenRequest(refreshToken);

    if (response.code !== 1) {
      throw new Error(response.message || 'Unable to refresh session');
    }

    persistAuthSession(response.content);
    return response.content.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function ensureValidAccessToken(): Promise<string> {
  const token = getAccessToken();

  if (token && !isAccessTokenExpired()) {
    return token;
  }

  if (!getRefreshToken()) {
    if (token) {
      return token;
    }

    throw new Error('No auth session');
  }

  return refreshAccessToken();
}

export function getMsUntilAccessTokenRefresh(): number | null {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return null;

  return Math.max(0, expiresAt - REFRESH_BUFFER_MS - Date.now());
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  clearAuthSession();
  window.location.href = '/login';
}
