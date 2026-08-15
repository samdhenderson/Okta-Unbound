import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupSource } from './useGroupSource';
import { OKTA_PAGE_SIZE } from '../../shared/utils/oktaPagination';
import { setEntry, resetEntityCache } from '../cache/entityCache';
import type { GroupSummary, OktaGroupRule, OktaUser } from '../../shared/types';

const runtimeSendMessage = chrome.runtime.sendMessage as ReturnType<typeof vi.fn>;
const storageGet = chrome.storage.local.get as ReturnType<typeof vi.fn>;
const storageSet = chrome.storage.local.set as ReturnType<typeof vi.fn>;
const storageRemove = chrome.storage.local.remove as ReturnType<typeof vi.fn>;

const GROUP_ID = '00gFAKEGROUP1';
const FAKE_ORIGIN = 'https://okta-unbound-fake.example';

const group: GroupSummary = {
  id: GROUP_ID,
  name: 'Fake Engineering',
  type: 'OKTA_GROUP',
  memberCount: 0,
  hasRules: true,
  ruleCount: 1,
};

const feedingRule: OktaGroupRule = {
  id: '0prFAKERULE1',
  name: 'Engineering feeder',
  status: 'ACTIVE',
  type: 'group_rule',
  created: '2020-01-01T00:00:00.000Z',
  lastUpdated: '2024-01-01T00:00:00.000Z',
  conditions: {
    expression: { value: 'user.department == "Engineering"', type: 'urn:okta:expression:1.0' },
  },
  actions: { assignUserToGroups: { groupIds: [GROUP_ID] } },
};

function makeMember(index: number): OktaUser {
  return {
    id: `00uFAKE${index}`,
    status: 'ACTIVE',
    profile: {
      login: `user${index}@example.com`,
      email: `user${index}@example.com`,
      firstName: 'Fake',
      lastName: `User${index}`,
      department: 'Engineering',
    },
  };
}

function memberPage(url: string, total: number) {
  const params = new URLSearchParams(url.split('?')[1] ?? '');
  const start = Number(params.get('after') ?? '0');
  const end = Math.min(start + OKTA_PAGE_SIZE, total);
  const data = [];
  for (let i = start; i < end; i++) data.push(makeMember(i));

  const headers: Record<string, string> = {};
  if (end < total) {
    headers.link =
      `<${FAKE_ORIGIN}/api/v1/groups/${GROUP_ID}/users` +
      `?limit=${OKTA_PAGE_SIZE}&after=${end}>; rel="next"`;
  }
  return { success: true, data, headers };
}

function installHarness(memberCount: number) {
  resetEntityCache();
  runtimeSendMessage.mockReset();
  storageGet.mockReset();
  storageSet.mockReset();
  storageRemove.mockReset();

  const storage = new Map<string, unknown>();
  storageGet.mockImplementation(async (key: string) =>
    storage.has(key) ? { [key]: storage.get(key) } : {},
  );
  storageSet.mockImplementation(async (items: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(items)) storage.set(key, value);
  });
  storageRemove.mockImplementation(async (key: string) => {
    storage.delete(key);
  });

  runtimeSendMessage.mockImplementation(async (message: { action?: string; endpoint?: string }) => {
    if (message?.action !== 'scheduleApiRequest') return { success: true };
    const endpoint = message.endpoint ?? '';
    if (endpoint.startsWith('/api/v1/groups/rules')) {
      return { success: true, data: [feedingRule], headers: {} };
    }
    if (endpoint.startsWith(`/api/v1/groups/${GROUP_ID}/users`)) {
      return memberPage(endpoint, memberCount);
    }
    throw new Error(`Unrouted test endpoint: ${endpoint}`);
  });
}

function scheduledEndpoints(): string[] {
  return runtimeSendMessage.mock.calls
    .filter((call) => call[0]?.action === 'scheduleApiRequest')
    .map((call) => String(call[0]?.endpoint ?? ''));
}

async function runOpenAndAnalyze(memberCount: number): Promise<string[]> {
  installHarness(memberCount);

  const { result } = renderHook(() => useGroupSource(1));

  await act(async () => {
    result.current.open(group);
  });
  await waitFor(() => expect(result.current.rulesStatus).toBe('done'));

  await act(async () => {
    result.current.analyzeMembers();
  });
  await waitFor(() => expect(result.current.memberStatus).toBe('done'));

  expect(result.current.breakdown?.total).toBe(memberCount);
  return scheduledEndpoints();
}

const RULES_LISTING_REQUESTS = 1;

beforeEach(() => {
  runtimeSendMessage.mockReset();
  storageGet.mockReset();
  storageSet.mockReset();
  storageRemove.mockReset();
  vi.spyOn(console, 'debug').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useGroupSource scheduler cost', () => {
  it.each([50, 500, 2000])(
    'costs ceil(N/200) member pages plus a constant rules read for N=%i members',
    async (memberCount) => {
      const endpoints = await runOpenAndAnalyze(memberCount);

      const memberPages = endpoints.filter((e) => e.startsWith(`/api/v1/groups/${GROUP_ID}/users`));
      const rulesListings = endpoints.filter((e) => e.startsWith('/api/v1/groups/rules'));

      expect(memberPages).toHaveLength(Math.ceil(memberCount / OKTA_PAGE_SIZE));
      expect(rulesListings).toHaveLength(RULES_LISTING_REQUESTS);
      expect(endpoints).toHaveLength(
        Math.ceil(memberCount / OKTA_PAGE_SIZE) + RULES_LISTING_REQUESTS,
      );
    },
  );

  it('scales ONLY with the member page count — the non-member term is constant in N', async () => {
    const small = (await runOpenAndAnalyze(50)).length;
    const large = (await runOpenAndAnalyze(2000)).length;

    expect(large - small).toBe(Math.ceil(2000 / OKTA_PAGE_SIZE) - Math.ceil(50 / OKTA_PAGE_SIZE));
  });

  it.each([50, 500, 2000])(
    'never issues a per-member /api/v1/users/{id} request for N=%i members',
    async (memberCount) => {
      const endpoints = await runOpenAndAnalyze(memberCount);

      expect(endpoints.filter((e) => /^\/api\/v1\/users\//.test(e))).toEqual([]);
    },
  );
});

async function openAndAnalyze(
  onOpened?: (analyze: () => void) => void,
): Promise<ReturnType<typeof renderHook<ReturnType<typeof useGroupSource>, unknown>>['result']> {
  const { result } = renderHook(() => useGroupSource(1));

  await act(async () => {
    result.current.open(group);
  });
  await waitFor(() => expect(result.current.rulesStatus).toBe('done'));

  await act(async () => {
    if (onOpened) onOpened(result.current.analyzeMembers);
    else result.current.analyzeMembers();
  });
  await waitFor(() => expect(result.current.memberStatus).toBe('done'));

  return result;
}

function memberPageEndpoints(): string[] {
  return scheduledEndpoints().filter((e) => e.startsWith(`/api/v1/groups/${GROUP_ID}/users`));
}

describe('useGroupSource entity-cache reuse', () => {
  const MEMBER_COUNT = 500;

  it('costs ZERO member requests when ["groupMembers", id] is already banked', async () => {
    installHarness(MEMBER_COUNT);
    const banked = Array.from({ length: MEMBER_COUNT }, (_, i) => makeMember(i));
    setEntry(['groupMembers', GROUP_ID], banked);

    const result = await openAndAnalyze();

    expect(result.current.breakdown?.total).toBe(MEMBER_COUNT);
    expect(memberPageEndpoints()).toEqual([]);
    expect(scheduledEndpoints()).toHaveLength(RULES_LISTING_REQUESTS);
  });

  it('coalesces two concurrent analyses of the same group onto ONE member walk', async () => {
    installHarness(MEMBER_COUNT);

    const result = await openAndAnalyze((analyze) => {
      analyze();
      analyze();
    });

    expect(result.current.breakdown?.total).toBe(MEMBER_COUNT);
    expect(memberPageEndpoints()).toHaveLength(Math.ceil(MEMBER_COUNT / OKTA_PAGE_SIZE));
  });
});

describe('useGroupSource.resummarize', () => {
  it('re-splits a changed roster without scheduling a single request', async () => {
    installHarness(3);
    const { result } = renderHook(() => useGroupSource(1));

    await act(async () => {
      result.current.open(group);
    });
    await waitFor(() => expect(result.current.rulesStatus).toBe('done'));
    await act(async () => {
      result.current.analyzeMembers();
    });
    await waitFor(() => expect(result.current.memberStatus).toBe('done'));
    expect(result.current.breakdown?.total).toBe(3);

    const before = scheduledEndpoints().length;

    await act(async () => {
      result.current.resummarize([makeMember(0), makeMember(1)]);
    });

    expect(result.current.breakdown?.total).toBe(2);
    expect(scheduledEndpoints()).toHaveLength(before);
  });

  it('is a no-op before an analysis has run, since there is no split to correct', async () => {
    installHarness(3);
    const { result } = renderHook(() => useGroupSource(1));

    await act(async () => {
      result.current.open(group);
    });
    await waitFor(() => expect(result.current.rulesStatus).toBe('done'));

    await act(async () => {
      result.current.resummarize([makeMember(0)]);
    });

    expect(result.current.breakdown).toBeNull();
    expect(result.current.memberStatus).toBe('idle');
  });
});
