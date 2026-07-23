import type { Decorator } from '@storybook/react-vite';

export const inSidePanelFrame: Decorator = (Story) => (
  <div className="relative h-48 w-full overflow-hidden border-b border-neutral-200 bg-canvas [transform:translateZ(0)]">
    <div className="space-y-2 p-4">
      <div className="text-xs font-semibold text-neutral-500">Side-panel content</div>
      <div className="h-2 w-2/3 rounded bg-neutral-200" />
      <div className="h-2 w-1/2 rounded bg-neutral-200" />
    </div>
    <Story />
  </div>
);
