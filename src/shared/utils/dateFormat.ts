export type DateInput = Date | number | string | null | undefined;

export function formatDate(date: DateInput): string {
  if (!date) return 'Never';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(date);
  }
}

export function formatDateShort(date: DateInput): string {
  if (!date) return 'Never';
  try {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(date);
  }
}

function plural(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
}

export function getRelativeTime(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (Number.isNaN(diffMs)) return null;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return plural(diffDays, 'day');
    if (diffDays < 30) return plural(Math.floor(diffDays / 7), 'week');
    if (diffDays < 365) return plural(Math.floor(diffDays / 30), 'month');
    return plural(Math.floor(diffDays / 365), 'year');
  } catch {
    return null;
  }
}
