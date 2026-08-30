import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import App from '../App';
import { useProgress } from '../contexts/ProgressContext';
import { makeUseOktaApiValue, useOktaApi } from '../../../.storybook/mocks/useOktaApi.mock';
import {
  emitRuntimeMessage,
  resetPageContext,
  resetSchedulerState,
  resetStorageSeed,
  resetSyncSnapshotResponder,
  setPageContext,
  setStorageSeed,
} from '../../../.storybook/mocks/chrome';

import { DEMO_HERO_GROUP_ID, currentGroupsById } from './snapshot';
import { DEMO_COMPARISON_PAIR, demoUsersById } from './users';
import { DEMO_ORIGIN, fakeId } from './org';
import { GROUP } from './memberships';
import { WORKING_SET_STORAGE_KEY, type WorkingSetRef } from '../../shared/storage/workingSetStore';
import {
  demoBatchGetUserDetails,
  demoCaptureRuleImpact,
  demoGetAllGroupMembers,
  demoGetAllGroups,
  demoGetGroupById,
  demoGetGroupMemberCount,
  demoGetGroupRulesForGroup,
  demoGetUserApps,
  demoGetUserById,
  demoGetUserGroupMemberships,
  demoGetUserLastLogin,
  demoGetUserProfileSchema,
  demoGetUserRaw,
  demoMakeApiRequest,
  demoSearchGroups,
  demoScanGroupMfa,
  demoSearchUsers,
  demoUpdateUserProfile,
} from './api';
import { demoDelay, installDemoControls, seedDemoSnapshot, setDemoLatency } from './control';
import { resetDemoWrites } from './state';

const SELECTED_TAB_KEY = 'okta_unbound_selected_tab';

function slow<A extends unknown[], R>(impl: (...args: A) => Promise<R>) {
  return fn(async (...args: A): Promise<R> => {
    await demoDelay();
    return impl(...args);
  });
}

const demoApiValue = makeUseOktaApiValue({
  makeApiRequest: slow(demoMakeApiRequest),
  getAllGroupMembers: slow(demoGetAllGroupMembers),
  getGroupById: slow(demoGetGroupById),
  getGroupMemberCount: slow(demoGetGroupMemberCount),
  getGroupRulesForGroup: slow(demoGetGroupRulesForGroup),
  getAllGroups: slow(demoGetAllGroups),
  searchGroups: slow(demoSearchGroups),
  searchUsers: slow(demoSearchUsers),
  getUserById: slow(demoGetUserById),
  getUserRaw: slow(demoGetUserRaw),
  getUserProfileSchema: slow(demoGetUserProfileSchema),
  getUserApps: slow(demoGetUserApps),
  getUserLastLogin: slow(demoGetUserLastLogin),
  getUserGroupMemberships: slow(demoGetUserGroupMemberships),
  batchGetUserDetails: slow(demoBatchGetUserDetails),
  captureRuleImpact: slow(demoCaptureRuleImpact),
  updateUserProfile: slow(demoUpdateUserProfile),
  scanGroupMfa: fn(demoScanGroupMfa),
});

const DemoBridge: React.FC = () => {
  const { startProgress, updateBatch, completeProgress } = useProgress();

  useEffect(() => {
    const controls = installDemoControls(() => emitRuntimeMessage({ action: 'snapshotUpdated' }));
    controls.progress = {
      start: (operationName, message, total) => startProgress(operationName, message, total, true),
      update: (completed, total, message) =>
        updateBatch({ total, completed, active: 0, failed: 0 }, message),
      complete: completeProgress,
    };
  }, [startProgress, updateBatch, completeProgress]);

  return null;
};

async function stage(options: {
  tab: string;
  latency?: number;
  context?: Record<string, unknown>;
}): Promise<void> {
  resetSyncSnapshotResponder();
  resetSchedulerState();
  resetDemoWrites();
  resetPageContext();
  resetStorageSeed();

  useOktaApi.mockReturnValue(demoApiValue);
  setDemoLatency(options.latency ?? 450);
  setStorageSeed({ [SELECTED_TAB_KEY]: options.tab });
  if (options.context) setPageContext(options.context);

  await seedDemoSnapshot();
}

const meta = {
  title: 'Demo/Scenes',
  component: App,
  tags: ['!test'],
  parameters: {
    layout: 'fullscreen',
    motion: 'on',
    a11y: { disable: true },
    actions: { disable: true },
  },
  render: () => (
    <>
      <DemoBridge />
      <App />
    </>
  ),
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

const heroGroupContext = {
  getGroupInfo: {
    groupId: DEMO_HERO_GROUP_ID,
    groupName: currentGroupsById().get(DEMO_HERO_GROUP_ID)?.profile?.name ?? 'Engineering - All',
  },
};

export const GroupDrilldown: Story = {
  beforeEach: async () => {
    await stage({ tab: 'groups', context: heroGroupContext });
  },
};

export const RuleImpact: Story = {
  beforeEach: async () => {
    await stage({ tab: 'rules', latency: 700 });
  },
};

export const MfaCoverage: Story = {
  beforeEach: async () => {
    await stage({ tab: 'groups', latency: 300, context: heroGroupContext });
  },
};

export const GroupComposition: Story = {
  beforeEach: async () => {
    await stage({ tab: 'groups', latency: 300, context: heroGroupContext });
  },
};

export const UserComparison: Story = {
  beforeEach: async () => {
    const left = demoUsersById.get(DEMO_COMPARISON_PAIR.left);
    await stage({
      tab: 'users',
      latency: 350,
      context: {
        getUserInfo: left
          ? {
              userId: left.id,
              userName: `${left.profile.firstName} ${left.profile.lastName}`,
              userEmail: left.profile.email,
              userStatus: left.status,
            }
          : null,
      },
    });
  },
};

export const AccessCauses: Story = {
  beforeEach: async () => {
    const left = demoUsersById.get(DEMO_COMPARISON_PAIR.left);
    await stage({
      tab: 'users',
      latency: 350,
      context: {
        getUserInfo: left
          ? {
              userId: left.id,
              userName: `${left.profile.firstName} ${left.profile.lastName}`,
              userEmail: left.profile.email,
              userStatus: left.status,
            }
          : null,
      },
    });
  },
};

export const ActionBarShowcase: Story = {
  beforeEach: async () => {
    await stage({ tab: 'groups', latency: 200, context: heroGroupContext });
  },
};

function homeWorkingSetSeed(): {
  version: 1;
  origins: Record<string, { pinned: WorkingSetRef[]; recent: WorkingSetRef[] }>;
} {
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  const engineeringGroup = currentGroupsById().get(DEMO_HERO_GROUP_ID);
  const salesId = fakeId('00g', GROUP.sales);
  const salesGroup = currentGroupsById().get(salesId);
  const left = demoUsersById.get(DEMO_COMPARISON_PAIR.left);
  const right = demoUsersById.get(DEMO_COMPARISON_PAIR.right);

  const pinned: WorkingSetRef[] = [
    {
      kind: 'group',
      id: DEMO_HERO_GROUP_ID,
      name: engineeringGroup?.profile?.name ?? 'Engineering - All',
      lastPane: 'Attributes',
      lastSeenAt: now - 5 * hour,
    },
    {
      kind: 'user',
      id: DEMO_COMPARISON_PAIR.left,
      name: left ? `${left.profile.firstName} ${left.profile.lastName}` : 'Amara Okonkwo',
      lastPane: 'Groups',
      lastSeenAt: now - 2 * day,
    },
  ];

  const recent: WorkingSetRef[] = [
    {
      kind: 'user',
      id: DEMO_COMPARISON_PAIR.right,
      name: right ? `${right.profile.firstName} ${right.profile.lastName}` : 'Tomas Lindqvist',
      lastPane: 'Apps',
      lastSeenAt: now - 30 * 60 * 1000,
    },
    {
      kind: 'group',
      id: salesId,
      name: salesGroup?.profile?.name ?? 'Sales - All',
      lastSeenAt: now - 3 * day,
    },
  ];

  return { version: 1, origins: { [DEMO_ORIGIN]: { pinned, recent } } };
}

export const Home: Story = {
  beforeEach: async () => {
    await stage({ tab: 'home', latency: 300 });
    setStorageSeed({ [WORKING_SET_STORAGE_KEY]: homeWorkingSetSeed() });
  },
};
