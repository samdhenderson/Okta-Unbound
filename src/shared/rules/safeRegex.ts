export const MAX_PATTERN_LENGTH = 256;

export const MAX_INPUT_LENGTH = 512;

export const MAX_NFA_STATES = 512;

export const MAX_SIMULATION_STEPS = 250_000;

export interface SafeRegexLimits {
  readonly maxPatternLength: number;
  readonly maxNfaStates: number;
  readonly maxInputLength: number;
  readonly maxSimulationSteps: number;
}

export const SAFE_REGEX_LIMITS: SafeRegexLimits = {
  maxPatternLength: MAX_PATTERN_LENGTH,
  maxNfaStates: MAX_NFA_STATES,
  maxInputLength: MAX_INPUT_LENGTH,
  maxSimulationSteps: MAX_SIMULATION_STEPS,
};

function resolveLimits(overrides?: Partial<SafeRegexLimits>): SafeRegexLimits {
  if (!overrides) return SAFE_REGEX_LIMITS;
  return {
    maxPatternLength: Math.min(
      overrides.maxPatternLength ?? MAX_PATTERN_LENGTH,
      MAX_PATTERN_LENGTH,
    ),
    maxNfaStates: Math.min(overrides.maxNfaStates ?? MAX_NFA_STATES, MAX_NFA_STATES),
    maxInputLength: Math.min(overrides.maxInputLength ?? MAX_INPUT_LENGTH, MAX_INPUT_LENGTH),
    maxSimulationSteps: Math.min(
      overrides.maxSimulationSteps ?? MAX_SIMULATION_STEPS,
      MAX_SIMULATION_STEPS,
    ),
  };
}

export type SafeRegexDeclineReason =
  | 'pattern-too-long'
  | 'input-too-long'
  | 'unsupported-syntax'
  | 'parse-error'
  | 'too-many-states'
  | 'step-budget-exceeded'
  | 'internal-error';

export interface SafeRegexDeclined {
  readonly kind: 'declined';
  readonly reason: SafeRegexDeclineReason;
}

export interface SafeRegexMatch {
  readonly kind: 'match';
  readonly matched: boolean;
}

export type SafeRegexResult = SafeRegexMatch | SafeRegexDeclined;

export interface CompiledSafeRegex {
  readonly kind: 'compiled';
  readonly pattern: string;
  readonly stateCount: number;
  readonly states: readonly NfaState[];
  readonly start: number;
}

export type SafeRegexCompileResult = CompiledSafeRegex | SafeRegexDeclined;

function declined(reason: SafeRegexDeclineReason): SafeRegexDeclined {
  return { kind: 'declined', reason };
}

const CODE_POINT_MAX = 0x10ffff;

type Range = readonly [number, number];

interface CharSet {
  readonly negated: boolean;
  readonly ranges: readonly Range[];
}

function normalise(ranges: readonly Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: Range[] = [];
  for (const [lo, hi] of sorted) {
    const last = merged[merged.length - 1];
    if (last && lo <= last[1] + 1) {
      if (hi > last[1]) merged[merged.length - 1] = [last[0], hi];
    } else {
      merged.push([lo, hi]);
    }
  }
  return merged;
}

function complement(ranges: readonly Range[]): Range[] {
  const merged = normalise(ranges);
  const out: Range[] = [];
  let cursor = 0;
  for (const [lo, hi] of merged) {
    if (lo > cursor) out.push([cursor, lo - 1]);
    cursor = hi + 1;
  }
  if (cursor <= CODE_POINT_MAX) out.push([cursor, CODE_POINT_MAX]);
  return out;
}

function set(ranges: readonly Range[]): CharSet {
  return { negated: false, ranges: normalise(ranges) };
}

const DIGIT_RANGES: Range[] = [[0x30, 0x39]];
const WORD_RANGES: Range[] = [
  [0x30, 0x39],
  [0x41, 0x5a],
  [0x5f, 0x5f],
  [0x61, 0x7a],
];
const SPACE_RANGES: Range[] = [
  [0x09, 0x0d],
  [0x20, 0x20],
];
const LINE_TERMINATORS: Range[] = [
  [0x0a, 0x0a],
  [0x0d, 0x0d],
  [0x85, 0x85],
  [0x2028, 0x2029],
];

const SHORTHANDS: Readonly<Record<string, readonly Range[]>> = {
  d: DIGIT_RANGES,
  D: complement(DIGIT_RANGES),
  w: WORD_RANGES,
  W: complement(WORD_RANGES),
  s: SPACE_RANGES,
  S: complement(SPACE_RANGES),
};

const DOT: CharSet = { negated: true, ranges: normalise(LINE_TERMINATORS) };

const ESCAPABLE = new Set([
  '.',
  '\\',
  '-',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '*',
  '+',
  '?',
  '|',
  '^',
  '$',
  '/',
]);

function inSet(charSet: CharSet, codePoint: number): boolean {
  let hit = false;
  for (const [lo, hi] of charSet.ranges) {
    if (codePoint < lo) break;
    if (codePoint <= hi) {
      hit = true;
      break;
    }
  }
  return hit !== charSet.negated;
}

type Node =
  | { readonly kind: 'empty' }
  | { readonly kind: 'char'; readonly set: CharSet }
  | { readonly kind: 'assert'; readonly at: 'start' | 'end' }
  | { readonly kind: 'concat'; readonly parts: readonly Node[] }
  | { readonly kind: 'alt'; readonly parts: readonly Node[] }
  | { readonly kind: 'repeat'; readonly op: '*' | '+' | '?'; readonly body: Node };

class Refusal {
  constructor(readonly reason: SafeRegexDeclineReason) {}
}

function refuse(reason: SafeRegexDeclineReason): never {
  throw new Refusal(reason);
}

class Parser {
  private index = 0;
  private readonly chars: string[];

  constructor(pattern: string) {
    this.chars = Array.from(pattern);
  }

  parse(): Node {
    const node = this.parseAlternation();
    if (this.index < this.chars.length) refuse('parse-error');
    return node;
  }

  private peek(offset = 0): string | undefined {
    return this.chars[this.index + offset];
  }

  private next(): string {
    const ch = this.chars[this.index];
    if (ch === undefined) refuse('parse-error');
    this.index += 1;
    return ch;
  }

  private parseAlternation(): Node {
    const parts: Node[] = [this.parseConcat()];
    while (this.peek() === '|') {
      this.index += 1;
      parts.push(this.parseConcat());
    }
    return parts.length === 1 ? parts[0] : { kind: 'alt', parts };
  }

  private parseConcat(): Node {
    const parts: Node[] = [];
    for (;;) {
      const ch = this.peek();
      if (ch === undefined || ch === '|' || ch === ')') break;
      parts.push(this.parseRepeat());
    }
    if (parts.length === 0) return { kind: 'empty' };
    return parts.length === 1 ? parts[0] : { kind: 'concat', parts };
  }

  private parseRepeat(): Node {
    const atom = this.parseAtom();
    const ch = this.peek();
    if (ch !== '*' && ch !== '+' && ch !== '?') return atom;
    this.index += 1;
    if (atom.kind === 'assert') refuse('parse-error'); // `^*` — nothing to repeat
    const following = this.peek();
    if (following === '?' || following === '+' || following === '*') refuse('unsupported-syntax');
    return { kind: 'repeat', op: ch, body: atom };
  }

  private parseAtom(): Node {
    const ch = this.next();
    switch (ch) {
      case '(':
        return this.parseGroup();
      case '[':
        return { kind: 'char', set: this.parseClass() };
      case '.':
        return { kind: 'char', set: DOT };
      case '^':
        return { kind: 'assert', at: 'start' };
      case '$':
        return { kind: 'assert', at: 'end' };
      case '*':
      case '+':
      case '?':
        return refuse('parse-error'); // quantifier with nothing to repeat
      case '{':
        return refuse('unsupported-syntax'); // bounded repetition
      case '\\':
        return this.parseEscapeNode();
      default:
        return literalNode(ch);
    }
  }

  private parseGroup(): Node {
    if (this.peek() === '?') {
      if (this.peek(1) !== ':') refuse('unsupported-syntax');
      this.index += 2;
    }
    const body = this.parseAlternation();
    if (this.peek() !== ')') refuse('parse-error'); // unbalanced '('
    this.index += 1;
    return body;
  }

  private parseEscapeNode(): Node {
    const resolved = this.parseEscape();
    return typeof resolved === 'number'
      ? { kind: 'char', set: set([[resolved, resolved]]) }
      : { kind: 'char', set: resolved };
  }

  private parseEscape(): number | CharSet {
    if (this.index >= this.chars.length) refuse('parse-error'); // trailing backslash
    const ch = this.next();
    const shorthand = Object.prototype.hasOwnProperty.call(SHORTHANDS, ch)
      ? SHORTHANDS[ch]
      : undefined;
    if (shorthand) return set(shorthand);
    if (ESCAPABLE.has(ch)) {
      const cp = ch.codePointAt(0);
      if (cp === undefined) refuse('parse-error');
      return cp;
    }
    return refuse('unsupported-syntax');
  }

  private parseClass(): CharSet {
    const negated = this.peek() === '^';
    if (negated) this.index += 1;
    if (this.peek() === ']') refuse('parse-error'); // `[]` / `[^]` — an error on the JVM
    const ranges: Range[] = [];
    for (;;) {
      const ch = this.peek();
      if (ch === undefined) refuse('parse-error'); // unbalanced '['
      if (ch === ']') break;
      if (ch === '[') refuse('unsupported-syntax'); // class union
      if (ch === '&' && this.peek(1) === '&') refuse('unsupported-syntax'); // intersection
      const lo = this.parseClassAtom();
      if (typeof lo !== 'number') {
        ranges.push(...lo.ranges);
        continue;
      }
      if (this.peek() === '-' && this.peek(1) !== undefined && this.peek(1) !== ']') {
        this.index += 1;
        const hi = this.parseClassAtom();
        if (typeof hi !== 'number') refuse('parse-error'); // `[a-\d]`
        if (hi < lo) refuse('parse-error'); // reversed range
        ranges.push([lo, hi]);
      } else {
        ranges.push([lo, lo]);
      }
    }
    this.index += 1; // consume ']'
    return { negated, ranges: normalise(ranges) };
  }

  private parseClassAtom(): number | CharSet {
    const ch = this.next();
    if (ch === '\\') return this.parseEscape();
    const cp = ch.codePointAt(0);
    if (cp === undefined) refuse('parse-error');
    return cp;
  }
}

function literalNode(ch: string): Node {
  const cp = ch.codePointAt(0);
  if (cp === undefined) refuse('parse-error');
  return { kind: 'char', set: set([[cp, cp]]) };
}

interface NfaState {
  readonly kind: 'char' | 'split' | 'assert-start' | 'assert-end' | 'match';
  readonly set?: CharSet;
  next: number;
  alt: number;
}

class Builder {
  readonly states: NfaState[] = [];

  constructor(private readonly maxStates: number) {}

  private add(state: NfaState): number {
    if (this.states.length >= this.maxStates) refuse('too-many-states');
    this.states.push(state);
    return this.states.length - 1;
  }

  emit(node: Node, next: number): number {
    switch (node.kind) {
      case 'empty':
        return next;
      case 'char':
        return this.add({ kind: 'char', set: node.set, next, alt: -1 });
      case 'assert':
        return this.add({
          kind: node.at === 'start' ? 'assert-start' : 'assert-end',
          next,
          alt: -1,
        });
      case 'concat': {
        let entry = next;
        for (let i = node.parts.length - 1; i >= 0; i -= 1) {
          entry = this.emit(node.parts[i], entry);
        }
        return entry;
      }
      case 'alt': {
        let entry = this.emit(node.parts[node.parts.length - 1], next);
        for (let i = node.parts.length - 2; i >= 0; i -= 1) {
          const branch = this.emit(node.parts[i], next);
          entry = this.add({ kind: 'split', next: branch, alt: entry });
        }
        return entry;
      }
      case 'repeat':
        return this.emitRepeat(node.op, node.body, next);
    }
  }

  private emitRepeat(op: '*' | '+' | '?', body: Node, next: number): number {
    if (op === '?') {
      const branch = this.emit(body, next);
      return this.add({ kind: 'split', next: branch, alt: next });
    }
    const split = this.add({ kind: 'split', next: -1, alt: next });
    const entry = this.emit(body, split);
    this.states[split].next = entry;
    return op === '*' ? split : entry;
  }
}

export function compileSafeRegex(
  pattern: string,
  limits?: Partial<SafeRegexLimits>,
): SafeRegexCompileResult {
  const resolved = resolveLimits(limits);
  if (pattern.length > resolved.maxPatternLength) return declined('pattern-too-long');
  try {
    const ast = new Parser(pattern).parse();
    const builder = new Builder(resolved.maxNfaStates);
    const accept = builder.states.length;
    builder.states.push({ kind: 'match', next: -1, alt: -1 });
    const start = builder.emit(ast, accept);
    return {
      kind: 'compiled',
      pattern,
      stateCount: builder.states.length,
      states: builder.states,
      start,
    };
  } catch (error) {
    return declined(error instanceof Refusal ? error.reason : 'parse-error');
  }
}

export function matchCompiled(
  program: CompiledSafeRegex,
  input: string,
  limits?: Partial<SafeRegexLimits>,
): SafeRegexResult {
  try {
    return simulate(program, input, limits);
  } catch {
    return declined('internal-error');
  }
}

function simulate(
  program: CompiledSafeRegex,
  input: string,
  limits?: Partial<SafeRegexLimits>,
): SafeRegexResult {
  const resolved = resolveLimits(limits);
  if (input.length > resolved.maxInputLength) return declined('input-too-long');

  const codePoints: number[] = [];
  for (const ch of input) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined) codePoints.push(cp);
  }

  const { states } = program;
  const marks = new Int32Array(states.length).fill(-1);
  const stack: number[] = [];
  let steps = 0;
  let generation = 0;
  let budgetExceeded = false;

  const addState = (list: number[], entry: number, position: number): void => {
    stack.length = 0;
    stack.push(entry);
    while (stack.length > 0) {
      const index = stack.pop() as number;
      if (marks[index] === generation) continue;
      marks[index] = generation;
      steps += 1;
      if (steps > resolved.maxSimulationSteps) {
        budgetExceeded = true;
        return;
      }
      const state = states[index];
      switch (state.kind) {
        case 'split':
          stack.push(state.alt, state.next);
          break;
        case 'assert-start':
          if (position === 0) stack.push(state.next);
          break;
        case 'assert-end':
          if (position === codePoints.length) stack.push(state.next);
          break;
        default:
          list.push(index);
          break;
      }
    }
  };

  let current: number[] = [];
  let pending: number[] = [];
  addState(current, program.start, 0);
  if (budgetExceeded) return declined('step-budget-exceeded');

  for (let i = 0; i < codePoints.length; i += 1) {
    if (current.length === 0) break;
    const cp = codePoints[i];
    generation += 1;
    pending.length = 0;
    for (const index of current) {
      const state = states[index];
      steps += 1;
      if (steps > resolved.maxSimulationSteps) return declined('step-budget-exceeded');
      if (state.kind !== 'char' || state.set === undefined) continue;
      if (!inSet(state.set, cp)) continue;
      addState(pending, state.next, i + 1);
      if (budgetExceeded) return declined('step-budget-exceeded');
    }
    const swap = current;
    current = pending;
    pending = swap;
  }

  const matched = current.some((index) => states[index].kind === 'match');
  return { kind: 'match', matched };
}

export function matchSafeRegex(
  pattern: string,
  input: string,
  limits?: Partial<SafeRegexLimits>,
): SafeRegexResult {
  const program = compileSafeRegex(pattern, limits);
  if (program.kind === 'declined') return program;
  return matchCompiled(program, input, limits);
}
