const CLASSES = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnopqrstuvwxyz',
  '23456789',
  '!@#$%^&*-_=+',
] as const;

const ALPHABET = CLASSES.join('');

export const MIN_GENERATED_LENGTH = 12;

export const DEFAULT_GENERATED_LENGTH = 20;

function pick(alphabet: string): string {
  const ceiling = Math.floor(256 / alphabet.length) * alphabet.length;
  const buffer = new Uint8Array(1);

  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < ceiling) return alphabet[buffer[0] % alphabet.length];
  }
}

export function generatePassword(length: number = DEFAULT_GENERATED_LENGTH): string {
  const size = Math.max(length, MIN_GENERATED_LENGTH);

  const chars = CLASSES.map((klass) => pick(klass));
  while (chars.length < size) chars.push(pick(ALPHABET));

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const ceiling = Math.floor(256 / (i + 1)) * (i + 1);
    const buffer = new Uint8Array(1);
    do {
      crypto.getRandomValues(buffer);
    } while (buffer[0] >= ceiling);
    const j = buffer[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
