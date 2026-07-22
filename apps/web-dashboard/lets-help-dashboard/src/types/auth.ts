export interface AuthUser {
  id: number;
  idRole: number;
  idNumber: string;
  email: string;
  name: string;
  role?: string;
  urlImage: string;
  birthdate: string;
}

export interface AuthSessionContent {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface AuthResponse {
  code: number;
  message: string;
  content: AuthSessionContent;
}
