export type { AuthResponse, AuthSessionContent, AuthUser } from '@/types/auth';

/** @deprecated Use AuthResponse from @/types/auth */
export interface LoginResponse {
  code: number;
  message: string;
  content: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshTokenExpiresAt: string;
    user: {
      id: number;
      idRole: number;
      idNumber: string;
      email: string;
      name: string;
      role?: string;
      urlImage: string;
      birthdate: string;
    };
  };
}
