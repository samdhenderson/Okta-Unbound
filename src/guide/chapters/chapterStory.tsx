import { useEffect } from 'react';
import type { Decorator } from '@storybook/react-vite';
import { waitFor, within } from 'storybook/test';
import GuideShell from '../shell/GuideShell';
import { type ChapterId, hashFor } from '../chapters';
import '../guide.css';

export function withGuideShell(id: ChapterId): Decorator {
  const WithShell: Decorator = (Story) => {
    useEffect(() => {
      window.location.hash = hashFor(id);
    }, []);
    return (
      <GuideShell chapter={id}>
        <Story />
      </GuideShell>
    );
  };
  return WithShell;
}

export const CHAPTER_PARAMETERS = {
  layout: 'fullscreen',
} as const;

export function readerCanvas(canvasElement: HTMLElement): ReturnType<typeof within> {
  const body = canvasElement.querySelector<HTMLElement>('[data-testid="guide-body"]');
  if (!body) throw new Error('No reader body: is the chapter inside ChapterPage?');
  return within(body);
}

export async function awaitShow(canvasElement: HTMLElement): Promise<void> {
  canvasElement.querySelector('[data-show-state]')?.scrollIntoView({ block: 'center' });
  await waitFor(
    () => {
      const show = canvasElement.querySelector('[data-show-state]');
      if (show && show.getAttribute('data-show-state') !== 'done') {
        throw new Error('show still playing');
      }
    },
    { timeout: 15000 },
  );
}
