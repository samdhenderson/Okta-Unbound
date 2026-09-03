import type { OktaGroupRule } from '../../shared/types';
import type { OktaAppGroupAssignment, OktaAppListItem } from '../../shared/schemas/okta';
import type { RawOktaGroup } from '../components/groups/groupSummary';
import { fakeId, isoDaysAgo } from './org';
import { GROUP, demoGroupMembers } from './memberships';
import { demoRevision } from './state';

function group(
  n: number,
  name: string,
  description: string,
  options: {
    type?: RawOktaGroup['type'];
    source?: { id: string; name: string };
    membershipDaysAgo?: number;
  } = {},
): RawOktaGroup {
  return {
    id: fakeId('00g', n),
    type: options.type ?? 'OKTA_GROUP',
    profile: { name, description },
    ...(options.source
      ? { source: options.source, _links: { apps: { href: `/api/v1/apps/${options.source.id}` } } }
      : {}),
    created: isoDaysAgo(600 + n),
    lastUpdated: isoDaysAgo(n * 3 + 2),
    lastMembershipUpdated: isoDaysAgo(options.membershipDaysAgo ?? n * 3 + 5),
  };
}

const groupTemplates: readonly RawOktaGroup[] = [
  group(GROUP.everyone, 'Everyone', 'All users in your organization', { type: 'BUILT_IN' }),
  group(GROUP.engineering, 'Engineering - All', 'Every engineer, rule-assigned by department'),
  group(GROUP.sales, 'Sales - All', 'Rule-assigned by department'),
  group(GROUP.customerSuccess, 'Customer Success - All', 'Rule-assigned by department'),
  group(GROUP.marketing, 'Marketing - All', 'Rule-assigned by department'),
  group(GROUP.finance, 'Finance - All', 'Rule-assigned by department'),
  group(GROUP.peopleOps, 'People Ops - All', 'Rule-assigned by department'),
  group(GROUP.it, 'IT - All', 'Rule-assigned by department'),
  group(GROUP.security, 'Security - All', 'Rule-assigned by department'),
  group(GROUP.data, 'Data - All', 'Rule-assigned by department'),
  group(GROUP.legal, 'Legal - All', 'Rule-assigned by department'),
  group(
    GROUP.awsProdAdmin,
    'AWS Prod - Admin',
    'Production AWS console access. Reviewed quarterly.',
    { membershipDaysAgo: 1180 },
  ),
  group(GROUP.awsProdReadOnly, 'AWS Prod - ReadOnly', 'Read-only production AWS access'),
  group(GROUP.vpnUsers, 'VPN Users', 'Rule-assigned to every active employee'),
  group(GROUP.contractorsEmea, 'Contractors - EMEA', 'Rule-assigned: contractors in EMEA offices'),
  group(GROUP.contractorsAmer, 'Contractors - AMER', 'Rule-assigned: contractors in US/CA offices'),
  group(GROUP.oktaAdministrators, 'Okta Administrators', 'Super admin and org admin holders'),
  group(GROUP.onCallEngineering, 'On-Call - Engineering', 'Paged rotation. Managed by hand.'),
  group(GROUP.releaseManagers, 'Release Managers', 'Can promote a build to production'),
  group(GROUP.incidentResponse, 'Security - Incident Response', 'IR pager rotation'),
  group(GROUP.interns, 'Interns 2026', 'Summer cohort. Expires at the end of the season.', {
    membershipDaysAgo: 430,
  }),
  group(GROUP.dormant, 'Dormant - 120d', 'No sign-in in 120 days. Review for deactivation.'),
  group(GROUP.executiveStaff, 'Executive Staff', 'Leadership team'),
  group(GROUP.londonOffice, 'London Office', 'Rule-assigned by city'),
  group(GROUP.berlinOffice, 'Berlin Office', 'Rule-assigned by city'),
  group(GROUP.seattleOffice, 'Seattle Office', 'Rule-assigned by city'),
  group(GROUP.austinOffice, 'Austin Office', 'Rule-assigned by city'),
  group(GROUP.sydneyOffice, 'Sydney Office', 'Rule-assigned by city'),
  group(GROUP.salesforceSalesUsers, 'Salesforce - Sales Users', 'Pushed from Salesforce', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 1), name: 'Salesforce' },
  }),
  group(GROUP.salesforceAdmins, 'Salesforce - Admins', 'Pushed from Salesforce', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 1), name: 'Salesforce' },
  }),
  group(GROUP.workdayAllWorkers, 'Workday - All Workers', 'Sourced from Workday HR', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 2), name: 'Workday HR' },
  }),
  group(GROUP.githubEngineering, 'GitHub - Engineering', 'Pushed to GitHub Enterprise', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 3), name: 'GitHub Enterprise' },
  }),
  group(GROUP.zoomLicensed, 'Zoom - Licensed', 'Pushed to Zoom', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 5), name: 'Zoom' },
  }),
  group(GROUP.datadogEngineering, 'Datadog - Engineering', 'Pushed to Datadog', {
    type: 'APP_GROUP',
    source: { id: fakeId('0oa', 7), name: 'Datadog' },
  }),
  group(
    GROUP.migrationAccess,
    'Temp - Migration Access',
    'Cutover access for the IdP migration. Nobody closed it.',
  ),
  group(GROUP.salesEmeaLegacy, 'Sales - EMEA legacy', 'Superseded by Sales - All'),
  group(GROUP.verifyRollout, 'Okta Verify Rollout', 'Pilot cohort for the Okta Verify rollout'),
];

function rule(
  n: number,
  name: string,
  expression: string,
  groupIds: string[],
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): OktaGroupRule {
  return {
    id: fakeId('0pr', n),
    name,
    status,
    type: 'group_rule',
    created: isoDaysAgo(400 + n * 7),
    lastUpdated: isoDaysAgo(n * 5 + 1),
    conditions: { expression: { value: expression, type: 'urn:okta:expression:1.0' } },
    actions: { assignUserToGroups: { groupIds } },
    allGroupsValid: true,
  };
}

export const demoRules: OktaGroupRule[] = [
  rule(1, 'Everyone → VPN', 'user.status == "ACTIVE"', [fakeId('00g', 14)]),
  rule(2, 'Engineering by department', 'user.department == "Engineering"', [fakeId('00g', 2)]),
  rule(
    3,
    'Engineering → GitHub (excludes contractors)',
    'user.department == "Engineering" && user.employeeType != "CONTRACTOR"',
    [fakeId('00g', 32)],
  ),
  rule(4, 'Sales by department', 'user.department == "Sales"', [fakeId('00g', 3)]),
  rule(
    5,
    'EMEA contractors',
    'user.employeeType == "CONTRACTOR" && (user.countryCode == "GB" || user.countryCode == "DE" || user.countryCode == "IE")',
    [fakeId('00g', 15)],
  ),
  rule(
    6,
    'AMER contractors',
    'user.employeeType == "CONTRACTOR" && (user.countryCode == "US" || user.countryCode == "CA")',
    [fakeId('00g', 16)],
  ),
  rule(7, 'London office', 'user.city == "London"', [fakeId('00g', 24)]),
  rule(8, 'Berlin office', 'user.city == "Berlin"', [fakeId('00g', 25)]),
  rule(
    9,
    'Interns → cohort group',
    'user.employeeType == "INTERN" && String.stringContains(user.organization, "Northwind")',
    [fakeId('00g', 21)],
    'INACTIVE',
  ),
  rule(10, 'Customer Success by department', 'user.department == "Customer Success"', [
    fakeId('00g', 4),
  ]),
  rule(11, 'Marketing by department', 'user.department == "Marketing"', [fakeId('00g', 5)]),
  rule(12, 'Finance by department', 'user.department == "Finance"', [fakeId('00g', 6)]),
  rule(13, 'People Ops by department', 'user.department == "People Ops"', [fakeId('00g', 7)]),
  rule(14, 'IT by department', 'user.department == "IT"', [fakeId('00g', 8)]),
  rule(15, 'Security by department', 'user.department == "Security"', [fakeId('00g', 9)]),
  rule(16, 'Data by department', 'user.department == "Data"', [fakeId('00g', 10)]),
  rule(17, 'Legal by department', 'user.department == "Legal"', [fakeId('00g', 11)]),
  rule(18, 'Seattle office', 'user.city == "Seattle"', [fakeId('00g', 26)]),
  rule(19, 'Austin office', 'user.city == "Austin"', [fakeId('00g', 27)]),
  rule(20, 'Sydney office', 'user.city == "Sydney"', [fakeId('00g', 28)]),
  rule(21, 'Engineering → Datadog', 'user.department == "Engineering"', [fakeId('00g', 34)]),
];

function app(
  n: number,
  name: string,
  label: string,
  signOnMode: string,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  features?: readonly string[],
): OktaAppListItem {
  return {
    id: fakeId('0oa', n),
    name,
    label,
    status,
    signOnMode,
    created: isoDaysAgo(700 + n * 11),
    lastUpdated: isoDaysAgo(n * 4 + 3),
    ...(features ? { features: [...features] } : {}),
  };
}

const GROUP_PUSH_FEATURES = ['GROUP_PUSH', 'IMPORT_NEW_USERS'] as const;

export const demoApps: OktaAppListItem[] = [
  app(1, 'salesforce', 'Salesforce', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(2, 'workday', 'Workday HR', 'SAML_2_0'),
  app(3, 'github', 'GitHub Enterprise', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(4, 'slack', 'Slack', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(5, 'zoom', 'Zoom', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(6, 'atlassian', 'Atlassian Cloud', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(7, 'datadog', 'Datadog', 'SAML_2_0', 'ACTIVE', GROUP_PUSH_FEATURES),
  app(8, 'aws_account_federation', 'AWS Account Federation', 'SAML_2_0'),
  app(9, 'boxnet', 'Box', 'SAML_2_0'),
  app(10, 'docusign', 'DocuSign', 'SAML_2_0'),
  app(11, 'netsuite', 'NetSuite', 'SAML_2_0', 'INACTIVE'),
  app(12, 'pagerduty', 'PagerDuty', 'SAML_2_0'),
];

export const demoAppGroups: readonly { appId: string; assignment: OktaAppGroupAssignment }[] = [
  {
    appId: fakeId('0oa', 1),
    assignment: { id: fakeId('00g', 29), priority: 0, profile: { groupName: 'Sales Users' } },
  },
  {
    appId: fakeId('0oa', 1),
    assignment: { id: fakeId('00g', 30), priority: 1, profile: { groupName: 'Admins' } },
  },
  {
    appId: fakeId('0oa', 3),
    assignment: { id: fakeId('00g', 32), priority: 0, profile: { groupName: 'engineering' } },
  },
  {
    appId: fakeId('0oa', 5),
    assignment: { id: fakeId('00g', 33), priority: 0, profile: { groupName: 'Licensed' } },
  },
  {
    appId: fakeId('0oa', 7),
    assignment: { id: fakeId('00g', 34), priority: 0, profile: { groupName: 'engineering' } },
  },
  {
    appId: fakeId('0oa', 8),
    assignment: { id: fakeId('00g', 12), priority: 0, profile: { groupName: 'ProdAdmin' } },
  },
  {
    appId: fakeId('0oa', 8),
    assignment: { id: fakeId('00g', 13), priority: 1, profile: { groupName: 'ProdReadOnly' } },
  },
];

export const DEMO_GROUP_COUNT = groupTemplates.length;

let stampedRevision = -1;
let stampedGroups: readonly RawOktaGroup[] = [];
let stampedById: ReadonlyMap<string, RawOktaGroup> = new Map();

function stamp(): void {
  const revision = demoRevision();
  if (stampedRevision === revision && stampedGroups.length > 0) return;
  stampedGroups = groupTemplates.map((template) => ({
    ...template,
    _embedded: { stats: { usersCount: demoGroupMembers().get(template.id)?.length ?? 0 } },
  }));
  stampedById = new Map(stampedGroups.map((g) => [g.id, g]));
  stampedRevision = revision;
}

export function currentGroups(): readonly RawOktaGroup[] {
  stamp();
  return stampedGroups;
}

export function currentGroupsById(): ReadonlyMap<string, RawOktaGroup> {
  stamp();
  return stampedById;
}

export const DEMO_HERO_GROUP_ID = fakeId('00g', 2);
