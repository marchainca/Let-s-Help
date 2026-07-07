import i18n from '../i18n';

export const getAcceptLanguage = () => (i18n.language === 'en' ? 'en' : 'es');

export const getApiHeaders = (headers = {}) => ({
  'Accept-Language': getAcceptLanguage(),
  ...headers,
});

export const apiFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: getApiHeaders(options.headers),
  });
