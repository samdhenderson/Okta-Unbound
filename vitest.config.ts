import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const executablePath = process.env.VITEST_BROWSER_EXECUTABLE;

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.stories.{ts,tsx}',
        '**/mockData',
        'dist/',
        '.github/',
        'docs/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    projects: [
      {
        plugins: [react()],
        resolve: { alias: { '@': path.resolve(dirname, './src') } },
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
        },
      },
      {
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: executablePath ? { executablePath } : {},
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
