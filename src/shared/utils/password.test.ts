import { describe, it, expect } from 'vitest';
import { generatePassword, DEFAULT_GENERATED_LENGTH, MIN_GENERATED_LENGTH } from './password';

describe('generatePassword', () => {
  it('produces the default length', () => {
    expect(generatePassword()).toHaveLength(DEFAULT_GENERATED_LENGTH);
  });

  it('honours a requested length', () => {
    expect(generatePassword(32)).toHaveLength(32);
  });

  it('clamps up to the floor rather than producing a short value', () => {
    expect(generatePassword(3)).toHaveLength(MIN_GENERATED_LENGTH);
  });

  it('contains at least one character from each class', () => {
    for (let run = 0; run < 50; run += 1) {
      const value = generatePassword();
      expect(value).toMatch(/[A-Z]/);
      expect(value).toMatch(/[a-z]/);
      expect(value).toMatch(/[0-9]/);
      expect(value).toMatch(/[!@#$%^&*\-_=+]/);
    }
  });

  it('excludes the characters that get misread when read aloud', () => {
    for (let run = 0; run < 50; run += 1) {
      expect(generatePassword()).not.toMatch(/[O0lI1]/);
    }
  });

  it('does not pin the guaranteed classes to the first four positions', () => {
    const firsts = new Set(Array.from({ length: 50 }, () => generatePassword()[0]));
    const allUpper = [...firsts].every((char) => /[A-Z]/.test(char));
    expect(allUpper).toBe(false);
  });

  it('does not repeat itself', () => {
    const values = new Set(Array.from({ length: 100 }, () => generatePassword()));
    expect(values.size).toBe(100);
  });
});
