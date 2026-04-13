import React, { createContext, useState, useEffect } from 'react';
import { Camera } from 'expo-camera';

export const CameraPermissionContext = createContext();

export const CameraPermissionProvider = ({ children }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(status === 'granted');
      } catch (error) {
        setErrorMessage('Error al solicitar permisos de cámara.');
      }
    })();
  }, []);

  return (
    <CameraPermissionContext.Provider
      value={{ hasCameraPermission, errorMessage, setErrorMessage }}
    >
      {children}
    </CameraPermissionContext.Provider>
  );
};
