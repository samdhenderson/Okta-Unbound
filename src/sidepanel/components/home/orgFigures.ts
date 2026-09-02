import type { IconType } from '../shared/Icon';
import type { ListViewRequest, ListViewTab } from '../../listViewRequest';

export type OrgFigureStatus = 'reading' | 'ok' | 'partial' | 'unavailable';

export interface FigureSource {
  isReading: boolean;
  complete: boolean;
  lastFullWalkAt: number | null;
  count: number;
  error?: string | null;
  status?: number | null;
}

export interface OrgFigure {
  key: string;
  label: string;
  icon: IconType;
  status: OrgFigureStatus;
  value: number | null;
  note?: string;
}

export function figureStatus(source: FigureSource): OrgFigureStatus {
  if (source.isReading) return 'reading';
  if (source.complete && source.lastFullWalkAt !== null) return 'ok';
  return source.count > 0 ? 'partial' : 'unavailable';
}

function isPermissionDenied(status: number | null | undefined): boolean {
  return status === 401 || status === 403;
}

function unavailableNote(
  label: string,
  error: string | null | undefined,
  status?: number | null,
): string {
  if (isPermissionDenied(status)) {
    return `You are not allowed to read ${label.toLowerCase()}.`;
  }
  return error
    ? `The last read of ${label.toLowerCase()} did not finish.`
    : `${label} have not been read yet.`;
}

export function buildFigure(
  key: string,
  label: string,
  icon: IconType,
  source: FigureSource,
  count = source.count,
): OrgFigure {
  const status = figureStatus(source);
  return {
    key,
    label,
    icon,
    status,
    value: status === 'ok' || status === 'partial' ? count : null,
    note:
      status === 'partial'
        ? 'At least — the last read did not finish.'
        : status === 'unavailable'
          ? unavailableNote(label, source.error, source.status)
          : undefined,
  };
}

export interface NamedSource {
  source: FigureSource;
  noun: string;
}

export interface OrgSubCount {
  key: string;
  label: string;
  status: OrgFigureStatus;
  value: number | null;
  note?: string;
  request: ListViewRequest;
}

export interface OrgBox extends OrgFigure {
  tab: ListViewTab;
  noun: string;
  subCounts: OrgSubCount[];
}

export function subCountStatus(
  counted: FigureSource,
  gates: FigureSource[],
  floors: FigureSource[] = [],
): OrgFigureStatus {
  const positives = [counted, ...floors].map(figureStatus);
  const negatives = gates.map(figureStatus);
  if ([...positives, ...negatives].some((status) => status === 'reading')) return 'reading';
  if (negatives.some((status) => status !== 'ok')) return 'unavailable';
  if (positives.some((status) => status === 'unavailable')) return 'unavailable';
  return positives.some((status) => status === 'partial') ? 'partial' : 'ok';
}

export interface CountResolution {
  status: OrgFigureStatus;
  value: number | null;
  note?: string;
}

export interface CountInput {
  counted: NamedSource;
  gates?: NamedSource[];
  floors?: NamedSource[];
  count: number;
}

function countNote(
  status: OrgFigureStatus,
  counted: NamedSource,
  gates: NamedSource[],
  floors: NamedSource[],
): string | undefined {
  if (status === 'reading') return undefined;
  if (status === 'ok') return `of ${counted.source.count.toLocaleString()} ${counted.noun}`;
  if (status === 'partial') {
    const short = [counted, ...floors].find((source) => figureStatus(source.source) !== 'ok');
    return `At least — the last read of ${(short ?? counted).noun} did not finish.`;
  }

  const blocking = [...gates, ...floors].find((source) => figureStatus(source.source) !== 'ok');
  return blocking
    ? `Needs ${blocking.noun}, which have not been read.`
    : `${counted.noun[0].toUpperCase()}${counted.noun.slice(1)} have not been read yet.`;
}

export function resolveCount({
  counted,
  gates = [],
  floors = [],
  count,
}: CountInput): CountResolution {
  const status = subCountStatus(
    counted.source,
    gates.map((gate) => gate.source),
    floors.map((floor) => floor.source),
  );
  const hasValue = status === 'ok' || status === 'partial';
  return {
    status,
    value: hasValue ? count : null,
    note: countNote(status, counted, gates, floors),
  };
}

export interface SubCountInput extends CountInput {
  key: string;
  label: string;
  request: ListViewRequest;
}

export function buildSubCount({ key, label, request, ...counts }: SubCountInput): OrgSubCount {
  return { key, label, ...resolveCount(counts), request };
}

export function buildBox(
  figure: OrgFigure,
  tab: ListViewTab,
  noun: string,
  subCounts: OrgSubCount[],
): OrgBox {
  return { ...figure, tab, noun, subCounts };
}

export function oldestWalkAt(sources: FigureSource[]): number | null {
  const stamps = sources.map((source) => source.lastFullWalkAt);
  if (stamps.some((stamp) => stamp === null)) return null;
  return Math.min(...(stamps as number[]));
}
