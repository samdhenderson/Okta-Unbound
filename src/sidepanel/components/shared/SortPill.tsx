import FilterPill from './FilterPill';

interface SortPillProps<T extends string> {
  field: T;
  label: string;
  activeField: T;
  descending: boolean;
  onToggle: (field: T) => void;
}

function SortPill<T extends string>({
  field,
  label,
  activeField,
  descending,
  onToggle,
}: SortPillProps<T>) {
  const active = activeField === field;
  return (
    <FilterPill active={active} onClick={() => onToggle(field)}>
      <span className="flex items-center gap-1">
        {label}
        {active && (
          <svg
            className={`w-3 h-3 transition-transform duration-(--dur-instant) ${descending ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </span>
    </FilterPill>
  );
}

export default SortPill;
