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
        <Story />
      </SchedulerProvider>
    </ProgressProvider>
  </ErrorBoundary>
);

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    layout: 'fullscreen',
  },
};

export default preview;
