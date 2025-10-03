import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..', '..'), '');
  const localEnv = loadEnv(mode, __dirname, '');
  const geminiKey = localEnv.GEMINI_API_KEY || rootEnv.GEMINI_API_KEY || '';

  return {
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, '..', '..', 'public', 'tools', 'blog-generator'),
      emptyOutDir: true,
    },
  };
});
