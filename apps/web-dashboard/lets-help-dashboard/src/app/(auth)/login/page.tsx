'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { TextField, Button, Typography, Box, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { loginRequest } from '@/app/services/authService';

export default function LoginPage() {
  const {t} = useTranslation();

  // Estados locales para email y contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para manejo de error o mensajes
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Función que maneja el evento de submit del formulario
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita la recarga de la página por defecto

    try {
      setError(null); // Inicializamos el error antes del login
      const response = await loginRequest(email, password);

      if (response.code === 1) {
        // Guardamos data en el almacenamiento local 
        localStorage.setItem('accessToken', response.content.accessToken);
        document.cookie = `accessToken=${response.content.accessToken}; path=/;`;
        localStorage.setItem('userData', JSON.stringify(response.content.user));

        // Redireccionamos
        router.push('/dashboard');
      } else {
        // Manejo de error si code != 1
        setError(response.message);
      }
    } catch (err: any) {
      // Si ocurre un error en la comunicación con el backend
      setError(err.message);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="#f3f4f6"
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            {t('login.title')}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" mb={2}>
            {t('login.subtitle')}
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              label= {t('login.emailLabel')}
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label={t('login.passwordLabel')}
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button variant="contained" type="submit" size="large">
              {t('login.signIn')}
            </Button>
          </form>

          {error && (
            <Typography variant="body2" color="error" mt={2}>
              {error}
            </Typography>
          )}

          <Box display="flex" justifyContent="center" mt={2}>
            <Typography variant="body2">
              {t('login.noAccount')} <a href="/signup">{t('login.signupFree')}</a>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
