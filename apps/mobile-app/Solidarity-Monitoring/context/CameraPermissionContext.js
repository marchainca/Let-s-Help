import React, { createContext, useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import i18n from '../i18n';

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
        setErrorMessage(i18n.t('camera.permissionRequestError'));
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
