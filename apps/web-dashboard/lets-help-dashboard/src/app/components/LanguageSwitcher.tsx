'use client'; 
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, MenuItem, SelectChangeEvent  } from '@mui/material';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  // Estado local para guardar el idioma seleccionado
  const [currentLang, setCurrentLang] = useState<string>(i18n.language);

  // Opciones de idioma para manejar en el dashboard
  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  // revisar si hay un idioma almacenado en localStorage
  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang && storedLang !== currentLang) {
      setCurrentLang(storedLang);
      i18n.changeLanguage(storedLang);
    }
  }, []);

  // Handler para cambiar de idioma
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLang = event.target.value;
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <Select
      value={currentLang}
      onChange={handleLanguageChange}
      size="small"
      sx={{ marginLeft: 'auto', marginRight: '1rem' }} // estilos opcionales
    >
      {availableLanguages.map((lang) => (
        <MenuItem key={lang.code} value={lang.code}>
          {lang.label}
        </MenuItem>
      ))}
    </Select>
  );
}
