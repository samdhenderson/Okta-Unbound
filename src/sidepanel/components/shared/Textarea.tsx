import React, { useId } from 'react';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  ariaLabel?: string;
  hint?: string;
  rows?: number;
  fullWidth?: boolean;
  className?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  label,
  ariaLabel,
  hint,
  rows = 4,
  fullWidth = true,
  className = '',
}) => {
  const fieldId = useId();
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const textareaClasses = `
    px-3 py-2 text-sm
    border rounded-md
    transition-all duration-(--dur-instant)
    focus:outline-2 focus:outline-offset-2 focus:outline-primary
    disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
    resize-vertical
    ${error ? 'border-danger focus:border-danger' : 'border-neutral-300 focus:border-primary'}
    ${fullWidth ? 'w-full' : ''}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={textareaClasses}
        style={{ fontFamily: 'var(--font-primary)' }}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
