import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { agentReadable } from './seo/plugin.ts';

export default defineConfig({
  plugins: [react(), agentReadable()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3100,
    open: true,
  },
});
