import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const SRC = resolve(__dirname, '..');
const GUIDE = resolve(__dirname);

const FORBIDDEN: ReadonlyArray<{ pattern: RegExp; why: string }> = [
  { pattern: /sidepanel\/hooks\/useOktaApi(\.tsx?|\/)/, why: 'the API facade' },
  { pattern: /contexts\/SchedulerContext/, why: 'the scheduler' },
  { pattern: /sidepanel\/cache\//, why: 'the entity cache' },
  { pattern: /shared\/snapshot\//, why: 'the org snapshot store' },
  { pattern: /shared\/storage\//, why: 'chrome.storage-backed stores' },
  { pattern: /shared\/guide\.ts$/, why: 'the chrome-bound guide opener' },
];

const IMPORT_RE =
  /(?:^|\n)\s*(?:import|export)\s+(?!type\s)(?:[^'"]*?\sfrom\s*)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function listSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listSources(full));
    else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|stories)\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('.')) base = resolve(dirname(from), spec);
  else if (spec.startsWith('@/')) base = resolve(SRC, spec.slice(2));
  else return null; // a package, not ours
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

describe('frame rule', () => {
  it('nothing reachable from src/guide touches the API, storage, or chrome', () => {
    const seen = new Map<string, string[]>(); // file -> import chain
    const queue: Array<{ file: string; chain: string[] }> = listSources(GUIDE).map((file) => ({
      file,
      chain: [],
    }));
    const failures: string[] = [];

    while (queue.length) {
      const { file, chain } = queue.shift()!;
      if (seen.has(file)) continue;
      seen.set(file, chain);
      const rel = file.slice(SRC.length + 1);
      const trail = [...chain, rel];

      for (const { pattern, why } of FORBIDDEN) {
        if (pattern.test(file)) failures.push(`${why}: ${trail.join(' -> ')}`);
      }
      const source = code(file);
      if (!file.startsWith(GUIDE) && /\bchrome\./.test(source)) {
        failures.push(`names chrome.*: ${trail.join(' -> ')}`);
      }

      for (const match of source.matchAll(IMPORT_RE)) {
        const spec = match[1] ?? match[2];
        if (!spec || spec.endsWith('.css') || spec.endsWith('.json')) continue;
        const target = resolveImport(file, spec);
        if (target) queue.push({ file: target, chain: trail });
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
