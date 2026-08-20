import React from 'react';
import Breadcrumbs from '../shared/Breadcrumbs';
import PageHeader from '../shared/PageHeader';
import { EntityIdentity, OpenInOktaLink } from '../shared';
import { userIdentity } from './userIdentity';
import { userDisplayName } from '../../../shared/utils/userDisplay';
import type { OktaUser } from '../../../shared/types';
import type { ViewStack } from '../../hooks/useViewStack';
import type { UsersViewEntry } from '../../hooks/useUsersTabState';

export interface UserRungHeaderProps {
  nav: ViewStack<UsersViewEntry>;
  isDetailOpen: boolean;
  isCompareOpen: boolean;
  selectedUser: OktaUser | null;
  membershipCount: number;
  isLoadingMemberships: boolean;
  appCount?: number;
  oktaOrigin: string | null;
  isActive: boolean;
}

const UserRungHeader: React.FC<UserRungHeaderProps> = ({
  nav,
  isDetailOpen,
  isCompareOpen,
  selectedUser,
  membershipCount,
  isLoadingMemberships,
  appCount,
  oktaOrigin,
  isActive,
}) => {
  const currentEntry = nav.currentEntry;
  const isLoadedUserThisRung = Boolean(currentEntry && selectedUser?.id === currentEntry.userId);
  const currentName =
    isLoadedUserThisRung && selectedUser ? userDisplayName(selectedUser) : currentEntry?.userName;

  const detailUser =
    isDetailOpen && !isCompareOpen && isLoadedUserThisRung
      ? (selectedUser ?? undefined)
      : undefined;
  const identity = detailUser
    ? userIdentity(detailUser, {
        groupCount: isLoadingMemberships ? undefined : membershipCount,
        appCount,
      })
    : undefined;

  return (
    <PageHeader
      title={
        isCompareOpen ? 'Compare users' : isDetailOpen ? (currentName ?? 'User') : 'User Search'
      }
      subtitle={
        isCompareOpen
          ? `${currentName} vs. another user`
          : isDetailOpen
            ? undefined
            : 'Search users and analyze their group memberships'
      }
      onBack={nav.isRoot ? undefined : nav.pop}
      backLabel={isCompareOpen ? 'Back to user' : 'Back to search'}
      breadcrumbs={nav.isRoot ? undefined : <Breadcrumbs items={nav.trail} />}
      sticky={isActive}
      identityKey={identity?.key}
      identity={identity ? <EntityIdentity rows={identity.rows} /> : undefined}
      badge={
        identity
          ? identity.badge
          : selectedUser
            ? { text: `${membershipCount} Groups`, variant: 'primary' }
            : undefined
      }
      actions={
        identity?.link && (
          <OpenInOktaLink
            oktaOrigin={oktaOrigin}
            entityType={identity.link.entityType}
            entityId={identity.link.entityId}
          />
        )
      }
    />
  );
};

export default UserRungHeader;
