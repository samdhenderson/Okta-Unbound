import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import GroupPushSection from './GroupPushSection';
import { NavigationProvider } from '../../../contexts/NavigationContext';
import type { PushGroupMapping } from '../../../../shared/types';

const navigationHandlers = { rule: fn(), group: fn(), user: fn(), app: fn(), policy: fn() };

const namedMapping: PushGroupMapping = {
  mappingId: '0pgFAKE1',
  sourceUserGroupId: '00gFAKEGROUP0001',
  appId: '0oaFAKEAPP000001',
  appName: 'Salesforce',
  targetGroupName: 'eng-team',
  priority: 2,
};

const unnamedMapping: PushGroupMapping = {
  mappingId: '0pgFAKE2',
  sourceUserGroupId: '00gFAKEGROUP0001',
  appId: '0oaFAKEAPP000002',
  targetGroupName: 'eng-team-mirror',
};

const meta = {
  title: 'Groups/GroupPushSection',
  component: GroupPushSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Apps this group's membership is pushed out to, and the target group each push " +
          'writes into. No activation status: the apps-groups endpoint returns none, so a pill ' +
          'here would be an inference dressed as an Okta fact — `priority` is the real field ' +
          'and is labelled as one.\n\n' +
          'Unknown is not zero: an empty array (pushed nowhere) and `undefined` (the enrichment ' +
          'never ran) are different sentences. A target is either named through an `EntityLink` ' +
          'or says "App name not loaded" beside its raw id.',
      },
    },
  },
  decorators: [
    (Story) => (
      <NavigationProvider handlers={navigationHandlers}>
        <div className="max-w-[380px]">
          <Story />
        </div>
      </NavigationProvider>
    ),
  ],
  argTypes: {
    mappings: {
      description:
        "The group's push mappings. `undefined` means the enrichment did not run for this group and is rendered as unknown, not as “none”.",
    },
  },
  args: {
    mappings: [namedMapping],
  },
} satisfies Meta<typeof GroupPushSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Open app Salesforce' })).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Copy application id ${namedMapping.appId}` }),
    ).toBeInTheDocument();
  },
};

export const UnnamedApp: Story = {
  args: { mappings: [unnamedMapping] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('App name not loaded')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: `Copy application id ${unnamedMapping.appId}` }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: `App name not loaded — open app ${unnamedMapping.appId}`,
      }),
    ).toBeInTheDocument();
  },
};

export const NamedAndUnnamed: Story = {
  args: { mappings: [namedMapping, unnamedMapping] },
};

export const Empty: Story = {
  args: { mappings: [] },
};

export const NotLoaded: Story = {
  args: { mappings: undefined },
};
