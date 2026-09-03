export interface NounForms {
  one: string;
  other: string;
}

export type Noun = string | NounForms;

function forms(noun: Noun): NounForms {
  return typeof noun === 'string' ? { one: noun, other: `${noun}s` } : noun;
}

export function pluralSuffix(count: number): string {
  return count === 1 ? '' : 's';
}

export function pluralNoun(count: number, noun: Noun): string {
  const { one, other } = forms(noun);
  return count === 1 ? one : other;
}

export function pluralize(count: number, noun: Noun): string {
  return `${count.toLocaleString()} ${pluralNoun(count, noun)}`;
}

export function singularOf(plural: string): string {
  if (!plural.endsWith('s')) return plural;
  if (plural.length > 3 && plural.endsWith('ies')) return `${plural.slice(0, -3)}y`;
  if (/(sse|she|che|xe|ze)s$/.test(plural)) return plural.slice(0, -2);
  if (plural.endsWith('ss')) return plural;
  return plural.slice(0, -1);
}
