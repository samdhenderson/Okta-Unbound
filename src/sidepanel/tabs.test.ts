import { describe, expect, it } from 'vitest';
import { TAB_DEFS, migrateLegacyTabId, type TabType } from './tabs';

describe('migrateLegacyTabId', () => {
  it.each<[string, TabType]>([
    ['overview', 'home'],
    ['dashboard', 'home'],
    ['operations', 'home'],
    ['security', 'home'],
    ['undo', 'history'],
  ])('migrates retired id %s to %s', (legacy, expected) => {
    expect(migrateLegacyTabId(legacy)).toBe(expected);
  });

  it('passes the no-longer-retired apps id through', () => {
    expect(migrateLegacyTabId('apps')).toBe('apps');
  });

  it('passes every current tab id through unchanged', () => {
    for (const { id } of TAB_DEFS) {
      expect(migrateLegacyTabId(id)).toBe(id);
    }
  });

  it('falls back to home for unknown ids', () => {
    expect(migrateLegacyTabId('not-a-tab')).toBe('home');
    expect(migrateLegacyTabId('')).toBe('home');
  });

  it('passes the new home id through', () => {
    expect(migrateLegacyTabId('home')).toBe('home');
  });
});
