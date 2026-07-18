import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Resolve o pacote compartilhado direto no source (ESM/TS). O bundle CJS do
      // dist usa `export *` (__exportStar), que o rollup não consegue analisar para
      // named exports de runtime (schemas/labels). O tsc segue usando os tipos do dist.
      '@devflow/shared': path.resolve(
        __dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Encaminha chamadas /api para o backend NestJS em dev.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
