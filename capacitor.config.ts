

// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';


const config: CapacitorConfig = {
  appId: 'com.actionunit.manager',
  appName: 'TEST APP',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Preferences: {
      group: 'com.actionunit.manager.preferences'
    },
   SplashScreen: {
    launchShowDuration: 100, // Very short - just to avoid white flash
    launchAutoHide: true,    // Hide quickly
    backgroundColor: "#FFFFFF",
    androidSplashResourceName: "splash",
    androidScaleType: "CENTER_CROP",
    showSpinner: false,
    splashFullScreen: true,
    splashImmersive: true,
  }
  }
};

export default config;
