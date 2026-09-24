import { describe, it, expect, afterEach } from 'vitest';
import { motionAvailable, readDurToken } from './motion';

function setToken(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

afterEach(() => {
  document.documentElement.style.removeProperty('--dur-tell');
  document.documentElement.style.removeProperty('--dur-made-up');
  document.body.innerHTML = '';
});

describe('readDurToken', () => {
  it('reads a token declared in milliseconds', () => {
    setToken('--dur-tell', '250ms');
    expect(readDurToken('--dur-tell')).toBe(250);
  });

  it('converts a token declared in seconds', () => {
    setToken('--dur-tell', '1.5s');
    expect(readDurToken('--dur-tell')).toBe(1500);
  });

  it('returns 0 for a token nobody declared', () => {
    expect(readDurToken('--dur-made-up')).toBe(0);
  });

  it('returns 0 for a value that is not a duration', () => {
    setToken('--dur-tell', 'fast');
    expect(readDurToken('--dur-tell')).toBe(0);
  });

  it('returns 0 for a bare number with no unit', () => {
    setToken('--dur-tell', '300');
    expect(readDurToken('--dur-tell')).toBe(0);
  });
});

describe('motionAvailable', () => {
  it('is false in bare jsdom, where no motion scale is loaded', () => {
    expect(motionAvailable()).toBe(false);
  });

  it('is true once the motion scale is declared', () => {
    setToken('--dur-tell', '500ms');
    expect(motionAvailable()).toBe(true);
  });

  it('is false while anything in the document has opted out with data-motion="off"', () => {
    setToken('--dur-tell', '500ms');
    document.body.innerHTML = '<div data-motion="off"></div>';
    expect(motionAvailable()).toBe(false);
  });

  it('is true again once the opted-out element leaves the document', () => {
    setToken('--dur-tell', '500ms');
    document.body.innerHTML = '<div data-motion="off"></div>';
    expect(motionAvailable()).toBe(false);

    document.body.innerHTML = '';
    expect(motionAvailable()).toBe(true);
  });
});
