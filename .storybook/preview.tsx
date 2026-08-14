import React from 'react';
import type { Preview, Decorator } from '@storybook/react-vite';

import '../src/sidepanel/tailwind.css';

import { installChromeFake } from './mocks/chrome';
import ErrorBoundary from '../src/sidepanel/components/ErrorBoundary';
import { ProgressProvider } from '../src/sidepanel/contexts/ProgressContext';
import { SchedulerProvider } from '../src/sidepanel/contexts/SchedulerContext';

installChromeFake();

const withProviders: Decorator = (Story) => (
  <ErrorBoundary>
    <ProgressProvider>
      <SchedulerProvider>
        <div style={{ fontFamily: 'var(--font-primary)', display: 'contents' }}>
          <Story />
        </div>
      </SchedulerProvider>
    </ProgressProvider>
  </ErrorBoundary>
);

const withMotion: Decorator = (Story, context) => (
  <div
    data-motion={context.parameters.motion === 'on' ? 'on' : 'off'}
    style={{ display: 'contents' }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withMotion, withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
    viewport: {
      options: {
        sidepanelCompact: {
          name: 'Side panel — compact (< 640)',
          styles: { width: '360px', height: '900px' },
          type: 'other',
        },
        sidepanelDefault: {
          name: 'Side panel — default',
          styles: { width: '480px', height: '900px' },
          type: 'other',
        },
        sidepanelWide: {
          name: 'Side panel — wide (≥ 640)',
          styles: { width: '720px', height: '900px' },
          type: 'other',
        },
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
