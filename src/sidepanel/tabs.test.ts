import { describe, expect, it } from 'vitest';
import { RAIL_TAB_DEFS, TAB_DEFS, migrateLegacyTabId, type TabType } from './tabs';

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

describe('RAIL_TAB_DEFS', () => {
  it('is a strict subset of the full registry, in the same order', () => {
    const railIds = RAIL_TAB_DEFS.map((def) => def.id);
    const sectionIds = TAB_DEFS.map((def) => def.id);

    expect(railIds.length).toBeLessThan(sectionIds.length);
    expect(sectionIds.filter((id) => railIds.includes(id))).toEqual(railIds);
  });

  it('withholds a seat from exactly the rail-hidden sections', () => {
    const railIds = RAIL_TAB_DEFS.map((def) => def.id);
    const hidden = TAB_DEFS.filter((def) => def.railHidden).map((def) => def.id);

    expect(hidden).toEqual(['explorer', 'history', 'selection']);
    for (const id of hidden) {
      expect(railIds).not.toContain(id);
    }
  });

  it('leaves a rail-hidden section a real, restorable tab', () => {
    for (const id of ['explorer', 'history'] as TabType[]) {
      expect(TAB_DEFS.some((def) => def.id === id)).toBe(true);
      expect(migrateLegacyTabId(id)).toBe(id);
    }
    expect(migrateLegacyTabId('undo')).toBe('history');
  });
});
