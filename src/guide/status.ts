import type { ChapterId } from './chapters';

export type ChapterStatus = 'shipped' | 'capped' | 'in-progress' | 'unresolved';

export const STATUS_LABEL: Readonly<Record<ChapterStatus, string>> = {
  shipped: 'Shipped',
  capped: 'Capped',
  'in-progress': 'In progress',
  unresolved: 'Unresolved',
};

export interface ChapterStanding {
  status: ChapterStatus;
  note?: string;
}

export type FeatureChapterId = Exclude<ChapterId, 'welcome' | 'roadmap'>;

export const CHAPTER_STANDING: Readonly<Record<FeatureChapterId, ChapterStanding>> = {
  home: {
    status: 'in-progress',
    note: 'The reports on Home are the least settled part of the product. What should be there is an open question, and yours to answer.',
  },
  users: { status: 'shipped' },
  groups: { status: 'shipped' },
  apps: {
    status: 'in-progress',
    note: 'Apps has a list but not yet a detail page of its own.',
  },
  rules: {
    status: 'in-progress',
    note: 'Rules explain themselves and predict impact, but do not yet have a detail page of their own.',
  },
  policies: {
    status: 'unresolved',
    note: 'Policies are read-only cards today. Whether this tab deepens or folds into the others is undecided.',
  },
  export: {
    status: 'capped',
    note: 'Export does what it does and is not growing. New columns, yes; new kinds of export, by request.',
  },
  history: {
    status: 'in-progress',
    note: 'History records and undoes the writes this panel makes. It is being widened to cover more of them.',
  },
  selection: { status: 'shipped' },
  palette: { status: 'shipped' },
};

export function standingOf(id: ChapterId): ChapterStanding | null {
  if (id === 'welcome' || id === 'roadmap') return null;
  return CHAPTER_STANDING[id];
}
