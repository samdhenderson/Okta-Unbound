import { useCallback, useMemo, useState } from 'react';
import {
  type BreakdownRow,
  type Dimension,
  type MemberFilter,
  SOURCE_DIMENSION,
  dimensionTitle,
} from '../components/members/memberAnalytics';

export type FactorMode = 'off' | 'has' | 'missing';

export interface UseMemberFiltersOptions {
  pendingFilter?: MemberFilter | null;
}

export interface MemberFiltersApi {
  filters: MemberFilter[];
  activeCount: number;
  valuesFor: (dimension: Dimension | null) => Set<string>;
  sourceKeys: Set<string>;
  key: string;
  toggle: (dimension: Dimension, value: string, label: string) => void;
  toggleRow: (dimension: Dimension, row: BreakdownRow) => void;
  toggleStatus: (row: BreakdownRow) => void;
  clearStatus: () => void;
  toggleMfaValue: (value: string, label: string) => void;
  setFactorMode: (label: string, mode: FactorMode) => void;
  toggleSource: (key: string, label: string) => void;
  clearSource: () => void;
  remove: (filter: MemberFilter) => void;
  clearAll: () => void;
}

export function useMemberFilters(options: UseMemberFiltersOptions = {}): MemberFiltersApi {
  const { pendingFilter = null } = options;
  const [filters, setFilters] = useState<MemberFilter[]>([]);

  const [appliedRequest, setAppliedRequest] = useState<MemberFilter | null>(null);
  if (pendingFilter && pendingFilter !== appliedRequest) {
    setAppliedRequest(pendingFilter);
    setFilters((prev) =>
      prev.some((f) => f.dimension === pendingFilter.dimension && f.value === pendingFilter.value)
        ? prev
        : [...prev, pendingFilter],
    );
  }

  const toggle = useCallback((dimension: Dimension, value: string, label: string) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.dimension === dimension && f.value === value);
      if (existing) return prev.filter((f) => f !== existing);
      return [...prev, { dimension, value, label }];
    });
  }, []);

  const toggleRow = useCallback(
    (dimension: Dimension, row: BreakdownRow) => {
      toggle(dimension, row.value, `${dimensionTitle(dimension)}: ${row.label}`);
    },
    [toggle],
  );

  const toggleStatus = useCallback(
    (row: BreakdownRow) => toggle('status', row.value, `Status: ${row.label}`),
    [toggle],
  );

  const clearStatus = useCallback(
    () => setFilters((prev) => prev.filter((f) => f.dimension !== 'status')),
    [],
  );

  const toggleMfaValue = useCallback(
    (value: string, label: string) => toggle('mfa', value, label),
    [toggle],
  );

  const setFactorMode = useCallback((label: string, mode: FactorMode) => {
    setFilters((prev) => {
      const without = prev.filter(
        (f) =>
          !(
            f.dimension === 'mfa' &&
            (f.value === `has:${label}` || f.value === `missing:${label}`)
          ),
      );
      if (mode === 'off') return without;
      const value = mode === 'has' ? `has:${label}` : `missing:${label}`;
      const chip = `${mode === 'has' ? 'Has' : 'Missing'} ${label}`;
      return [...without, { dimension: 'mfa', value, label: chip }];
    });
  }, []);

  const toggleSource = useCallback(
    (key: string, label: string) => toggle(SOURCE_DIMENSION, key, `Source: ${label}`),
    [toggle],
  );

  const clearSource = useCallback(
    () => setFilters((prev) => prev.filter((f) => f.dimension !== SOURCE_DIMENSION)),
    [],
  );

  const remove = useCallback(
    (filter: MemberFilter) => setFilters((prev) => prev.filter((f) => f !== filter)),
    [],
  );

  const clearAll = useCallback(() => setFilters([]), []);

  const valuesFor = useCallback(
    (dimension: Dimension | null) =>
      new Set(filters.filter((f) => f.dimension === dimension).map((f) => f.value)),
    [filters],
  );

  const sourceKeys = useMemo(
    () => new Set(filters.filter((f) => f.dimension === SOURCE_DIMENSION).map((f) => f.value)),
    [filters],
  );

  const key = useMemo(() => filters.map((f) => `${f.dimension}:${f.value}`).join('|'), [filters]);

  return {
    filters,
    activeCount: filters.length,
    valuesFor,
    sourceKeys,
    key,
    toggle,
    toggleRow,
    toggleStatus,
    clearStatus,
    toggleMfaValue,
    setFactorMode,
    toggleSource,
    clearSource,
    remove,
    clearAll,
  };
}
