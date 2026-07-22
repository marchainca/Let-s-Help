import i18n from '../i18n';
import {
  ensureValidAccessToken,
  refreshAccessToken,
  getAccessToken,
} from './tokenManager';

export const getAcceptLanguage = () => (i18n.language === 'en' ? 'en' : 'es');

export const getApiHeaders = (headers = {}) => ({
  'Accept-Language': getAcceptLanguage(),
  ...headers,
});

const isAuthEndpoint = (url) =>
  url.includes('auth/login') || url.includes('auth/refresh');

const withUpdatedAuthorization = (headers = {}) => {
  if (!headers.Authorization?.startsWith('Bearer ')) {
    return headers;
  }

  const accessToken = getAccessToken();
  if (!accessToken) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${accessToken}`,
  };
};

export const apiFetch = async (url, options = {}, isRetry = false) => {
  const isAuthenticatedRequest = Boolean(options.headers?.Authorization);

  if (!isAuthEndpoint(url) && isAuthenticatedRequest) {
    try {
      await ensureValidAccessToken();
    } catch {
      // Session expiration is handled by the token manager callback.
    }
  }

  const headers = getApiHeaders(
    isAuthenticatedRequest ? withUpdatedAuthorization(options.headers) : options.headers
  );

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (
    response.status === 401 &&
    !isAuthEndpoint(url) &&
    !isRetry &&
    isAuthenticatedRequest
  ) {
    try {
      await refreshAccessToken();
      return apiFetch(
        url,
        {
          ...options,
          headers: withUpdatedAuthorization(options.headers),
        },
        true
      );
    } catch {
      return response;
    }
  }

  return response;
};
