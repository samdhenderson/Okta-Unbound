import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ReportsCard from './ReportsCard';
import { buildReport, REPORT_PREVIEW_LIMIT } from './homeReports';
import type { FigureSource } from './orgFigures';
import { APP_ACCESS_CAVEAT, CLEANUP_CAVEAT, type GroupFinding } from '../groups/ruleOrphans';
import type { EntityChoice } from './EntityChooser';

const NOW = Date.now();

const read = (over: Partial<FigureSource> = {}): FigureSource => ({
  isReading: false,
  complete: true,
  lastFullWalkAt: NOW - 20 * 60 * 1000,
  count: 214,
  error: null,
  ...over,
});

const CHOICES: EntityChoice[] = [
  { id: '00gFAKE01', name: 'AWS Sandbox 2019', detail: '0 members' },
  { id: '00gFAKE11', name: 'Salesforce Users', detail: '412 members' },
  { id: '00gFAKE21', name: 'Engineering – All', detail: '1,204 members' },
];

const CLEANUP: GroupFinding[] = [
  {
    id: '00gFAKE01',
    name: 'AWS Sandbox 2019',
    detail: 'No members · no rule fills it · no app assigned',
  },
  {
    id: '00gFAKE02',
    name: 'Contractors – Q3 pilot',
    detail: 'No members · no rule fills it · no app assigned',
  },
  {
    id: '00gFAKE03',
    name: 'Marketing Interns',
    detail: 'No members · no rule fills it · no app assigned',
  },
];

const ACCESS: GroupFinding[] = [
  { id: '00gFAKE11', name: 'Salesforce Users', detail: '412 members · Salesforce' },
  { id: '00gFAKE12', name: 'Engineering Tools', detail: '88 members · Slack, GitHub' },
];

const reports = (
  groups: FigureSource,
  rules: FigureSource,
  apps: FigureSource,
  appGroups: FigureSource,
  found: { cleanup: GroupFinding[]; access: GroupFinding[] } = { cleanup: CLEANUP, access: ACCESS },
) => {
  const groupsNamed = { source: groups, noun: 'groups' };
  const rulesNamed = { source: rules, noun: 'group rules' };
  const appsNamed = { source: apps, noun: 'applications' };
  const appGroupsNamed = { source: appGroups, noun: 'app group assignments' };
  return [
    buildReport({
      key: 'group-cleanup',
      label: 'Empty groups nothing fills',
      counted: groupsNamed,
      gates: [rulesNamed, appGroupsNamed],
      findings: found.cleanup,
      caveat: CLEANUP_CAVEAT,
    }),
    buildReport({
      key: 'unmaintained-app-access',
      label: 'App access no rule maintains',
      counted: groupsNamed,
      floors: [appGroupsNamed, appsNamed],
      gates: [rulesNamed],
      findings: found.access,
      caveat: APP_ACCESS_CAVEAT,
    }),
  ];
};

const meta = {
  title: 'Home/ReportsCard',
  component: ReportsCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
    docs: {
      description: {
        component:
          'The questions on Home whose answer is a list of names rather than a number. Same row ' +
          'idiom as the org card above it — a number column, a sentence, one bordered surface ' +
          'with hairline separators — because they are two halves of the same reading.\n\n' +
          'The difference is what pressing a row does. A finding sends you to a filtered list; a ' +
          'report **opens in place**, because the dozen or so groups it names are the whole ' +
          'answer. Both reports are joins over rows the org snapshot already holds, so opening ' +
          'one costs nothing.\n\n' +
          'A report that cannot state a number **names nobody**. The joins ran over whatever rows ' +
          'happened to be on disk, and publishing those beside an em dash would present a ' +
          'half-read collection’s leftovers as the answer — ADR-0040 §7’s defect, spelled with ' +
          'names instead of a count. A report with *zero* findings is the opposite case and reads ' +
          'as one: a real answer, with nothing to open.\n\n' +
          'The caveat is not fine print. An admin reading "empty groups nothing fills" is one step ' +
          'from deleting them, and this extension cannot see Okta Workflows, SCIM, an IdP sync, or ' +
          'a direct API write. So the sentence saying so sits inside the opened row, above the ' +
          'names, every time.',
      },
    },
  },
  argTypes: {
    reports: { description: 'The report rows, in display order.' },
    onOpenGroup: { description: 'Open one of the named groups on the Groups tab.' },
    groupChoices: { description: "The MFA launcher's chooser rows, from the org snapshot." },
    groupChoicesStatus: { description: 'Read state of the collection behind those choices.' },
    onScanGroupMfa: { description: "Open a group's Insights pane with the scan armed, un-run." },
  },
  args: {
    onOpenGroup: fn(),
    groupChoices: CHOICES,
    groupChoicesStatus: 'ok' as const,
    onScanGroupMfa: fn(),
    reports: reports(read(), read({ count: 61 }), read({ count: 38 }), read({ count: 90 })),
  },
} satisfies Meta<typeof ReportsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Warm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { expanded: false, name: /Empty groups/ }),
    ).toBeInTheDocument();
    await expect(canvas.queryByText(/not a delete list/)).not.toBeInTheDocument();
    await expect(canvas.queryByText('AWS Sandbox 2019')).not.toBeInTheDocument();
  },
};

export const Opened: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Empty groups/ }));
    await expect(canvas.getByText(/not a delete list/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { description: 'AWS Sandbox 2019' }));
    await expect(args.onOpenGroup).toHaveBeenCalledWith('00gFAKE01');
  },
};

export const Capped: Story = {
  args: {
    reports: reports(read(), read({ count: 61 }), read({ count: 38 }), read({ count: 90 }), {
      cleanup: Array.from({ length: REPORT_PREVIEW_LIMIT + 112 }, (_, i) => ({
        id: `00gFAKE${i}`,
        name: `Retired project ${i}`,
        detail: 'No members · no rule fills it · no app assigned',
      })),
      access: ACCESS,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Empty groups/ }));
    await expect(canvas.getByText(/Showing the first 25 of 137\./)).toBeInTheDocument();
  },
};

export const NothingFound: Story = {
  args: {
    reports: reports(read(), read({ count: 61 }), read({ count: 38 }), read({ count: 90 }), {
      cleanup: [],
      access: [],
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Empty groups/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /App access/ })).not.toBeInTheDocument();
    await expect(canvas.getAllByText('0')).toHaveLength(2);
  },
};

export const Reading: Story = {
  args: { reports: reports(read({ isReading: true }), read(), read(), read()) },
};

export const GateNeverRead: Story = {
  args: {
    reports: reports(
      read(),
      read({ complete: false, lastFullWalkAt: null, count: 0 }),
      read({ count: 38 }),
      read({ count: 90 }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /Empty groups/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: /App access/ })).not.toBeInTheDocument();
    await expect(canvas.queryByText('AWS Sandbox 2019')).not.toBeInTheDocument();
    await expect(canvas.getAllByText('Needs group rules, which have not been read.')).toHaveLength(
      2,
    );
  },
};

export const FloorFellShort: Story = {
  args: {
    reports: reports(
      read(),
      read({ count: 61 }),
      read({ count: 38 }),
      read({ count: 12, complete: false }),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('At least — the last read of app group assignments did not finish.'),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /App access/ }));
    await expect(canvas.getByText('Salesforce Users')).toBeInTheDocument();
  },
};

export const MfaLauncherOpened: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /MFA coverage/ }));
    await expect(canvas.getByText(/not free/)).toBeInTheDocument();
    await userEvent.type(canvas.getByRole('searchbox', { name: 'Filter groups' }), 'sales');
    await expect(canvas.queryByText('AWS Sandbox 2019')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { description: 'Salesforce Users' }));
    await expect(args.onScanGroupMfa).toHaveBeenCalledWith('00gFAKE11');
  },
};

export const MfaLauncherUnavailable: Story = {
  args: { groupChoices: [], groupChoicesStatus: 'unavailable' as const },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', { name: /MFA coverage/ })).not.toBeInTheDocument();
    await expect(canvas.getByText(/Groups have not been read yet/)).toBeInTheDocument();
  },
};
