import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'node:url';
import type { PluginOption } from 'vite';

const toList = (entries: string | string[] | undefined): string[] | undefined =>
  entries === undefined ? undefined : Array.isArray(entries) ? entries : [entries];

const configDir =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const useOktaApiMock = path.resolve(configDir, 'mocks/useOktaApi.mock.ts');

const mockUseOktaApiPlugin: PluginOption = {
  name: 'sb-mock-use-okta-api',
  enforce: 'pre',
  async resolveId(source, importer, options) {
    if (!source.includes('useOktaApi') || source.includes('useOktaApi/')) return null;
    const resolved = await this.resolve(source, importer, { skipSelf: true, ...options });
    if (resolved && /[/\\]hooks[/\\]useOktaApi\.tsx?$/.test(resolved.id)) {
      return useOktaApiMock;
    }
    return null;
  },
};

function stripCrx(plugins: readonly unknown[]): unknown[] {
  return plugins
    .map((p) => {
      if (Array.isArray(p)) return stripCrx(p);
      const name = (p as { name?: string } | null)?.name;
      if (name === 'crx' || (name && name.startsWith('crx:'))) return null;
      return p;
    })
    .filter((p) => p !== null);
}

const config: StorybookConfig = {
  stories: [
    './docs/**/*.mdx',
    './generated/docs/**/*.mdx',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    'storybook-addon-pseudo-states',
  ],
  framework: '@storybook/react-vite',
  docs: { autodocs: 'tag' },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(viteConfig) {
    viteConfig.plugins = stripCrx(viteConfig.plugins ?? []) as typeof viteConfig.plugins;
    viteConfig.plugins = [mockUseOktaApiPlugin, ...(viteConfig.plugins ?? [])];

    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias as Record<string, string>),
      '@': path.resolve(configDir, '../src'),
    };

    viteConfig.optimizeDeps = viteConfig.optimizeDeps ?? {};
    viteConfig.optimizeDeps.entries = [
      ...(toList(viteConfig.optimizeDeps.entries) ?? []),
      path.resolve(configDir, 'preview.tsx'),
      path.resolve(configDir, '../src/**/*.stories.@(ts|tsx)'),
    ];
    viteConfig.optimizeDeps.include = [
      ...(viteConfig.optimizeDeps.include ?? []),
      'zod',
      'react-dom',
    ];
    return viteConfig;
  },
};

export default config;
