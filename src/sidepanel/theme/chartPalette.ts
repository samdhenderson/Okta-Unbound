export const INDIGO_RAMP: readonly string[] = [
  '#4356cf', // chart-only — one step darker than `primary`
  'var(--color-primary)', // #546be7
  '#7385ec', // chart-only ramp tint
  '#95a2f1', // chart-only ramp tint
  '#b7c0f6', // chart-only ramp tint
  '#d6dbfb', // chart-only ramp tint
];

export const CHART_NONE_COLOR = 'var(--color-neutral-300)';

export const CHART_OTHER_COLOR = '#e5e5e5'; // chart-only — a hair lighter than neutral-200

export const CHART_TAIL_HATCH =
  'repeating-linear-gradient(45deg, var(--color-neutral-300) 0 3px, var(--color-neutral-100) 3px 6px)';

export const MFA_ENROLLMENT_PAINT: Readonly<Record<string, string>> = {
  none: 'var(--color-warning)',
  single: 'var(--color-neutral-300)',
  multiple: 'var(--color-primary)',
};
