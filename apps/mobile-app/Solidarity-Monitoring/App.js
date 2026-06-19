import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { CameraPermissionProvider } from './context/CameraPermissionContext';
import { UserProvider } from './context/UserContext';
import { initI18n } from './i18n';
import RootNavigator from './navigation/RootNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    initI18n().finally(() => setIsI18nReady(true));
  }, []);

  if (!isI18nReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <UserProvider>
      <CameraPermissionProvider>
        <RootNavigator />
        <Toast />
      </CameraPermissionProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
