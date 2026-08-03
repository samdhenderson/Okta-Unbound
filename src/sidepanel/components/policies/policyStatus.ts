export function policyStatusClasses(status?: string): string {
  return status === 'ACTIVE'
    ? 'bg-success-light text-success-text border-success-light'
    : 'bg-neutral-50 text-neutral-600 border-neutral-200';
}

export function policyStatusLabel(status?: string): string {
  return status ?? 'UNKNOWN';
}
