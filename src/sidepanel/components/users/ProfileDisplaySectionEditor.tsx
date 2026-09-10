import React, { useState } from 'react';
import { Badge, Button, Eyebrow, IconButton, Input } from '../shared';
import Icon from '../shared/Icon';
import ProfileDisplayGrip from './ProfileDisplayGrip';
import type { AttributeStep } from './profileDisplayOps';

export interface ProfileDisplaySectionEditorProps {
  sectionKey: string;
  name: string;
  fieldCount: number;
  isFixed?: boolean;
  isLifted?: boolean;
  isReorderDisabled?: boolean;
  gripDescribedBy?: string;
  onRename?: (name: string) => void;
  onDelete?: () => void;
  onGripPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onLift?: () => void;
  onStep?: (direction: AttributeStep) => void;
  onDrop?: () => void;
  onCancelLift?: () => void;
  children: React.ReactNode;
}

function fieldCountLabel(count: number): string {
  return count === 1 ? '1 field' : `${count} fields`;
}

function consequence(count: number): string {
  if (count === 0) return 'It holds no attributes.';
  return `Its ${count} ${count === 1 ? 'attribute returns' : 'attributes return'} to Uncategorized.`;
}

const ProfileDisplaySectionEditor: React.FC<ProfileDisplaySectionEditorProps> = ({
  sectionKey,
  name,
  fieldCount,
  isFixed = false,
  isLifted = false,
  isReorderDisabled = false,
  gripDescribedBy,
  onRename,
  onDelete,
  onGripPointerDown,
  onLift,
  onStep,
  onDrop,
  onCancelLift,
  children,
}) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const commitName = (): void => {
    const next = editing?.trim() ?? '';
    setEditing(null);
    if (next !== '' && next !== name) onRename?.(next);
  };

  return (
    <section
      data-section={sectionKey}
      aria-label={name}
      className={`border-t border-neutral-200 px-(--sp-card) py-(--sp-field) first:border-t-0 ${
        isLifted ? 'bg-primary-light' : ''
      }`}
    >
      <div className="mb-1 flex min-w-0 items-center gap-(--sp-inline)">
        {isFixed ? null : (
          <ProfileDisplayGrip
            label={name}
            lifted={isLifted}
            disabled={isReorderDisabled}
            describedBy={gripDescribedBy}
            onPointerDown={onGripPointerDown ?? (() => undefined)}
            onLift={onLift ?? (() => undefined)}
            onStep={onStep ?? (() => undefined)}
            onDrop={onDrop ?? (() => undefined)}
            onCancel={onCancelLift ?? (() => undefined)}
          />
        )}

        {isFixed ? (
          <Eyebrow as="h3" className="min-w-0 flex-1 truncate">
            {name}
          </Eyebrow>
        ) : editing === null ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setEditing(name)}
            ariaLabel={`Rename ${name}`}
            className="min-w-0 flex-1 justify-start truncate font-semibold tracking-wide text-neutral-500 uppercase"
          >
            {name}
          </Button>
        ) : (
          <div className="min-w-0 flex-1">
            <Input
              size="sm"
              autoFocus
              value={editing}
              onChange={setEditing}
              ariaLabel={`Rename ${name}`}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitName();
                } else if (event.key === 'Escape') {
                  event.preventDefault();
                  setEditing(null);
                }
              }}
              onBlur={commitName}
            />
          </div>
        )}

        <Badge variant="neutral">{fieldCountLabel(fieldCount)}</Badge>

        {isFixed ? null : (
          <IconButton
            size="sm"
            variant="danger"
            label={`Delete ${name}`}
            active={isConfirmingDelete}
            onClick={() => setIsConfirmingDelete((open) => !open)}
          >
            <Icon type="close" size="xs" />
          </IconButton>
        )}
      </div>

      {isConfirmingDelete && (
        <div className="mb-1 flex flex-wrap items-center gap-(--sp-inline) rounded-md bg-neutral-50 px-(--sp-row-x) py-(--sp-row-y)">
          <p className="min-w-0 flex-1 text-xs text-neutral-700">
            Delete {name}? {consequence(fieldCount)}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setIsConfirmingDelete(false)}>
            Keep
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setIsConfirmingDelete(false);
              onDelete?.();
            }}
          >
            Delete
          </Button>
        </div>
      )}

      <div>{children}</div>
    </section>
  );
};

export default ProfileDisplaySectionEditor;
