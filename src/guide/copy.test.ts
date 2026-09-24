import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const SRC = resolve(__dirname, '..');
const ROOTS = [resolve(__dirname), resolve(SRC, 'sidepanel/components/welcome')];
const SELF = resolve(__dirname, 'copy.test.ts');

const SCANNED = /\.(ts|tsx|css|md)$/;
const BANNED = /[\u2013\u2014]/u;

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (SCANNED.test(entry) && full !== SELF) out.push(full);
  }
  return out;
}

describe('copy voice', () => {
  it('uses no en dash or em dash anywhere in the guide or welcome surface', () => {
    const files = ROOTS.filter(existsSync).flatMap(listFiles);
    expect(files.length).toBeGreaterThan(0);

    const hits: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (BANNED.test(line)) hits.push(`${relative(SRC, file)}:${i + 1}: ${line.trim()}`);
      });
    }

    expect(hits, hits.join('\n')).toEqual([]);
  });
});
