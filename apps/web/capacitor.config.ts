import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuração do app Android (Capacitor). Empacota o build web (`dist`) e o serve
 * localmente via https://localhost — por isso o BrowserRouter funciona normalmente.
 * A API é acessada por URL absoluta (VITE_API_URL) definida no build.
 */
const config: CapacitorConfig = {
  appId: 'com.bytedesk.devflow',
  appName: 'DevFlow',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
