import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: 'Solidarity-Monitoring',
  slug: 'solidarity-monitoring',
  scheme: 'solidarity-monitoring',
  newArchEnabled: false,
  plugins: [
    ...(config.plugins ?? []),
    'expo-asset',
    [
      'expo-camera',
      {
        cameraPermission:
          'Permite a Solidarity Monitoring usar la cámara para reconocimiento facial.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'Permite a Solidarity Monitoring acceder a tus fotos.',
      },
    ],
  ],
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  },
});
