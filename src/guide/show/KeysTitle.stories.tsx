import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import KeysTitle from './KeysTitle';
import { CX1, CY, N, R } from './keysGeometry';
import { chapterById } from '../chapters';
import '../guide.css';

const SENTENCE = chapterById('welcome').headline;

const PASSAGE = (
  <p className="text-base leading-7 text-pretty text-neutral-800">
    Okta Unbound is a side panel that sits beside the Okta admin console. It answers the questions
    the console makes you work for, without leaving the page you are on.
  </p>
);

const meta = {
  component: KeysTitle,
  title: 'Guide/Show/KeysTitle',
  args: { text: SENTENCE, passage: PASSAGE },
  decorators: [
    (Story) => (
      <div className="guide-show guide-show-card flex flex-col justify-center bg-canvas px-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KeysTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Still: Story = {
  play: async ({ canvasElement }) => {
    const keys = canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-title path');
    await expect(keys).toHaveLength(N);

    const bearings = new Set<number>();
    for (const key of keys) {
      const transform = key.getAttribute('transform');
      if (!transform) throw new Error('A key was never posed');
      const [, x, y] = /^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(transform) ?? [];
      const [, deg] = /rotate\((-?[\d.]+)\)/.exec(transform) ?? [];
      await expect(Math.hypot(Number(x) - CX1, Number(y) - CY)).toBeCloseTo(R, 0);
      bearings.add(Math.round(Number(deg)));
    }
    await expect(bearings.size).toBe(N);

    const halves = canvasElement.querySelectorAll('.guide-keys-title-half');
    await expect(halves).toHaveLength(2);
    const spoken = Array.from(halves, (half) => half.textContent).join(' ');
    await expect(spoken).toBe(SENTENCE);
    for (const half of halves) await expect(half).toHaveAttribute('opacity', '1.000');

    await expect(canvasElement.querySelector('.guide-card')).toHaveAttribute('data-passage', 'in');
    await expect(canvasElement.querySelector('.guide-card-passage')).toHaveTextContent(
      'sits beside the Okta admin console',
    );
  },
};

export const Plays: Story = {
  parameters: { motion: 'on' },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-title path'),
    ).toHaveLength(N);
  },
};
