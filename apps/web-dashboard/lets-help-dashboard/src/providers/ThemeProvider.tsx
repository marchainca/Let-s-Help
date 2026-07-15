'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const BRAND_PRIMARY = '#29ABE2';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem('themeMode') as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      setMode(stored);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: BRAND_PRIMARY },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'light' ? 6 : 8,
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
