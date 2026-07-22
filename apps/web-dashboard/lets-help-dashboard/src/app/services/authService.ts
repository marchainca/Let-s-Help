import CryptoJS from 'crypto-js';
import params from '@/params';
import { withAcceptLanguage } from '@/lib/apiHeaders';
import { AuthResponse } from '@/types/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const LOGIN_PATH =
  process.env.NEXT_PUBLIC_LOGIN_ENDPOINT || params.paths.authLogin;

/**
 * Realiza login contra el backend.
 */
export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  try {
    const hashPassword = CryptoJS.SHA256(password).toString();
    const response = await fetch(`${BASE_URL}${LOGIN_PATH}`, {
      method: 'POST',
      headers: withAcceptLanguage({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ email, password: hashPassword }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.status}`);
    }

    return (await response.json()) as AuthResponse;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al realizar login';
    console.log('Error en loginRequest: ', message);
    throw new Error(message);
  }
}

/**
 * Renueva accessToken y refreshToken usando el refresh token vigente.
 */
export async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BASE_URL}${params.paths.authRefresh}`, {
      method: 'POST',
      headers: withAcceptLanguage({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.status}`);
    }

    return (await response.json()) as AuthResponse;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al renovar la sesión';
    console.log('Error en refreshTokenRequest: ', message);
    throw new Error(message);
  }
}
