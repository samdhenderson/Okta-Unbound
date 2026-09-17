export function paletteRowClassName(isCurrent: boolean): string {
  return `press press-subtle w-full flex items-center gap-(--sp-inline) px-(--sp-row-x) py-(--sp-row-y) rounded-md text-left text-sm
      transition-colors duration-(--dur-instant)
      focus:outline-2 focus:outline-offset-2 focus:outline-primary
      ${isCurrent ? 'bg-primary-light text-primary-text font-semibold' : 'text-neutral-900 hover:bg-neutral-50'}`;
}
