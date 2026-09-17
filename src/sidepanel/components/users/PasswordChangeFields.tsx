import React from 'react';
import { Button, Eyebrow, IconButton, Input, Select } from '../shared';
import Icon from '../shared/Icon';
import type { PasswordChangeMode } from '../../hooks/useUserLifecycleActions';
import { generatePassword } from '../../../shared/utils/password';
import { MODE_CONSEQUENCE, MODE_OPTIONS, NEEDS_VALUE } from './passwordModes';

export interface PasswordChangeFieldsProps {
  email: string;
  mode: PasswordChangeMode;
  onModeChange: (mode: PasswordChangeMode) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  disabled?: boolean;
}

const PasswordChangeFields: React.FC<PasswordChangeFieldsProps> = ({
  email,
  mode,
  onModeChange,
  password,
  onPasswordChange,
  disabled = false,
}) => {
  const [revealed, setRevealed] = React.useState(false);

  const handleModeChange = (next: string) => {
    setRevealed(false);
    onPasswordChange('');
    onModeChange(next as PasswordChangeMode);
  };

  return (
    <div className="space-y-(--sp-field)">
      <Select
        label="What should happen"
        value={mode}
        onChange={handleModeChange}
        options={MODE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        disabled={disabled}
      />

      <p className="text-sm text-neutral-700">{MODE_CONSEQUENCE[mode]}</p>

      {mode === 'email-reset' && (
        <p className="text-sm text-neutral-700">
          The link goes to <strong className="text-neutral-900">{email}</strong>.
        </p>
      )}

      {NEEDS_VALUE.has(mode) && (
        <div className="space-y-(--sp-field)">
          <div className="flex items-center justify-between gap-2">
            <Eyebrow>New password</Eyebrow>
            <Button
              variant="secondary"
              size="xs"
              icon="refresh"
              disabled={disabled}
              onClick={() => {
                setRevealed(true);
                onPasswordChange(generatePassword());
              }}
            >
              Generate
            </Button>
          </div>

          <Input
            type={revealed ? 'text' : 'password'}
            value={password}
            onChange={onPasswordChange}
            ariaLabel="New password"
            placeholder="Type or generate a value"
            disabled={disabled}
            trailingInteractive
            trailing={
              <IconButton
                label={revealed ? 'Hide password' : 'Show password'}
                size="sm"
                variant="ghost"
                active={revealed}
                onClick={() => setRevealed((shown) => !shown)}
              >
                <Icon type={revealed ? 'eye-off' : 'eye'} size="sm" />
              </IconButton>
            }
          />

          <p className="text-xs text-neutral-500">
            Your org&rsquo;s password policy still applies. If Okta refuses the value, it says which
            rule it broke.
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordChangeFields;
