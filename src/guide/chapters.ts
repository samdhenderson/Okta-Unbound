import type { IconType } from '../sidepanel/components/shared/Icon';

export type ChapterId =
  | 'welcome'
  | 'home'
  | 'users'
  | 'groups'
  | 'apps'
  | 'rules'
  | 'policies'
  | 'export'
  | 'history'
  | 'selection'
  | 'palette'
  | 'roadmap';

export interface ChapterDef {
  id: ChapterId;
  title: string;
  question: string;
  headline: string;
  subline: string;
  icon: IconType;
}

export const CHAPTERS: ReadonlyArray<ChapterDef> = [
  {
    id: 'welcome',
    icon: 'book',
    title: 'Welcome',
    question: 'How to open the panel, and what it is for.',
    headline: 'Okta, unbound.',
    subline:
      'A side panel that answers the questions the admin console makes you work for, without leaving the page.',
  },
  {
    id: 'home',
    icon: 'home',
    title: 'Home',
    question: 'Is my tenant OK, and what changed?',
    headline: 'Start where the problem is.',
    subline:
      'One place to jump anywhere, see what is worth fixing, and get back to what you were doing.',
  },
  {
    id: 'users',
    icon: 'user',
    title: 'Users',
    question: 'Why does this person have what they have?',
    headline: 'Why does she have this?',
    subline:
      'Every group a person is in, the reason for each, and what moves when you edit their profile.',
  },
  {
    id: 'groups',
    icon: 'users',
    title: 'Groups',
    question: 'Who is in this, and why?',
    headline: 'Every member has a reason.',
    subline:
      'Who is in a group, how they got there, how healthy the population is, and one move to fix it.',
  },
  {
    id: 'apps',
    icon: 'app',
    title: 'Apps',
    question: 'Who can reach this, and through what?',
    headline: 'Direct, or through a group.',
    subline: "An app's groups, a group's apps, and the source of every assignment a person holds.",
  },
  {
    id: 'rules',
    icon: 'bolt',
    title: 'Rules',
    question: 'What does this rule do, and what breaks if it changes?',
    headline: 'Read the rule the way Okta does.',
    subline:
      'Check any rule against any person, clause by clause, and measure what changes before you touch it.',
  },
  {
    id: 'policies',
    icon: 'shield',
    title: 'Policies',
    question: 'What does sign-in require, and for whom?',
    headline: 'Okta says no. We say why.',
    subline: 'What sign-in requires, for whom, and the plain reason when a policy will not open.',
  },
  {
    id: 'export',
    icon: 'download',
    title: 'Export',
    question: 'Give me the evidence.',
    headline: 'Scope it, shape it, ship it.',
    subline:
      'Pick the entity, narrow it with a filter, choose the columns, and download the evidence as CSV.',
  },
  {
    id: 'history',
    icon: 'clipboard',
    title: 'History',
    question: 'What did I change, and can I undo it?',
    headline: 'Every change, and the way back.',
    subline: 'What you changed, when, and an undo for anything that can still be put back.',
  },
  {
    id: 'selection',
    icon: 'clipboard-check',
    title: 'Selection',
    question: 'Gather people from anywhere, then act on all of them at once.',
    headline: 'Tick anywhere. Act once.',
    subline:
      'Gather people, groups, and rules from any tab into one basket, then run one verb on all of them.',
  },
  {
    id: 'palette',
    icon: 'search',
    title: 'Command Palette',
    question: 'Get anywhere in two keystrokes.',
    headline: 'One key. Anywhere.',
    subline: 'Jump to a section, a group, an app, a rule, or a person from wherever you are.',
  },
  {
    id: 'roadmap',
    icon: 'sparkles',
    title: 'Where This Is Going',
    question: 'What is still moving, and where to weigh in.',
    headline: 'Still moving.',
    subline: 'What is unfinished, what is capped, and where to weigh in.',
  },
];

export const DEFAULT_CHAPTER: ChapterId = 'welcome';

const BY_ID: ReadonlyMap<ChapterId, ChapterDef> = new Map(CHAPTERS.map((c) => [c.id, c]));

export function isChapterId(value: string): value is ChapterId {
  return BY_ID.has(value as ChapterId);
}

export function chapterById(id: ChapterId): ChapterDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`Unknown chapter ${id}`);
  return def;
}

export function parseHash(hash: string): ChapterId {
  const id = hash.replace(/^#\/?/, '').trim();
  return isChapterId(id) ? id : DEFAULT_CHAPTER;
}

export function hashFor(id: ChapterId): string {
  return `#/${id}`;
}

export function previousChapter(id: ChapterId): ChapterDef | null {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  return index > 0 ? CHAPTERS[index - 1] : null;
}

export function nextChapter(id: ChapterId): ChapterDef | null {
  const index = CHAPTERS.findIndex((c) => c.id === id);
  return index >= 0 && index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : null;
}
