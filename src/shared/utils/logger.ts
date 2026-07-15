/* eslint-disable no-console -- this module is the one sanctioned console wrapper */

type LogArgs = unknown[];

const isDev = (() => {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
})();

export interface Logger {
  debug: (...args: LogArgs) => void;
  info: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
}

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`;
  return {
    debug: (...args) => {
      if (isDev) console.debug(prefix, ...args);
    },
    info: (...args) => {
      if (isDev) console.info(prefix, ...args);
    },
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
  };
}

export const logger = createLogger('App');
