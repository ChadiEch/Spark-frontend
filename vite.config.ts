import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        external: []
      }
    }
  };
});