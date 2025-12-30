export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalized?: string;
}

export interface ParsedIds {
  valid: string[];
  invalid: string[];
  errors: string[];
}

const ID_PATTERNS = {
  user: /^00u[a-zA-Z0-9]{17}$/,
  group: /^00g[a-zA-Z0-9]{17}$/,
  app: /^0oa[a-zA-Z0-9]{17}$/,
  rule: /^0pr[a-zA-Z0-9]{17}$/,
} as const;

const ID_PREFIXES = {
  user: '00u',
  group: '00g',
  app: '0oa',
  rule: '0pr',
} as const;

type IdType = keyof typeof ID_PATTERNS;

export function validateId(id: string, type: IdType): ValidationResult {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: `${type} ID is required` };
  }

  const trimmed = id.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: `${type} ID cannot be empty` };
  }

  if (trimmed.length !== 20) {
    return {
      isValid: false,
      error: `${type} ID must be 20 characters (got ${trimmed.length})`,
    };
  }

  if (!trimmed.startsWith(ID_PREFIXES[type])) {
    return {
      isValid: false,
      error: `${type} ID must start with "${ID_PREFIXES[type]}"`,
    };
  }

  if (!ID_PATTERNS[type].test(trimmed)) {
    return {
      isValid: false,
      error: `${type} ID contains invalid characters`,
    };
  }

  return { isValid: true, normalized: trimmed };
}

export function validateUserId(id: string): ValidationResult {
  return validateId(id, 'user');
}

export function validateGroupId(id: string): ValidationResult {
  return validateId(id, 'group');
}

export function validateAppId(id: string): ValidationResult {
  return validateId(id, 'app');
}

export function validateRuleId(id: string): ValidationResult {
  return validateId(id, 'rule');
}

export function parseIds(input: string, type: IdType): ParsedIds {
  if (!input || typeof input !== 'string') {
    return { valid: [], invalid: [], errors: [] };
  }

  const candidates = input
    .split(/[,\n\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: string[] = [];

  for (const candidate of candidates) {
    const result = validateId(candidate, type);
    if (result.isValid && result.normalized) {
      valid.push(result.normalized);
    } else {
      invalid.push(candidate);
      if (result.error) {
        errors.push(`"${candidate}": ${result.error}`);
      }
    }
  }

  return { valid, invalid, errors };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true, normalized: trimmed };
}

export function validateSearchQuery(
  query: string,
  minLength = 2,
  maxLength = 100,
): ValidationResult {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Search query is required' };
  }

  const trimmed = query.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Search query must be at least ${minLength} characters`,
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Search query must be less than ${maxLength} characters`,
    };
  }

  return { isValid: true, normalized: trimmed };
}

export function sanitizeDisplayString(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function looksLikeOktaId(value: string): { isOktaId: boolean; type?: IdType } {
  if (!value || typeof value !== 'string' || value.length !== 20) {
    return { isOktaId: false };
  }

  for (const [type, pattern] of Object.entries(ID_PATTERNS)) {
    if (pattern.test(value)) {
      return { isOktaId: true, type: type as IdType };
    }
  }

  return { isOktaId: false };
}

export function formatValidationErrors(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `${errors.length} validation errors:\n• ${errors.join('\n• ')}`;
}
