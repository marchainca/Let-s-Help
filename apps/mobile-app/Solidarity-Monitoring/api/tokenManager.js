import i18n from '../i18n';
import { mapAuthContentToUser } from './authSession';

const TOKEN_REFRESH_BUFFER_MS = 60_000;

let tokens = {
  accessToken: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
};

let refreshPromise = null;
let onTokensUpdated = null;
let onSessionExpired = null;

const getAcceptLanguage = () => (i18n.language === 'en' ? 'en' : 'es');

export const configureTokenManager = (handlers) => {
  onTokensUpdated = handlers.onTokensUpdated;
  onSessionExpired = handlers.onSessionExpired;
};

export const syncTokensFromUser = (user) => {
  if (!user) {
    tokens = {
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
    };
    return;
  }

  tokens = {
    accessToken: user.accessToken,
    refreshToken: user.refreshToken,
    accessTokenExpiresAt: user.accessTokenExpiresAt,
    refreshTokenExpiresAt: user.refreshTokenExpiresAt,
  };
};

export const getAccessToken = () => tokens.accessToken;

export const isAccessTokenExpired = () => {
  if (!tokens.accessToken || !tokens.accessTokenExpiresAt) return true;
  return Date.now() >= tokens.accessTokenExpiresAt - TOKEN_REFRESH_BUFFER_MS;
};

export const isRefreshTokenExpired = () => {
  if (!tokens.refreshToken || !tokens.refreshTokenExpiresAt) return true;
  return Date.now() >= new Date(tokens.refreshTokenExpiresAt).getTime();
};

export const refreshAccessToken = async () => {
  if (!tokens.refreshToken) {
    throw new Error('No refresh token available');
  }

  if (isRefreshTokenExpired()) {
    throw new Error('Refresh token expired');
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}auth/refresh`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': getAcceptLanguage(),
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 1) {
      throw new Error(data.message || 'Token refresh failed');
    }

    const updatedUser = mapAuthContentToUser(data.content);
    syncTokensFromUser(updatedUser);
    onTokensUpdated?.(updatedUser);
    return updatedUser;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    onSessionExpired?.();
    throw error;
  } finally {
    refreshPromise = null;
  }
};

export const ensureValidAccessToken = async () => {
  if (!tokens.refreshToken) return;
  if (isAccessTokenExpired()) {
    await refreshAccessToken();
  }
};
