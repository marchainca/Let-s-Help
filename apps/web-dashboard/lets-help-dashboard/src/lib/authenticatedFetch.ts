import { withAcceptLanguage } from '@/lib/apiHeaders';
import {
  clearAuthSession,
  ensureValidAccessToken,
  refreshAccessToken,
  redirectToLogin,
} from '@/lib/authSession';

function buildAuthHeaders(
  initHeaders: HeadersInit | undefined,
  token: string
): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(initHeaders)) {
    initHeaders.forEach(([key, value]) => {
      headers[key] = value;
    });
  } else if (initHeaders) {
    Object.assign(headers, initHeaders);
  }

  return withAcceptLanguage(headers);
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await ensureValidAccessToken();
  let response = await fetch(input, {
    ...init,
    headers: buildAuthHeaders(init.headers, token),
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    const newToken = await refreshAccessToken();
    response = await fetch(input, {
      ...init,
      headers: buildAuthHeaders(init.headers, newToken),
    });
  } catch {
    clearAuthSession();
    redirectToLogin();
    throw new Error('Session expired');
  }

  return response;
}
