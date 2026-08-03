import { createLogger } from '../shared/utils/logger';

const log = createLogger('Content');

export function extractGroupIdFromUrl(url: string): string | null {
  const match1 = url.match(/\/admin\/group\/([a-zA-Z0-9]+)/);
  if (match1) return match1[1];

  const match2 = url.match(/\/groups\/([a-zA-Z0-9]+)/);
  if (match2) return match2[1];

  return null;
}

export function extractGroupNameFromPage(): string | null {
  const selectors = [
    'h1[data-se="group-name"]',
    '.group-profile-header h1',
    '[data-se="group-detail-name"]',
    'h1.okta-form-title',
    '.content-container h1',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || null;
    }
  }

  return null;
}

export function extractUserIdFromUrl(url: string): string | null {
  log.debug('extractUserIdFromUrl: parsing URL', { path: url.split('?')[0] });

  const patterns: Array<{ regex: RegExp; name: string }> = [
    {
      regex: /\/admin\/user\/profile\/view\/([a-zA-Z0-9]+)/,
      name: '/admin/user/profile/view/{id}',
    },
    { regex: /\/admin\/user\/profile\/([a-zA-Z0-9]+)/, name: '/admin/user/profile/{id}' },

    { regex: /\/admin\/user\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/admin/user/{id}' },
    { regex: /\/admin\/users\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/admin/users/{id}' },

    { regex: /\/admin\/directory\/people\/([a-zA-Z0-9]+)/, name: '/admin/directory/people/{id}' },

    {
      regex: /\/enduser\/settings\/profile\/([a-zA-Z0-9]+)/,
      name: '/enduser/settings/profile/{id}',
    },
    { regex: /\/app\/UserHome\/([a-zA-Z0-9]+)/, name: '/app/UserHome/{id}' },

    { regex: /\/users\/([a-zA-Z0-9]+)(?:\/|$|\?)/, name: '/users/{id}' },

    { regex: /\/reports\/user\/([a-zA-Z0-9]+)/, name: '/reports/user/{id}' },

    { regex: /[?&]userId=([a-zA-Z0-9]+)/, name: '?userId={id}' },
    { regex: /[?&]user=([a-zA-Z0-9]+)/, name: '?user={id}' },
  ];

  for (const { regex, name } of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      const potentialId = match[1];
      const nonIdKeywords = [
        'settings',
        'profile',
        'edit',
        'view',
        'new',
        'create',
        'delete',
        'list',
        'search',
      ];
      if (nonIdKeywords.includes(potentialId.toLowerCase())) {
        continue;
      }
      log.debug('extractUserIdFromUrl: matched pattern', { pattern: name, id: potentialId });
      return potentialId;
    }
  }

  log.warn('extractUserIdFromUrl: no pattern matched', { path: url.split('?')[0] });
  return null;
}

export function extractUserNameFromPage(): string | null {
  const selectors = [
    '.subheader-fullname',

    '[data-se="user-profile-name"]',
    '[data-se="user-name"]',
    '[data-se="user-detail-name"]',
    '[data-testid="user-name"]',
    '[data-testid="profile-name"]',

    '.user-profile-header h1',
    '.user-header h1',
    '.user-detail-header h1',
    '.profile-header h1',
    '.person-header h1',

    '.directory-person-header h1',
    '.person-profile h1',
    '[class*="ProfileHeader"] h1',
    '[class*="UserHeader"] h1',

    'h1.okta-form-title',
    '.content-container h1',
    'main h1',

    '.page-title',
    '[class*="PageTitle"]',
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && !['User Profile', 'Profile', 'Settings', 'User'].includes(text)) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function extractAppIdFromUrl(url: string): string | null {
  log.debug('extractAppIdFromUrl: parsing URL', { path: url.split('?')[0] });

  const patterns: Array<{ regex: RegExp; name: string }> = [
    {
      regex: /\/admin\/app\/([a-zA-Z0-9]+)\/instance\/([a-zA-Z0-9]+)/,
      name: '/admin/app/{appId}/instance/{instanceId}',
    },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)\/settings/, name: '/admin/app/{appId}/settings' },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)\/assignment/, name: '/admin/app/{appId}/assignment' },
    { regex: /\/admin\/app\/([a-zA-Z0-9]+)/, name: '/admin/app/{appId}' },

    { regex: /\/admin\/apps\/active\/([a-zA-Z0-9]+)/, name: '/admin/apps/active/{appId}' },
    { regex: /\/admin\/apps\/([a-zA-Z0-9]+)/, name: '/admin/apps/{appId}' },

    { regex: /\/api\/v1\/apps\/([a-zA-Z0-9]+)/, name: '/api/v1/apps/{appId}' },

    { regex: /[?&]appId=([a-zA-Z0-9]+)/, name: '?appId={appId}' },
    { regex: /[?&]app=([a-zA-Z0-9]+)/, name: '?app={appId}' },
  ];

  for (const { regex, name } of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      const potentialId = match[1];
      const nonIdKeywords = ['settings', 'new', 'create', 'list', 'active', 'inactive', 'catalog'];
      if (nonIdKeywords.includes(potentialId.toLowerCase())) {
        continue;
      }
      if (potentialId.startsWith('0oa') || potentialId.length >= 18) {
        log.debug('extractAppIdFromUrl: matched pattern', { pattern: name, id: potentialId });
        return potentialId;
      }
    }
  }

  log.warn('extractAppIdFromUrl: no pattern matched', { path: url.split('?')[0] });
  return null;
}

export function extractAppNameFromPage(): string | null {
  const selectors = [
    '[data-se="app-name"]',
    '[data-se="app-label"]',
    '[data-testid="app-name"]',
    '[data-testid="app-label"]',

    '.app-header h1',
    '.app-detail-header h1',
    '[class*="AppHeader"] h1',
    '[class*="ApplicationHeader"] h1',

    '.app-settings-header h1',
    '.application-settings h1',

    'h1.okta-form-title',
    '.content-container h1',
    'main h1',

    '.page-title',
    '[class*="PageTitle"]',
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && !['Application', 'App', 'Settings', 'Configuration'].includes(text)) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

const POLICY_ID_PATTERN = /^(?:rst|00p)[A-Za-z0-9]{15,}$/;

export function extractPolicyIdFromUrl(url: string): string | null {
  log.debug('extractPolicyIdFromUrl: parsing URL', { path: url.split('?')[0] });

  const patterns: Array<{ regex: RegExp; name: string }> = [
    { regex: /\/admin\/authn\/policies\/([a-zA-Z0-9]+)/, name: '/admin/authn/policies/{id}' },
    { regex: /\/admin\/access\/policies\/([a-zA-Z0-9]+)/, name: '/admin/access/policies/{id}' },

    { regex: /\/admin\/policy\/[a-zA-Z0-9-]+\/([a-zA-Z0-9]+)/, name: '/admin/policy/{view}/{id}' },
    { regex: /\/admin\/policy\/([a-zA-Z0-9]+)/, name: '/admin/policy/{id}' },

    { regex: /\/api\/v1\/policies\/([a-zA-Z0-9]+)/, name: '/api/v1/policies/{id}' },

    { regex: /[?&]policyId=([a-zA-Z0-9]+)/, name: '?policyId={id}' },
  ];

  for (const { regex, name } of patterns) {
    const match = url.match(regex);
    if (match && match[1]) {
      const potentialId = match[1];
      const nonIdKeywords = [
        'settings',
        'new',
        'create',
        'edit',
        'view',
        'delete',
        'list',
        'search',
        'rules',
        'policies',
        'default',
      ];
      if (nonIdKeywords.includes(potentialId.toLowerCase())) {
        continue;
      }
      if (POLICY_ID_PATTERN.test(potentialId)) {
        log.debug('extractPolicyIdFromUrl: matched pattern', { pattern: name, id: potentialId });
        return potentialId;
      }
    }
  }

  log.warn('extractPolicyIdFromUrl: no pattern matched', { path: url.split('?')[0] });
  return null;
}

export function extractPolicyNameFromPage(): string | null {
  const selectors = [
    '[data-se="policy-name"]',
    '[data-se="policy-title"]',
    '[data-testid="policy-name"]',

    '.policy-header h1',
    '.policy-detail-header h1',
    '[class*="PolicyHeader"] h1',

    'h1.okta-form-title',
    '.content-container h1',
    'main h1',

    '.page-title',
    '[class*="PageTitle"]',
  ];

  const genericLabels = [
    'Policy',
    'Policies',
    'Authentication',
    'Authentication Policy',
    'Authentication Policies',
    'Access Policy',
    'Settings',
    'Security',
  ];

  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent?.trim();
        if (text && !genericLabels.includes(text)) {
          return text;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}
