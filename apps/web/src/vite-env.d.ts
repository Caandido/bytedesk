/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL absoluta da API para builds nativos (Electron/Capacitor). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
