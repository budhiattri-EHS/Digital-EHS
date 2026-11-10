import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sbl.ehscontroltower',
  appName: 'SBL EHS Control Tower',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'SBLEHSControlTower',
    limitsNavigationsToAppBoundDomains: false
  }
};

export default config;
