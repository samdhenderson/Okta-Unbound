import React from 'react';
import { Button, IconButton } from '../shared';
import Icon from '../shared/Icon';

export interface ProfileEditControls {
  canEdit: boolean;
  isEditing: boolean;
  changeCount: number;
  hasInvalid: boolean;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

export interface UserProfilePaneHeaderProps {
  shown: number;
  total: number;
  ruleReadCount: number;
  onConfigure: () => void;
  edit?: ProfileEditControls;
}

function changeCountLabel(count: number): string {
  return count === 1 ? '1 change' : `${count} changes`;
}

const EditStatus: React.FC<{ changeCount: number; hasInvalid: boolean }> = ({
  changeCount,
  hasInvalid,
}) => {
  if (hasInvalid) {
    return <span className="text-xs text-danger-text">Fix the highlighted values</span>;
  }
  return (
    <span className="text-xs text-neutral-600">
      {changeCount === 0 ? 'No changes yet' : changeCountLabel(changeCount)}
    </span>
  );
};

const UserProfilePaneHeader: React.FC<UserProfilePaneHeaderProps> = ({
  shown,
  total,
  ruleReadCount,
  onConfigure,
  edit,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-(--sp-inline) p-(--sp-card)">
    <p className="min-w-0 flex-1 text-xs text-neutral-600 text-pretty">
      {shown} of {total} attributes shown &middot; {ruleReadCount} read by rules that grant access
    </p>

    <div className="flex shrink-0 items-center gap-(--sp-field)">
      {edit?.isEditing ? (
        <>
          <EditStatus changeCount={edit.changeCount} hasInvalid={edit.hasInvalid} />
          <Button size="sm" variant="secondary" onClick={edit.onCancelEdit}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={edit.onSave}
            disabled={edit.changeCount === 0 || edit.hasInvalid}
          >
            Save
          </Button>
        </>
      ) : (
        edit?.canEdit && (
          <Button size="sm" variant="secondary" onClick={edit.onBeginEdit}>
            Edit
          </Button>
        )
      )}

      <IconButton
        label="Configure attribute display"
        variant="subtle"
        size="md"
        onClick={onConfigure}
      >
        <Icon type="settings" size="sm" />
      </IconButton>
    </div>
  </div>
);

export default UserProfilePaneHeader;
