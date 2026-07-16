import i18n from '@/i18n';

export function getAcceptLanguage(): string {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) return storedLang;
  }

  return i18n.language || 'es';
}

export function withAcceptLanguage(
  headers: Record<string, string> = {}
): Record<string, string> {
  return {
    ...headers,
    'Accept-Language': getAcceptLanguage(),
  };
}
