import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AppScopeIndicator, { type AppScopeIndicatorState } from './AppScopeIndicator';

const marker = (state: AppScopeIndicatorState): HTMLElement => {
  const { container } = render(<AppScopeIndicator state={state} />);
  const el = container.firstElementChild;
  if (!(el instanceof HTMLElement)) throw new Error(`nothing rendered for state "${state}"`);
  return el;
};

const wording = (el: HTMLElement): string => `${el.textContent ?? ''} ${el.title}`;

describe('AppScopeIndicator', () => {
  it("labels a reported 'USER' scope as Direct", () => {
    expect(marker('USER')).toHaveTextContent(/^Direct$/);
  });

  it("labels a reported 'GROUP' scope as Via group", () => {
    expect(marker('GROUP')).toHaveTextContent(/^Via group$/);
  });

  it('names an absent scope as unknown, never as a group grant', () => {
    const el = marker('unknown');
    expect(el).toHaveTextContent(/^Source unknown$/);
    expect(el.textContent).not.toMatch(/group/i);
    expect(el.textContent).not.toMatch(/direct/i);
  });

  it('names the shared-bucket case as not compared', () => {
    expect(marker('notCompared')).toHaveTextContent(/^Source not compared$/);
  });

  it('never claims exclusivity, in a label or in its description', () => {
    for (const state of ['USER', 'GROUP', 'unknown', 'notCompared'] as const) {
      const text = wording(marker(state));
      expect(text).not.toMatch(/direct only/i);
      expect(text).not.toMatch(/only direct/i);
      expect(text).not.toMatch(/not via (a )?group/i);
      expect(text).not.toMatch(/only via (a )?group/i);
      expect(text).not.toMatch(/no group/i);
    }
  });

  it("spells out on 'USER' that a group path is not ruled out", () => {
    const { title } = marker('USER');
    expect(title).toMatch(/does not rule out a group path/i);
    expect(title).toMatch(/only one source per app/i);
  });

  it("explains on 'notCompared' that only one user's source is in hand", () => {
    const { title } = marker('notCompared');
    expect(title).toMatch(/per user/i);
    expect(title).toMatch(/as if it described both/i);
  });

  it('gives all four states different words, so nothing rides on styling alone', () => {
    const all = (['USER', 'GROUP', 'unknown', 'notCompared'] as const).map((s) => marker(s));
    expect(new Set(all.map((el) => el.textContent)).size).toBe(4);
  });

  it('renders answers as chips and non-answers as muted italic text', () => {
    for (const state of ['USER', 'GROUP'] as const) {
      expect(marker(state).className).toContain('bg-neutral-100');
    }
    for (const state of ['unknown', 'notCompared'] as const) {
      const { className } = marker(state);
      expect(className).toContain('italic');
      expect(className).not.toContain('bg-neutral-100');
    }
  });

  it('styles neither scope as a problem — no danger or warning token', () => {
    for (const state of ['USER', 'GROUP'] as const) {
      expect(marker(state).className).not.toMatch(/danger|warning/);
    }
  });
});
