import { describe, expect, it } from 'vitest';
import {
  CHAPTERS,
  DEFAULT_CHAPTER,
  nextChapter,
  parseHash,
  previousChapter,
  type ChapterId,
} from './chapters';
import { standingOf } from './status';

describe('CHAPTERS', () => {
  it('has a unique id per chapter', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every chapter a short headline and a subline for its show', () => {
    CHAPTERS.forEach((chapter) => {
      const words = chapter.headline.trim().split(/\s+/);
      expect(words.length, `${chapter.id} headline is ${words.length} words`).toBeLessThanOrEqual(
        7,
      );
      expect(chapter.headline, `${chapter.id} headline`).not.toBe('');
      expect(chapter.subline.trim(), `${chapter.id} subline`).not.toBe('');
    });
  });

  it('titles every chapter briefly, in Title Case', () => {
    const SMALL = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'on', 'to', 'for', 'is']);
    CHAPTERS.forEach((chapter) => {
      const words = chapter.title.trim().split(/\s+/);
      expect(words.length, `${chapter.id} title is ${words.length} words`).toBeLessThanOrEqual(4);
      words.forEach((word, index) => {
        if (index > 0 && SMALL.has(word)) return;
        expect(word[0], `${chapter.id} title word ${JSON.stringify(word)}`).toBe(
          word[0].toUpperCase(),
        );
      });
    });
  });
});

describe('parseHash', () => {
  it.each(['#/rules', '#rules', 'rules'])('maps %j to rules', (hash) => {
    expect(parseHash(hash)).toBe('rules');
  });

  it.each(['', '#/', '#/nope'])('maps %j to the default chapter', (hash) => {
    expect(parseHash(hash)).toBe(DEFAULT_CHAPTER);
  });
});

describe('previousChapter / nextChapter', () => {
  const first = CHAPTERS[0];
  const last = CHAPTERS[CHAPTERS.length - 1];

  it('returns null at the ends of the spine', () => {
    expect(previousChapter(first.id)).toBeNull();
    expect(nextChapter(last.id)).toBeNull();
  });

  it('agrees with itself across every adjacent pair', () => {
    for (let i = 0; i < CHAPTERS.length - 1; i += 1) {
      const here = CHAPTERS[i];
      const after = CHAPTERS[i + 1];
      expect(nextChapter(here.id)?.id).toBe(after.id);
      expect(previousChapter(after.id)?.id).toBe(here.id);
    }
  });
});

describe('standingOf', () => {
  const bookends: ReadonlyArray<ChapterId> = ['welcome', 'roadmap'];

  it('returns null only for the two bookend chapters', () => {
    for (const chapter of CHAPTERS) {
      const standing = standingOf(chapter.id);
      if (bookends.includes(chapter.id)) expect(standing, chapter.id).toBeNull();
      else expect(standing, chapter.id).not.toBeNull();
    }
  });

  it('gives every chapter that is not shipped a note for the roadmap', () => {
    for (const chapter of CHAPTERS) {
      const standing = standingOf(chapter.id);
      if (!standing || standing.status === 'shipped') continue;
      expect(
        standing.note?.trim(),
        `${chapter.id} is ${standing.status} without a note`,
      ).toBeTruthy();
    }
  });
});
