import { describe, it, expect } from 'vitest';
import { suggest, accept, MAX_ROWS, type Suggestion, type HoleCandidate } from './suggest';

function at(fixture: string): Suggestion {
  const caret = fixture.indexOf('|');
  expect(caret, 'fixture must mark the caret with |').toBeGreaterThanOrEqual(0);
  return suggest(fixture.replace('|', ''), caret);
}

const labels = (suggestion: Suggestion) => suggestion.rows.map((row) => row.label);

describe('choosing a mode', () => {
  it('suggests paths for an empty field', () => {
    expect(at('|').mode).toBe('path');
  });

  it('suggests paths while the caret is in the path', () => {
    expect(at('/api/v1/gr|oups?limit=200').mode).toBe('path');
  });

  it('treats the caret sitting on the ? as still being in the path', () => {
    expect(at('/api/v1/users|?limit=200').mode).toBe('path');
  });

  it('suggests parameter names just past the ?', () => {
    expect(at('/api/v1/users?|').mode).toBe('param-name');
  });

  it('suggests parameter names in a later segment', () => {
    expect(at('/api/v1/users?limit=200&se|').mode).toBe('param-name');
  });

  it('suggests a value once the caret is past the =', () => {
    expect(at('/api/v1/logs?sortOrder=|').mode).toBe('param-value');
  });

  it('goes back to the name when the caret moves back before the =', () => {
    expect(at('/api/v1/logs?sort|Order=DESCENDING').mode).toBe('param-name');
  });
});

describe('browsing with nothing typed', () => {
  it('opens on the first heading in the browse order', () => {
    expect(at('|').rows[0]?.heading).toBe('Users');
  });

  it('caps the list and says so', () => {
    const suggestion = at('|');
    expect(suggestion.rows.length).toBe(MAX_ROWS);
    expect(suggestion.truncated).toBe(true);
  });

  it('gives a heading to the first row of each run and to no other row', () => {
    const headed = at('|').rows.filter((row) => row.heading !== undefined);
    expect(headed.length).toBeLessThan(MAX_ROWS);
    expect(headed.length).toBeGreaterThan(1);
  });

  it('browses from a lone slash, which is what the field starts with', () => {
    expect(at('/|').rows.length).toBe(MAX_ROWS);
  });
});

describe('narrowing a path', () => {
  it('puts prefix matches ahead of substring matches', () => {
    const rows = labels(at('/api/v1/groups|'));
    const firstNonPrefix = rows.findIndex((path) => !path.startsWith('/api/v1/groups'));
    if (firstNonPrefix !== -1) {
      expect(rows.slice(0, firstNonPrefix).every((path) => path.startsWith('/api/v1/groups'))).toBe(
        true,
      );
    }
  });

  it('finds an endpoint by a word that is not in its path', () => {
    expect(labels(at('mfa|'))).toContain('/api/v1/users/{userId}/factors');
  });

  it('offers nothing for text that matches nothing', () => {
    expect(at('/api/v1/nothing-like-this|').rows).toEqual([]);
  });

  it('distinguishes two methods on one path as two rows', () => {
    const rows = at('/api/v1/users|').rows.filter((row) => row.label === '/api/v1/users');
    expect(rows.map((row) => row.trailing).sort()).toEqual(['GET', 'POST']);
  });
});

describe('accepting a path', () => {
  it('selects the first hole, so the next keystroke overtypes it', () => {
    const suggestion = at('groups/{|');
    const row = suggestion.rows.find((candidate) => candidate.label.includes('{groupId}'));
    expect(row?.select).toBeDefined();

    const result = accept('groups/{', suggestion, row!);
    expect(result.value.slice(result.selection![0], result.selection![1])).toBe('{groupId}');
    expect(result.reopen).toBe(true);
  });

  it('leaves an existing query string alone', () => {
    const value = '/api/v1/gr?limit=200';
    const suggestion = suggest(value, 10);
    const row = suggestion.rows.find((candidate) => candidate.label === '/api/v1/groups');
    expect(accept(value, suggestion, row!).value).toBe('/api/v1/groups?limit=200');
  });

  it('never adds a ? the reader did not type', () => {
    const suggestion = at('/api/v1/gr|');
    const row = suggestion.rows.find((candidate) => candidate.label === '/api/v1/groups');
    expect(accept('/api/v1/gr', suggestion, row!).value).toBe('/api/v1/groups');
  });

  it('puts the caret at the end of a path with no holes', () => {
    const suggestion = at('/api/v1/gr|');
    const row = suggestion.rows.find((candidate) => candidate.label === '/api/v1/groups');
    const result = accept('/api/v1/gr', suggestion, row!);
    expect(result.caret).toBe('/api/v1/groups'.length);
    expect(result.selection).toBeUndefined();
  });
});

describe('parameters for the path that was typed', () => {
  it('offers the paging parameters on a collection', () => {
    expect(labels(at('/api/v1/users?|'))).toEqual(expect.arrayContaining(['limit', 'after']));
  });

  it('offers nothing for a path the catalog does not know', () => {
    expect(at('/api/v1/made-up?|').rows).toEqual([]);
  });

  it('resolves a path whose holes are filled in', () => {
    expect(labels(at('/api/v1/groups/00gFAKE000000000000/users?|'))).toContain('expand');
  });

  it('refuses to treat a shorter path as a template match', () => {
    expect(labels(at('/api/v1/users?|'))).not.toContain('sendEmail');
  });

  it('drops a parameter already present in the query string', () => {
    expect(labels(at('/api/v1/users?limit=200&|'))).not.toContain('limit');
  });

  it('keeps offering the parameter the caret is currently editing', () => {
    expect(labels(at('/api/v1/users?lim|=200'))).toContain('limit');
  });

  it('narrows on what has been typed of the name', () => {
    expect(labels(at('/api/v1/users?se|'))).toEqual(['search']);
  });

  it('orders paging ahead of the rest', () => {
    const groups = at('/api/v1/users?|').rows.map((row) => row.heading ?? '');
    expect(groups[0]).toBe('Paging');
  });

  it('inserts a name with its = and leaves the list open', () => {
    const suggestion = at('/api/v1/users?|');
    const row = suggestion.rows.find((candidate) => candidate.label === 'limit');
    const result = accept('/api/v1/users?', suggestion, row!);
    expect(result.value).toBe('/api/v1/users?limit=');
    expect(result.caret).toBe(result.value.length);
    expect(result.reopen).toBe(true);
  });
});

describe('values', () => {
  it('offers exactly the two numbers that are facts about the endpoint', () => {
    expect(labels(at('/api/v1/logs?limit=|'))).toEqual(['100', '1000']);
  });

  it('states the endpoint-specific default rather than the API-wide one', () => {
    expect(labels(at('/api/v1/groups/00gFAKE000000000000/users?limit=|'))).toEqual(['1000']);
  });

  it('offers an enum verbatim', () => {
    expect(labels(at('/api/v1/logs?sortOrder=|'))).toEqual(['ASCENDING', 'DESCENDING']);
  });

  it('narrows an enum on what has been typed', () => {
    expect(labels(at('/api/v1/logs?sortOrder=DES|'))).toEqual(['DESCENDING']);
  });

  it('offers nothing for a value it cannot enumerate', () => {
    expect(at('/api/v1/users?search=|').rows).toEqual([]);
  });

  it('replaces only the value, leaving the segments around it', () => {
    const value = '/api/v1/logs?limit=1&sortOrder=A&until=x';
    const suggestion = suggest(value, value.indexOf('&until'));
    const row = suggestion.rows.find((candidate) => candidate.label === 'ASCENDING');
    expect(accept(value, suggestion, row!).value).toBe(
      '/api/v1/logs?limit=1&sortOrder=ASCENDING&until=x',
    );
  });
});

describe('standing in a hole', () => {
  const CANDIDATES: readonly HoleCandidate[] = [
    { kind: 'group', id: '00gFAKE000000000001', label: 'Engineering', source: 'snapshot' },
    { kind: 'group', id: '00gFAKE000000000002', label: 'Engineering Leads', source: 'search' },
    { kind: 'group', id: '00gFAKE000000000003', label: 'Sales', source: 'tab' },
    { kind: 'user', id: '00uFAKE000000000001', label: 'Ada Lovelace', source: 'search' },
  ];

  const inHole = (fixture: string) =>
    suggest(fixture.replace('|', ''), fixture.indexOf('|'), CANDIDATES);

  it('recognises the literal hole a just-accepted path left behind', () => {
    const suggestion = inHole('/api/v1/groups/{groupI|d}/users');
    expect(suggestion.mode).toBe('hole');
    expect(suggestion.hole?.token).toBe('groupId');
    expect(suggestion.hole?.kind).toBe('group');
  });

  it('recognises the segment being overtyped as the same hole', () => {
    const suggestion = inHole('/api/v1/groups/eng|/users');
    expect(suggestion.mode).toBe('hole');
    expect(suggestion.hole?.query).toBe('eng');
  });

  it('offers only candidates of the kind the hole wants', () => {
    expect(labels(inHole('/api/v1/groups/{groupId}|/users'))).not.toContain('Ada Lovelace');
  });

  it('puts the free sources ahead of the one that costs a request', () => {
    const rows = inHole('/api/v1/groups/{groupId}|/users').rows;
    expect(rows.map((row) => row.trailing)).toEqual([
      'Open in your tab',
      'From the org snapshot',
      'Found by search',
    ]);
  });

  it('narrows on what has been typed over the hole', () => {
    expect(labels(inHole('/api/v1/groups/Engineering L|/users'))).toEqual(['Engineering Leads']);
  });

  it('matches an id prefix as well as a name', () => {
    expect(labels(inHole('/api/v1/groups/00gFAKE000000000003|/users'))).toEqual(['Sales']);
  });

  it('replaces only the hole, leaving the rest of the path', () => {
    const value = '/api/v1/groups/{groupId}/users';
    const suggestion = suggest(value, 16, CANDIDATES);
    const row = suggestion.rows.find((candidate) => candidate.label === 'Sales');
    expect(accept(value, suggestion, row!).value).toBe('/api/v1/groups/00gFAKE000000000003/users');
  });

  it('is still hole mode with nothing to offer, because the caret says so', () => {
    const suggestion = suggest('/api/v1/groups/{groupId}/users', 16);
    expect(suggestion.mode).toBe('hole');
    expect(suggestion.rows).toEqual([]);
  });

  it('is not a hole when the segment is a literal the catalog knows', () => {
    expect(inHole('/api/v1/gro|ups').mode).toBe('path');
  });

  it('is not a hole while a real path is still being typed through that position', () => {
    expect(inHole('/api/v1/groups/rul|').mode).toBe('path');
    expect(inHole('/api/v1/groups/rules|').mode).toBe('path');
  });

  it('is not a hole when no template puts one at this position', () => {
    expect(inHole('/api/v1/nothing/like|/this').mode).toBe('path');
  });

  it('reports the kind it has no source for rather than pretending', () => {
    const suggestion = suggest(
      '/api/v1/users/00uFAKE000000000001/linkedObjects/manager',
      '/api/v1/users/00uFAKE000000000001/linkedObjects/man'.length,
      CANDIDATES,
    );
    expect(suggestion.mode).toBe('hole');
    expect(suggestion.hole?.kind).toBe('unknown');
    expect(suggestion.rows).toEqual([]);
  });
});

describe('a caret outside the string', () => {
  it('clamps rather than throwing', () => {
    expect(suggest('/api/v1/users', 999).mode).toBe('path');
    expect(suggest('/api/v1/users', -5).mode).toBe('path');
  });
});
