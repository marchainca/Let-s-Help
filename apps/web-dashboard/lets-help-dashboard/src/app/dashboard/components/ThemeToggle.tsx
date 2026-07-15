'use client';

import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useAppTheme();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'light' ? t('dashboard.theme.dark') : t('dashboard.theme.light')}>
      <IconButton color="inherit" onClick={toggleTheme} size="small">
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
