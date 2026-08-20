import React from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import UserComparisonView from './UserComparisonView';
import { useUserComparison } from '../../hooks/useUserComparison';
import type { OktaUser, GroupMembership } from '../../../shared/types';

interface UserComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextUser: OktaUser;
  contextGroups: GroupMembership[];
  oktaOrigin?: string | null;
  targetTabId: number;
  onGroupsChanged: () => void;
  onContextUserUpdated?: (user: OktaUser) => void;
}

const UserComparisonModal: React.FC<UserComparisonModalProps> = ({
  isOpen,
  onClose,
  contextUser,
  contextGroups,
  oktaOrigin,
  targetTabId,
  onGroupsChanged,
  onContextUserUpdated,
}) => {
  const comparison = useUserComparison({
    isActive: isOpen,
    contextUser,
    contextGroups,
    targetTabId,
    oktaOrigin,
    onGroupsChanged,
    onContextUserUpdated,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={comparison.comparedUser ? 'Side-by-side comparison' : 'Compare with another user'}
      size="xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <UserComparisonView
        contextUser={contextUser}
        comparison={comparison}
        oktaOrigin={oktaOrigin}
      />
    </Modal>
  );
};

export default UserComparisonModal;
