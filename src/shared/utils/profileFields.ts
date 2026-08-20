export const EXCLUDED_PROFILE_FIELDS = new Set([
  'securityQuestion',
  'securityQuestionAnswer',
  'security_question',
  'security_answer',
  'recoveryQuestion',
  'recoveryAnswer',
  'password',
  'credentials',
]);

export const STANDARD_PROFILE_FIELDS = new Set([
  'login',
  'email',
  'firstName',
  'lastName',
  'secondEmail',
  'mobilePhone',
  'primaryPhone',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'countryCode',
  'department',
  'title',
  'manager',
  'managerId',
  'division',
  'organization',
  'costCenter',
  'employeeNumber',
  'userType',
  'locale',
  'timezone',
  'genderPronouns',
]);

export function isExcludedProfileField(key: string): boolean {
  return EXCLUDED_PROFILE_FIELDS.has(key) || EXCLUDED_PROFILE_FIELDS.has(key.toLowerCase());
}

export function getCustomProfileFields(profile: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(profile).filter(
    ([key, value]) =>
      !STANDARD_PROFILE_FIELDS.has(key) &&
      !isExcludedProfileField(key) &&
      value !== null &&
      value !== undefined &&
      value !== '',
  );
}

export const BASE_PROFILE_ATTRIBUTES: readonly string[] = [
  'login',
  'email',
  'secondEmail',
  'firstName',
  'lastName',
  'middleName',
  'honorificPrefix',
  'honorificSuffix',
  'displayName',
  'nickName',
  'profileUrl',
  'title',
  'userType',
  'department',
  'division',
  'organization',
  'costCenter',
  'employeeNumber',
  'manager',
  'managerId',
  'primaryPhone',
  'mobilePhone',
  'streetAddress',
  'city',
  'state',
  'zipCode',
  'countryCode',
  'postalAddress',
  'preferredLanguage',
  'locale',
  'timezone',
] as const;
