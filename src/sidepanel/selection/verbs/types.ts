import type { useOktaApi } from '../../hooks/useOktaApi';
import type { CellValue } from '../../export/types';
import type { BreakdownRow } from '../../components/members/memberAnalytics';
import type { AddOutcome, SelectionBasket, SelectionKind, SelectionRef } from '../selectionStore';

export type VerbPath = 'convert' | 'write' | 'read';

export interface VerbCost {
  requests: number;
  walks?: number;
  walkKind?: 'membership' | 'app-assignment';
  writes: number;
}

export const RUN_WRITE_CAP = 1000;

export type VerbRefusalCode =
  'over-write-cap' | 'over-capture-cohort' | 'nothing-to-do' | 'invalid-value' | 'not-connected';

export class VerbRefusal extends Error {
  readonly code: VerbRefusalCode;

  constructor(code: VerbRefusalCode, message: string) {
    super(message);
    this.name = 'VerbRefusal';
    this.code = code;
  }
}

export interface VerbFieldOption {
  value: string;
  label: string;
  distribution?: readonly BreakdownRow[];
  summary?: string;
}

export interface VerbField {
  id: string;
  label: string;
  placeholder?: string;
  options?: readonly VerbFieldOption[];
  optionLayout?: 'select' | 'list';
  distribution?: readonly BreakdownRow[];
  control?: 'text' | 'number';
  refreshesFields?: boolean;
  required?: boolean;
  help?: string;
}

export interface VerbPreflight {
  cost: VerbCost;
  items: number;
  lines: readonly string[];
  refusal?: { code: VerbRefusalCode; message: string };
  payload?: unknown;
}

export type VerbStatus = 'done' | 'partly-done' | 'refused' | 'nothing-to-do';

export interface VerbDetail {
  filenameStem: string;
  headers: readonly string[];
  rows: readonly (readonly CellValue[])[];
}

export interface VerbOutcome {
  status: VerbStatus;
  summary: string;
  detail?: VerbDetail;
}

export type VerbApi = ReturnType<typeof useOktaApi>;

export interface VerbContext {
  basket: SelectionBasket;
  counts: Partial<Record<SelectionKind, number>>;
  addMany: (refs: Omit<SelectionRef, 'pickedAt'>[]) => AddOutcome;
  report: (message: string) => void;
  memo: Map<string, unknown>;
  api: VerbApi;
  values: Readonly<Record<string, string>>;
  oktaOrigin: string | null;
}

export interface BasketVerb {
  id: string;
  label: string;
  title: string;
  path: VerbPath;
  needs: readonly SelectionKind[];
  isAvailable?(basket: SelectionBasket): boolean;
  unavailableReason?: string;
  cost(basket: SelectionBasket): VerbCost;
  prepareFields?(context: VerbContext): Promise<readonly VerbField[]>;
  preflight?(context: VerbContext): Promise<VerbPreflight>;
  run(context: VerbContext, preflight?: VerbPreflight): Promise<VerbOutcome>;
}
