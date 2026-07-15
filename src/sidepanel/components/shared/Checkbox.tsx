import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const inputClasses =
  'w-4 h-4 shrink-0 rounded border-neutral-300 text-primary accent-primary ' +
  'focus:outline-2 focus:outline-offset-2 focus:outline-primary ' +
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const input = (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.checked)}
      className={`${inputClasses}${description ? ' mt-0.5' : ''}${label ? '' : ` ${className}`}`.trim()}
    />
  );

  if (label === undefined) return input;

  return (
    <label
      className={`flex gap-2 ${description ? 'items-start' : 'items-center'} ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${className}`
        .trim()
        .replace(/\s+/g, ' ')}
    >
      {input}
      <span>
        <span className="text-sm text-neutral-700">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-neutral-500">{description}</span>
        )}
      </span>
    </label>
  );
};

export default Checkbox;
