import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from '../locales/es.json';
import en from '../locales/en.json';

export const LANGUAGE_STORAGE_KEY = '@solidarity_language';

export const changeAppLanguage = async (language) => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
};

export const initI18n = async () => {
  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  const language = storedLanguage || 'es';

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        es: { translation: es },
        en: { translation: en },
      },
      lng: language,
      fallbackLng: 'es',
      compatibilityJSON: 'v4',
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(language);
  }

  return language;
};

export default i18n;
