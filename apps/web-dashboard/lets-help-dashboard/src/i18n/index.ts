'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es/translation.json';
import en from './locales/en/translation.json';

void i18n
  .use(initReactI18next) // integración con react-i18next
  .use(LanguageDetector)  // para detectar idioma del navegador
  .init({
    fallbackLng: 'en', // idioma por defecto si no se detecta o no se configura
    lng: 'es',         // idioma inicial

    // recursos de traducción
    resources: {
      es: { translation: es },
      en: { translation: en },
    },

    interpolation: {
      escapeValue: false, // Dejamos que react maneje el escape
    },
    detection: {
      // Configuraciones del detector de idioma
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['cookie']
    }
  });

export default i18n;
