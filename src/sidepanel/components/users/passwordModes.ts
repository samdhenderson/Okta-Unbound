import type { PasswordChangeMode } from '../../hooks/useUserLifecycleActions';

export const MODE_OPTIONS: ReadonlyArray<{ value: PasswordChangeMode; label: string }> = [
  { value: 'email-reset', label: 'Email them a reset link' },
  { value: 'set', label: 'Set a password now' },
  { value: 'set-and-expire', label: 'Set a one-time password' },
  { value: 'temp', label: 'Generate a temporary password' },
];

export const MODE_CONSEQUENCE: Record<PasswordChangeMode, string> = {
  'email-reset':
    'Okta emails a one-time link. Nothing changes until they use it, and it is no help if you cannot reach their mailbox.',
  set: 'Takes effect immediately and stays in force. Nobody is prompted to change it, and it cannot be undone.',
  'set-and-expire':
    'Takes effect immediately, and Okta makes them replace it at next sign-in. Use this when you are handing the value over.',
  temp: 'Okta generates the value and makes them replace it at next sign-in. It is shown to you once and is not recoverable afterwards.',
};

export const CONFIRM_LABEL: Record<PasswordChangeMode, string> = {
  'email-reset': 'Send Reset Email',
  set: 'Set Password',
  'set-and-expire': 'Set One-Time Password',
  temp: 'Generate Temporary Password',
};

export const NEEDS_VALUE: ReadonlySet<PasswordChangeMode> = new Set(['set', 'set-and-expire']);

export function canRunPasswordChange(mode: PasswordChangeMode, password: string): boolean {
  return !NEEDS_VALUE.has(mode) || password.length > 0;
}
