import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputComboboxProps {
  expanded: boolean;
  listboxId: string;
  activeOptionId?: string;
  autocomplete?: 'list' | 'none';
}

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  combobox?: InputComboboxProps;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  disabled?: boolean;
  error?: string;
  label?: string;
  ariaLabel?: string;
  hint?: string;
  fullWidth?: boolean;
  size?: InputSize;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  trailingInteractive?: boolean;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSelect?: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-xs', // 30px
  md: 'px-3 py-2 text-sm', // 38px
  lg: 'px-4 py-3 text-sm', // 46px
};

const leadingInsetClasses: Record<InputSize, string> = {
  sm: 'left-3',
  md: 'left-3',
  lg: 'left-4',
};

const trailingInsetClasses: Record<InputSize, string> = {
  sm: 'right-3',
  md: 'right-3',
  lg: 'right-4',
};

const leadingPaddingClasses: Record<InputSize, string> = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
};

const trailingPaddingClasses: Record<InputSize, string> = {
  sm: 'pr-10',
  md: 'pr-11',
  lg: 'pr-12',
};

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  label,
  ariaLabel,
  hint,
  fullWidth = true,
  size = 'md',
  icon,
  trailing,
  trailingInteractive = false,
  className = '',
  autoFocus = false,
  onKeyDown,
  onBlur,
  onFocus,
  onSelect,
  combobox,
  inputRef,
}) => {
  const generatedId = React.useId();
  const inputId = `${generatedId}-input`;
  const hintId = `${generatedId}-hint`;
  const errorId = `${generatedId}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const inputClasses = `
    ${sizeClasses[size]}
    border rounded-md bg-white
    transition-all duration-(--dur-instant)
    focus:outline-2 focus:outline-offset-2 focus:outline-primary
    disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed
    ${error ? 'border-danger focus:border-danger' : 'border-neutral-300 focus:border-primary'}
    ${icon ? leadingPaddingClasses[size] : ''}
    ${trailing ? trailingPaddingClasses[size] : ''}
    ${fullWidth ? 'w-full' : ''}
    ${type === 'search' && trailingInteractive ? '[&::-webkit-search-cancel-button]:appearance-none' : ''}
  `
    .trim()
    .replace(/\s+/g, ' ');

  const trailingClasses = `
    absolute ${trailingInsetClasses[size]} top-1/2 -translate-y-1/2
    flex items-center text-neutral-400
    ${trailingInteractive ? '' : 'pointer-events-none'}
  `
    .trim()
    .replace(/\s+/g, ' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute ${leadingInsetClasses[size]} top-1/2 -translate-y-1/2 text-neutral-400`}
          >
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
          onSelect={onSelect}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(combobox
            ? {
                role: 'combobox' as const,
                'aria-expanded': combobox.expanded,
                'aria-controls': combobox.listboxId,
                'aria-activedescendant': combobox.activeOptionId,
                'aria-autocomplete': combobox.autocomplete ?? ('list' as const),
                autoComplete: 'off',
              }
            : {})}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={inputClasses}
          style={{ fontFamily: 'var(--font-primary)' }}
        />
        {trailing && <div className={trailingClasses}>{trailing}</div>}
      </div>
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

export default Input;
