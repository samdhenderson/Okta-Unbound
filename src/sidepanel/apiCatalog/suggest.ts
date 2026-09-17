import { CATALOG_GROUPS, CATALOG_GROUP_LABEL } from './groups';
import {
  findEndpoint,
  parseHoles,
  matchesTemplate,
  HOLE_KINDS,
  type HoleKind,
} from './pathTemplate';
import { CATALOG_ENDPOINTS } from './registry';
import { resolveParams } from './resolve';
import type { CatalogEndpoint, CatalogParam, ParamGroup } from './types';

export type SuggestMode = 'path' | 'param-name' | 'param-value' | 'hole';

export interface HoleCandidate {
  readonly kind: HoleKind;
  readonly id: string;
  readonly label: string;
  readonly secondary?: string;
  readonly source: 'tab' | 'snapshot' | 'search';
}

const SOURCE_LABEL: Readonly<Record<HoleCandidate['source'], string>> = {
  tab: 'Open in your tab',
  snapshot: 'From the org snapshot',
  search: 'Found by search',
};

const SOURCE_HEADING: Readonly<Record<HoleCandidate['source'], string>> = {
  tab: 'The page you have open',
  snapshot: 'Already loaded',
  search: 'Search results',
};

const SOURCE_RANK: ReadonlyArray<HoleCandidate['source']> = ['tab', 'snapshot', 'search'];

export const MAX_ROWS = 50;

export interface SuggestRow {
  readonly id: string;
  readonly kind: 'endpoint' | 'param' | 'value' | 'hole';
  readonly label: string;
  readonly secondary?: string;
  readonly trailing?: string;
  readonly heading?: string;
  readonly insert: string;
  readonly select?: readonly [number, number];
  readonly reopen?: true;
}

export interface Suggestion {
  readonly mode: SuggestMode;
  readonly hole?: { readonly token: string; readonly kind: HoleKind; readonly query: string };
  readonly replaceFrom: number;
  readonly replaceTo: number;
  readonly rows: readonly SuggestRow[];
  readonly truncated: boolean;
}

const GROUP_RANK = new Map(CATALOG_GROUPS.map((group, index) => [group.id, index]));

const PARAM_GROUP_RANK: readonly ParamGroup[] = [
  'Paging',
  'Filtering',
  'Embedding',
  'Time',
  'Other',
];

const TIER = { prefix: 0, substring: 1, keyword: 2, miss: 3 } as const;

type Tier = (typeof TIER)[keyof typeof TIER];

function tierFor(endpoint: CatalogEndpoint, query: string): Tier {
  const path = endpoint.path.toLowerCase();
  if (path.startsWith(query)) return TIER.prefix;
  if (path.includes(query)) return TIER.substring;

  const words = [...(endpoint.keywords ?? []), endpoint.summary].join(' ').toLowerCase();
  return words.includes(query) ? TIER.keyword : TIER.miss;
}

function withHeadings<T extends { heading?: string }>(rows: T[]): T[] {
  let previous: string | undefined;
  return rows.map((row) => {
    const heading = row.heading !== previous ? row.heading : undefined;
    previous = row.heading;
    return { ...row, heading };
  });
}

function endpointRow(endpoint: CatalogEndpoint): SuggestRow {
  const [firstHole] = parseHoles(endpoint.path);
  return {
    id: `endpoint-${endpoint.id}`,
    kind: 'endpoint',
    label: endpoint.path,
    secondary: endpoint.summary,
    trailing: endpoint.method,
    heading: CATALOG_GROUP_LABEL[endpoint.group],
    insert: endpoint.path,
    ...(firstHole ? { select: [firstHole.start, firstHole.end] as const } : {}),
  };
}

function holeAtCaret(
  path: string,
  position: number,
): { token: string; kind: HoleKind; query: string; bounds: [number, number] } | null {
  const segments = path.split('/');

  let start = 0;
  let index = 0;
  for (; index < segments.length; index += 1) {
    const end = start + segments[index].length;
    if (position <= end) break;
    start = end + 1;
  }
  if (index >= segments.length) return null;

  const segment = segments[index];
  if (segment === '') return null;

  const literalHole = segment.startsWith('{');
  if (
    !literalHole &&
    CATALOG_ENDPOINTS.some((candidate) =>
      candidate.path.toLowerCase().startsWith(path.toLowerCase()),
    )
  ) {
    return null;
  }

  const probe = [...segments];
  probe[index] = '\u0000';
  const endpoint = CATALOG_ENDPOINTS.find((candidate) =>
    matchesTemplate(probe.join('/'), candidate.path),
  );
  if (!endpoint) return null;

  const templateSegment = endpoint.path.split('/')[index];
  if (!templateSegment?.startsWith('{')) return null;

  const token = templateSegment.slice(1, -1);
  return {
    token,
    kind: HOLE_KINDS[token] ?? 'unknown',
    query: segment,
    bounds: [start, start + segment.length],
  };
}

function suggestHole(
  candidates: readonly HoleCandidate[],
  hole: { token: string; kind: HoleKind; query: string },
  bounds: readonly [number, number],
): Suggestion {
  const query = hole.query.toLowerCase();
  const typedIsHole = query.startsWith('{');

  const matched = candidates
    .filter((candidate) => candidate.kind === hole.kind)
    .filter(
      (candidate) =>
        typedIsHole ||
        query === '' ||
        candidate.label.toLowerCase().includes(query) ||
        candidate.id.toLowerCase().startsWith(query),
    )
    .sort(
      (a, b) =>
        SOURCE_RANK.indexOf(a.source) - SOURCE_RANK.indexOf(b.source) ||
        a.label.localeCompare(b.label),
    );

  return {
    mode: 'hole',
    hole,
    replaceFrom: bounds[0],
    replaceTo: bounds[1],
    rows: withHeadings(
      matched.slice(0, MAX_ROWS).map((candidate) => ({
        id: `hole-${candidate.source}-${candidate.id}`,
        kind: 'hole' as const,
        label: candidate.label,
        secondary: candidate.id,
        trailing: SOURCE_LABEL[candidate.source],
        heading: SOURCE_HEADING[candidate.source],
        insert: candidate.id,
      })),
    ),
    truncated: matched.length > MAX_ROWS,
  };
}

function suggestPath(value: string, replaceTo: number): Suggestion {
  const query = value.slice(0, replaceTo).trim().toLowerCase();
  const browsing = query === '' || query === '/';

  const scored = CATALOG_ENDPOINTS.map((endpoint) => ({
    endpoint,
    tier: browsing ? TIER.prefix : tierFor(endpoint, query),
  }))
    .filter((candidate) => candidate.tier !== TIER.miss)
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        (GROUP_RANK.get(a.endpoint.group) ?? 0) - (GROUP_RANK.get(b.endpoint.group) ?? 0) ||
        a.endpoint.path.localeCompare(b.endpoint.path) ||
        a.endpoint.method.localeCompare(b.endpoint.method),
    );

  return {
    mode: 'path',
    replaceFrom: 0,
    replaceTo,
    rows: withHeadings(
      scored.slice(0, MAX_ROWS).map((candidate) => endpointRow(candidate.endpoint)),
    ),
    truncated: scored.length > MAX_ROWS,
  };
}

function namesInUse(
  query: string,
  editedFrom: number,
  editedTo: number,
  offset: number,
): Set<string> {
  const used = new Set<string>();
  let cursor = 0;
  for (const segment of query.split('&')) {
    const start = offset + cursor;
    cursor += segment.length + 1;
    if (start === editedFrom || (start < editedTo && start + segment.length > editedFrom)) continue;
    const name = segment.split('=')[0];
    if (name) used.add(name);
  }
  return used;
}

function paramRow(param: CatalogParam): SuggestRow {
  const takesValue = param.kind !== 'none';
  return {
    id: `param-${param.name}`,
    kind: 'param',
    label: param.name,
    secondary: param.description,
    trailing: param.defaultValue ? `default ${param.defaultValue}` : undefined,
    heading: param.group,
    insert: takesValue ? `${param.name}=` : param.name,
    ...(takesValue && (param.values || param.defaultValue || param.max) ? { reopen: true } : {}),
  };
}

function valueRows(param: CatalogParam): SuggestRow[] {
  if (param.kind === 'enum') {
    return (param.values ?? []).map((option) => ({
      id: `value-${param.name}-${option}`,
      kind: 'value' as const,
      label: option,
      secondary: option === param.defaultValue ? 'The default' : undefined,
      insert: option,
    }));
  }

  if (param.kind === 'number') {
    const rows: SuggestRow[] = [];
    if (param.defaultValue !== undefined) {
      rows.push({
        id: `value-${param.name}-default`,
        kind: 'value',
        label: param.defaultValue,
        secondary: 'What this endpoint uses when the parameter is absent',
        insert: param.defaultValue,
      });
    }
    if (param.max !== undefined && String(param.max) !== param.defaultValue) {
      rows.push({
        id: `value-${param.name}-max`,
        kind: 'value',
        label: String(param.max),
        secondary: 'The largest value this endpoint accepts',
        insert: String(param.max),
      });
    }
    return rows;
  }

  return [];
}

export function suggest(
  value: string,
  caret: number,
  candidates: readonly HoleCandidate[] = [],
): Suggestion {
  const position = Math.max(0, Math.min(caret, value.length));
  const questionMark = value.indexOf('?');

  if (questionMark === -1 || position <= questionMark) {
    const pathEnd = questionMark === -1 ? value.length : questionMark;
    const hole = holeAtCaret(value.slice(0, pathEnd), position);
    if (hole) {
      return suggestHole(candidates, hole, hole.bounds);
    }
    return suggestPath(value, pathEnd);
  }

  const queryStart = questionMark + 1;
  const ampersandBefore = value.lastIndexOf('&', position - 1);
  const segmentStart = Math.max(
    queryStart,
    ampersandBefore === -1 ? queryStart : ampersandBefore + 1,
  );
  const ampersandAfter = value.indexOf('&', position);
  const segmentEnd = ampersandAfter === -1 ? value.length : ampersandAfter;

  const segment = value.slice(segmentStart, segmentEnd);
  const equals = segment.indexOf('=');
  const endpoint = findEndpoint(value.slice(0, questionMark));
  const params = endpoint ? resolveParams(endpoint.id) : [];

  if (equals === -1 || position <= segmentStart + equals) {
    const nameEnd = segmentStart + (equals === -1 ? segment.length : equals);
    const typed = value.slice(segmentStart, nameEnd).toLowerCase();
    const used = namesInUse(value.slice(queryStart), segmentStart, segmentEnd, queryStart);

    const matched = params
      .filter((param) => param.repeatable || !used.has(param.name))
      .filter((param) => param.name.toLowerCase().startsWith(typed))
      .sort(
        (a, b) =>
          PARAM_GROUP_RANK.indexOf(a.group) - PARAM_GROUP_RANK.indexOf(b.group) ||
          a.name.localeCompare(b.name),
      );

    return {
      mode: 'param-name',
      replaceFrom: segmentStart,
      replaceTo: nameEnd,
      rows: withHeadings(matched.slice(0, MAX_ROWS).map(paramRow)),
      truncated: matched.length > MAX_ROWS,
    };
  }

  const name = segment.slice(0, equals);
  const param = params.find((candidate) => candidate.name === name);
  const typed = value.slice(segmentStart + equals + 1, segmentEnd).toLowerCase();

  const rows = (param ? valueRows(param) : []).filter((row) =>
    row.label.toLowerCase().startsWith(typed),
  );

  return {
    mode: 'param-value',
    replaceFrom: segmentStart + equals + 1,
    replaceTo: segmentEnd,
    rows,
    truncated: false,
  };
}

export interface Accepted {
  readonly value: string;
  readonly caret: number;
  readonly selection?: readonly [number, number];
  readonly reopen: boolean;
}

export function accept(value: string, suggestion: Suggestion, row: SuggestRow): Accepted {
  const before = value.slice(0, suggestion.replaceFrom);
  const after = value.slice(suggestion.replaceTo);
  const start = before.length;

  return {
    value: `${before}${row.insert}${after}`,
    caret: start + (row.select ? row.select[0] : row.insert.length),
    ...(row.select ? { selection: [start + row.select[0], start + row.select[1]] as const } : {}),
    reopen: row.select !== undefined || row.reopen === true,
  };
}
