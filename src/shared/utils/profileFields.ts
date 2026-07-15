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

export function getCustomProfileFields(profile: Record<string, unknown>): Array<[string, unknown]> {
  return Object.entries(profile).filter(
    ([key, value]) =>
      !STANDARD_PROFILE_FIELDS.has(key) &&
      !EXCLUDED_PROFILE_FIELDS.has(key) &&
      !EXCLUDED_PROFILE_FIELDS.has(key.toLowerCase()) &&
      value !== null &&
      value !== undefined &&
      value !== '',
  );
}
