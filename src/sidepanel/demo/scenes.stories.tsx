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

import { DEMO_HERO_GROUP_ID, demoGroupsById } from './snapshot';
import { DEMO_COMPARISON_PAIR, demoUsersById } from './users';
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
  demoGetUserRaw,
  demoMakeApiRequest,
  demoSearchGroups,
  demoSearchUsers,
} from './api';
import { demoDelay, installDemoControls, seedDemoSnapshot, setDemoLatency } from './control';

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
  getUserApps: slow(demoGetUserApps),
  getUserLastLogin: slow(demoGetUserLastLogin),
  getUserGroupMemberships: slow(demoGetUserGroupMemberships),
  batchGetUserDetails: slow(demoBatchGetUserDetails),
  captureRuleImpact: slow(demoCaptureRuleImpact),
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

export const GroupDrilldown: Story = {
  beforeEach: async () => {
    await stage({
      tab: 'groups',
      context: {
        getGroupInfo: {
          groupId: DEMO_HERO_GROUP_ID,
          groupName: demoGroupsById.get(DEMO_HERO_GROUP_ID)?.profile?.name ?? 'Engineering - All',
        },
      },
    });
  },
};

export const RuleImpact: Story = {
  beforeEach: async () => {
    await stage({ tab: 'rules', latency: 700 });
  },
};

export const BulkOperation: Story = {
  beforeEach: async () => {
    await stage({ tab: 'users', latency: 300 });
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

export const ActionBarShowcase: Story = {
  beforeEach: async () => {
    await stage({
      tab: 'groups',
      latency: 200,
      context: {
        getGroupInfo: {
          groupId: DEMO_HERO_GROUP_ID,
          groupName: demoGroupsById.get(DEMO_HERO_GROUP_ID)?.profile?.name ?? 'Engineering - All',
        },
      },
    });
  },
};
