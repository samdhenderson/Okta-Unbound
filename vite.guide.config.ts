import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(here, 'src/guide'),
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(here, 'src') } },
  define: { 'import.meta.env.VITE_GUIDE_HOST': JSON.stringify('web') },
  build: {
    outDir: path.resolve(here, 'guide-static'),
    emptyOutDir: true,
  },
});
