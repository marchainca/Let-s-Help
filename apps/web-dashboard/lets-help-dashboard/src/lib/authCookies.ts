export function setAccessTokenCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
}

export function clearAccessTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'accessToken=; Max-Age=0; path=/;';
}
