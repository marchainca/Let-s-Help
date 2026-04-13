import React, { createContext, useState } from 'react';

// Crear el contexto
export const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para actualizar el usuario
  const updateUser = (updatedData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedData,
    }));
  };

  const login = (userData) => {
    setUser(userData); // Guarda los datos del usuario después de iniciar sesión
  };

  const logout = () => {
    setUser(null); // Limpia los datos del usuario al cerrar sesión
  };

  return (
    <UserContext.Provider value={{ user, login, logout,updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
