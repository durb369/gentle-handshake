import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.spiritvision.scanner',
  appName: 'Spirit Vision',
  webDir: 'dist',
  android: {
    backgroundColor: '#1a1625',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2500,
      backgroundColor: '#1a1625',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Camera: {
      permissionRequestMessage: 'Spirit Vision needs camera access to scan for spiritual entities and energy fields.',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
