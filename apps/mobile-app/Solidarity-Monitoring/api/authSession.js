import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_STORAGE_KEY = '@solidarity_auth_session';

export const mapAuthContentToUser = (content, previousUser = {}) => ({
  ...previousUser,
  id: content.user.id,
  idRole: content.user.idRole,
  idNumber: content.user.idNumber,
  name: content.user.name,
  email: content.user.email,
  profileImageUrl: content.user.urlImage,
  birthdate: content.user.birthdate,
  accessToken: content.accessToken,
  refreshToken: content.refreshToken,
  expiresIn: content.expiresIn,
  accessTokenExpiresAt: Date.now() + content.expiresIn * 1000,
  refreshTokenExpiresAt: content.refreshTokenExpiresAt,
});

export const persistAuthSession = async (userData) => {
  if (!userData) return;
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
};

export const loadAuthSession = async () => {
  const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearAuthSession = async () => {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};
