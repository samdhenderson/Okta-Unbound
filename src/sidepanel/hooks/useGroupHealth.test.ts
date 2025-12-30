import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGroupHealth } from './useGroupHealth';

const mockChrome = {
  tabs: {
    get: vi.fn(),
    sendMessage: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
};

(globalThis as any).chrome = mockChrome;

describe('useGroupHealth', () => {
  const mockGroupId = '00g123456789';
  const mockTargetTabId = 1;

  const mockApiUsers = [
    ['user1', 'Active', 'John Doe', 'user1@example.com', null],
    ['user2', 'Active', 'Jane Smith', 'user2@example.com', null],
    ['user3', 'Deactivated', 'Bob Johnson', 'user3@example.com', null], // UI label for DEPROVISIONED
    ['user4', 'Suspended', 'Alice Williams', 'user4@example.com', null],
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockChrome.tabs.get.mockImplementation((tabId) => Promise.resolve({ id: tabId, active: true }));

    mockChrome.storage.local.get.mockImplementation(() => Promise.resolve({}));

    mockChrome.storage.local.set.mockImplementation(() => Promise.resolve());

    mockChrome.tabs.sendMessage.mockImplementation((_tabId, message) => {
      if (message.action === 'makeApiRequest') {
        return Promise.resolve({
          success: true,
          data: { aaData: mockApiUsers },
          headers: {},
        });
      }
      if (message.action === 'fetchGroupRules') {
        return Promise.resolve({
          success: true,
          formattedRules: [],
        });
      }
      return Promise.resolve({ success: false });
    });
  });

  it('should load metrics successfully', async () => {
    const { result } = renderHook(() =>
      useGroupHealth({ groupId: mockGroupId, targetTabId: mockTargetTabId }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toBeDefined();
    expect(result.current.metrics?.totalUsers).toBe(4);
    expect(result.current.metrics?.statusBreakdown.ACTIVE).toBe(2);
    expect(result.current.metrics?.statusBreakdown.DEPROVISIONED).toBe(1);
    expect(result.current.metrics?.statusBreakdown.SUSPENDED).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('should calculate risk score correctly for healthy group', async () => {
    const healthyApiUsers = [
      ['user1', 'Active', 'John Doe', 'user1@example.com', null],
      ['user2', 'Active', 'Jane Smith', 'user2@example.com', null],
    ];
    mockChrome.tabs.sendMessage.mockImplementation((_tabId, message) => {
      if (message.action === 'makeApiRequest') {
        return Promise.resolve({
          success: true,
          data: { aaData: healthyApiUsers },
          headers: {},
        });
      }
      if (message.action === 'fetchGroupRules') {
        return Promise.resolve({
          success: true,
          formattedRules: [],
        });
      }
      return Promise.resolve({ success: false });
    });

    const { result } = renderHook(() =>
      useGroupHealth({ groupId: mockGroupId, targetTabId: mockTargetTabId }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics?.riskScore).toBeLessThan(30);
    expect(result.current.metrics?.riskFactors).toContain('No issues detected');
  });

  it('should calculate risk score correctly for unhealthy group', async () => {
    const unhealthyApiUsers = [
      ...mockApiUsers,
      ['user5', 'Deactivated', 'Test User', 'user5@example.com', null], // UI label for DEPROVISIONED
      ['user6', 'Locked Out', 'Test2 User2', 'user6@example.com', null], // UI label for LOCKED_OUT
    ];

    mockChrome.tabs.sendMessage.mockImplementation((_tabId, message) => {
      if (message.action === 'makeApiRequest') {
        return Promise.resolve({
          success: true,
          data: { aaData: unhealthyApiUsers },
          headers: {},
        });
      }
      if (message.action === 'fetchGroupRules') {
        return Promise.resolve({
          success: true,
          formattedRules: [],
        });
      }
      return Promise.resolve({ success: false });
    });

    const { result } = renderHook(() =>
      useGroupHealth({ groupId: mockGroupId, targetTabId: mockTargetTabId }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics?.riskScore).toBeGreaterThan(30);
    expect(result.current.metrics?.riskFactors.length).toBeGreaterThan(1);
  });

  it('should use cached metrics when available and fresh', async () => {
    const cachedMetrics = {
      totalUsers: 10,
      statusBreakdown: {
        ACTIVE: 10,
        DEPROVISIONED: 0,
        SUSPENDED: 0,
        STAGED: 0,
        PROVISIONED: 0,
        RECOVERY: 0,
        LOCKED_OUT: 0,
        PASSWORD_EXPIRED: 0,
      },
      membershipSources: { direct: 10, ruleBased: 0 },
      riskScore: 0,
      riskFactors: ['No issues detected'],
      lastCleanup: null,
      daysSinceCleanup: null,
      trends: { membershipChange30d: 0, newUsersThisWeek: 0 },
    };

    mockChrome.storage.local.get.mockImplementation(() =>
      Promise.resolve({
        dashboard_cache: {
          metrics: cachedMetrics,
          timestamp: Date.now(),
          groupId: mockGroupId,
        },
      }),
    );

    const { result } = renderHook(() =>
      useGroupHealth({ groupId: mockGroupId, targetTabId: mockTargetTabId }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual(cachedMetrics);
    expect(mockChrome.tabs.sendMessage).toHaveBeenCalledTimes(1);
    expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(
      mockTargetTabId,
      expect.objectContaining({
        action: 'makeApiRequest',
      }),
    );
    expect(result.current.members).toBeDefined();
    expect(result.current.members.length).toBe(4);
  });

  it('should handle errors gracefully', async () => {
    mockChrome.tabs.sendMessage.mockImplementation(() =>
      Promise.resolve({
        success: false,
        error: 'API Error',
      }),
    );

    const { result } = renderHook(() =>
      useGroupHealth({ groupId: mockGroupId, targetTabId: mockTargetTabId }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.metrics).toBeNull();
  });

  it('should not load metrics when groupId or targetTabId is missing', async () => {
    const { result } = renderHook(() => useGroupHealth({ groupId: undefined, targetTabId: null }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
  });
});
