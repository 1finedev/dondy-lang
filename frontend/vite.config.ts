import react from '@vitejs/plugin-react';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: 'http://0.0.0.0:8080'
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true
  }
});
