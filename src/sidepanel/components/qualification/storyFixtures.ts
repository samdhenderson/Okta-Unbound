import type { MembershipRule, OktaUser } from '../../../shared/types';
import type { RuleGroupContext } from '../../../shared/ruleEvaluator';
import {
  assessRuleForUser,
  type QualificationSubject,
} from '../../../shared/membership/qualification';

export const USER_ID = '00uFAKEQUAL001';
export const ENGINEERING = '00gFAKEENG0001';
export const SECOPS = '00gFAKESECOPS1';
export const CONTRACTORS = '00gFAKECONTR01';
export const DELETED = '00gFAKEGONE001';

export const user: OktaUser = {
  id: USER_ID,
  status: 'ACTIVE',
  profile: {
    login: 'ada@example.com',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    department: 'Engineering',
    title: 'Staff Engineer',
    employeeNumber: '42',
  },
};

export const groupContext: RuleGroupContext = [{ id: ENGINEERING, name: 'Engineering' }];

export const subject: QualificationSubject = { user, groupContext };

export const groupNames = new Map<string, string>([
  [ENGINEERING, 'Engineering'],
  [SECOPS, 'SecOps'],
  [CONTRACTORS, 'Contractors'],
]);

export const resolveGroupName = (id: string) => groupNames.get(id);

export const rule = (over: Partial<MembershipRule> = {}): MembershipRule => ({
  id: '0prFAKEQUAL001',
  name: 'Engineers into SecOps',
  status: 'ACTIVE',
  groupIds: [SECOPS],
  conditionExpression: 'user.department == "Engineering"',
  ...over,
});

export const grantsVerdict = assessRuleForUser(rule(), subject, groupNames);
export const inactiveVerdict = assessRuleForUser(rule({ status: 'INACTIVE' }), subject, groupNames);
export const doesNotMatchVerdict = assessRuleForUser(
  rule({ conditionExpression: 'user.department == "Sales" && user.title == "Director"' }),
  subject,
  groupNames,
);
export const excludedByUserVerdict = assessRuleForUser(
  rule({ excludedUserIds: [USER_ID] }),
  subject,
  groupNames,
);
export const excludedByGroupVerdict = assessRuleForUser(
  rule({ excludedGroupIds: [ENGINEERING] }),
  subject,
  groupNames,
);
export const undeterminedVerdict = assessRuleForUser(
  rule({ conditionExpression: 'user.employeeNumber > 5' }),
  subject,
  groupNames,
);
export const noConditionVerdict = assessRuleForUser(
  rule({ conditionExpression: '' }),
  subject,
  groupNames,
);
export const alreadyMemberVerdict = assessRuleForUser(
  rule({ groupIds: [ENGINEERING, SECOPS] }),
  subject,
  groupNames,
);
export const missingTargetVerdict = assessRuleForUser(
  rule({ groupIds: [SECOPS, DELETED] }),
  subject,
  groupNames,
  [DELETED],
);
