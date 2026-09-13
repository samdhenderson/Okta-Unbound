import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import GroupAccessSection from './GroupAccessSection';
import type { AppGrant, RoleGrant } from '../../../hooks/useGroupAccessGrants';
import type { PushGroupMapping } from '../../../../shared/types';

const apps: AppGrant[] = [
  {
    id: '0oaFAKEAPP1',
    label: 'Salesforce',
    status: 'ACTIVE',
    signOnMode: 'SAML_2_0',
    lastUpdated: new Date('2025-11-14T09:30:00Z'),
  },
  { id: '0oaFAKEAPP2', label: 'Slack', status: 'INACTIVE', signOnMode: 'BOOKMARK' },
];

const pushMappings: PushGroupMapping[] = [
  {
    mappingId: '0pgFAKE1',
    sourceUserGroupId: '00gFAKEgroup00001',
    appId: '0oaFAKEAPP1',
    appName: 'Salesforce',
    targetGroupName: 'eng-team',
    priority: 2,
  },
];

const roles: RoleGrant[] = [
  { id: 'raFAKEROLE1', label: 'Application Administrator' },
  { id: 'raFAKEROLE2', label: 'Help Desk Administrator' },
];

const meta = {
  title: 'Groups/GroupAccessSection',
  component: GroupAccessSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'What membership in this group buys: the apps it is assigned to, plus any admin roles it grants every member. Each role carries a "scope not shown" caveat badge, because the roles endpoint reports the role type without the resources it is scoped to.\n\n' +
          "A failed roles read (`rolesStatus: 'unavailable'`, commonly a 403) hides the subsection; a confirmed empty list (`'available'` with `roles: []`) states that no admin role is granted. Those two are never collapsed into one rendering.",
      },
    },
  },
  argTypes: {
    apps: { description: 'Apps this group is assigned to.' },
    pushMappings: {
      description:
        'Joined onto the app rows; `undefined` means the enrichment never ran, `[]` that the group is pushed nowhere.',
    },
    appsStatus: { description: "Status of the app-assignment read ('loading'/'done'/'error')." },
    appsError: { description: 'Error message when the app-assignment read failed.' },
    roles: { description: 'Admin roles granted to every member of this group.' },
    rolesStatus: {
      description:
        "'loading' while in flight, 'available' once the read succeeds, 'unavailable' when it failed.",
    },
  },
  args: {
    apps: [],
    appsStatus: 'loading',
    appsError: null,
    roles: [],
    rolesStatus: 'loading',
  },
} satisfies Meta<typeof GroupAccessSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const Empty: Story = {
  args: { appsStatus: 'done', apps: [], rolesStatus: 'available', roles: [] },
};

export const ErrorState: Story = {
  args: {
    appsStatus: 'error',
    appsError: 'App assignments could not be loaded.',
    rolesStatus: 'available',
    roles: [],
  },
};

export const AppsAndRoles: Story = {
  args: { appsStatus: 'done', apps, rolesStatus: 'available', roles },
};

export const RolesUnavailable: Story = {
  args: { appsStatus: 'done', apps, rolesStatus: 'unavailable', roles: [] },
};

export const WithPushMappings: Story = {
  args: { appsStatus: 'done', apps, rolesStatus: 'available', roles, pushMappings },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Pushed')).toBeVisible();
  },
};

export const PushNeverLoaded: Story = {
  args: { appsStatus: 'done', apps, rolesStatus: 'available', roles, pushMappings: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Pushed')).toBeNull();
  },
};
