import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  mapAuthContentToUser,
  persistAuthSession,
  loadAuthSession,
  clearAuthSession,
} from '../api/authSession';
import {
  configureTokenManager,
  syncTokensFromUser,
  refreshAccessToken,
  isAccessTokenExpired,
  isRefreshTokenExpired,
} from '../api/tokenManager';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const applyUserSession = useCallback(async (userData) => {
    setUser(userData);
    syncTokensFromUser(userData);

    if (userData) {
      await persistAuthSession(userData);
    }
  }, []);

  const login = useCallback(
    async (userData) => {
      await applyUserSession(userData);
    },
    [applyUserSession]
  );

  const updateUser = useCallback((updatedData) => {
    setUser((prevUser) => {
      const mergedUser = { ...prevUser, ...updatedData };
      syncTokensFromUser(mergedUser);
      persistAuthSession(mergedUser);
      return mergedUser;
    });
  }, []);

  const logout = useCallback(async () => {
    await clearAuthSession();
    syncTokensFromUser(null);
    setUser(null);
  }, []);

  const restoreAuthSession = useCallback(async () => {
    try {
      const storedUser = await loadAuthSession();
      if (!storedUser?.refreshToken) return;

      syncTokensFromUser(storedUser);
      setUser(storedUser);

      if (isRefreshTokenExpired()) {
        await clearAuthSession();
        syncTokensFromUser(null);
        setUser(null);
        return;
      }

      if (isAccessTokenExpired()) {
        await refreshAccessToken();
      }
    } catch (error) {
      console.error('Error al restaurar la sesión:', error);
      await clearAuthSession();
      syncTokensFromUser(null);
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    configureTokenManager({
      onTokensUpdated: (updatedUser) => {
        setUser((prevUser) => {
          const mergedUser = { ...prevUser, ...updatedUser };
          persistAuthSession(mergedUser);
          return mergedUser;
        });
      },
      onSessionExpired: () => {
        clearAuthSession();
        syncTokensFromUser(null);
        setUser(null);
      },
    });

    restoreAuthSession();
  }, [restoreAuthSession]);

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, isAuthLoading }}>
      {children}
    </UserContext.Provider>
  );
};
