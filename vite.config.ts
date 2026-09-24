import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import manifest from './manifest.json' with { type: 'json' };
import pkg from './package.json' with { type: 'json' };

const manifestVersion = pkg.version.split('-')[0];

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest: { ...manifest, version: manifestVersion } })],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      input: { guide: 'src/guide/index.html' },
    },
  },
});
