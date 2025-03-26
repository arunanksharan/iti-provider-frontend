/**
 * Expo configuration for the Provider Frontend app
 */
module.exports = {
  name: 'Provider Portal',
  slug: 'provider-frontend',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.kuzushilabs.providerfrontend',
    scheme: 'provider-frontend',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.kuzushilabs.providerfrontend',
    scheme: 'provider-frontend',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-secure-store'],
  scheme: 'provider-frontend',
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api/v1',
    apiTimeout: process.env.API_TIMEOUT || '30000',
    authTokenKey: process.env.AUTH_TOKEN_KEY || 'auth_token',
    authRefreshTokenKey: process.env.AUTH_REFRESH_TOKEN_KEY || 'refresh_token',
    eas: {
      projectId: process.env.EAS_PROJECT_ID || '',
    },
  },
  // Enable React Native's New Architecture
  newArchEnabled: true,
};
