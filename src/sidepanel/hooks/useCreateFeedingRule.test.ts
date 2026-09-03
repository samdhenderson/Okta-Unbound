import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { GroupSummary } from '../../shared/types';

const api = vi.hoisted(() => ({
  createGroupRule: vi.fn(),
}));

vi.mock('./useOktaApi', () => ({
  useOktaApi: () => api,
}));

import { useCreateFeedingRule } from './useCreateFeedingRule';
import { MAX_RULE_NAME_LENGTH } from '../../shared/rules/consolidation';

const group: GroupSummary = {
  id: '00gFAKEGROUP',
  name: 'Fake Engineering',
  type: 'OKTA_GROUP',
  memberCount: 12,
  hasRules: false,
  ruleCount: 0,
};

function renderCreateRule(targetTabId: number | null = 1) {
  return renderHook(() => useCreateFeedingRule({ targetTabId, group }));
}

function draft(
  result: { current: ReturnType<typeof useCreateFeedingRule> },
  name = 'Engineering intake',
  expression = 'user.department == "Engineering"',
) {
  act(() => {
    result.current.setName(name);
  });
  act(() => {
    result.current.setExpression(expression);
  });
}

describe('useCreateFeedingRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.createGroupRule.mockResolvedValue({
      success: true,
      rule: { id: '0prFAKE1', name: 'Engineering intake', status: 'INACTIVE' },
    });
  });

  it('posts a rule whose single target group is the one being browsed', async () => {
    const { result } = renderCreateRule();
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(api.createGroupRule).toHaveBeenCalledWith({
      type: 'group_rule',
      name: 'Engineering intake',
      conditions: {
        expression: {
          value: 'user.department == "Engineering"',
          type: 'urn:okta:expression:1.0',
        },
      },
      actions: { assignUserToGroups: { groupIds: [group.id] } },
    });
  });

  it('reports the created rule so the caller can offer the jump that activates it', async () => {
    const { result } = renderCreateRule();
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.createdRuleName).toBe('Engineering intake');
    expect(result.current.createdRuleId).toBe('0prFAKE1');
    expect(result.current.error).toBeNull();
  });

  it('keeps the draft and reports the message when Okta rejects the create', async () => {
    api.createGroupRule.mockResolvedValue({ success: false, error: 'Rule name already in use' });
    const { result } = renderCreateRule();
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.error).toBe('Rule name already in use');
    expect(result.current.createdRuleName).toBeNull();
    expect(result.current.name).toBe('Engineering intake');
  });

  it('reports a thrown transport failure rather than leaving the confirm spinning', async () => {
    api.createGroupRule.mockRejectedValue(new Error('Tab disconnected'));
    const { result } = renderCreateRule();
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.error).toBe('Tab disconnected');
    expect(result.current.isCreating).toBe(false);
  });

  describe('what gates the confirm', () => {
    it('needs both a name and an expression', () => {
      const { result } = renderCreateRule();
      expect(result.current.canSubmit).toBe(false);

      act(() => result.current.setName('Engineering intake'));
      expect(result.current.canSubmit).toBe(false);

      act(() => result.current.setExpression('user.department == "Engineering"'));
      expect(result.current.canSubmit).toBe(true);
    });

    it('treats a whitespace-only draft as empty', () => {
      const { result } = renderCreateRule();
      draft(result, '   ', '   ');
      expect(result.current.canSubmit).toBe(false);
    });

    it('needs a connected Okta tab', () => {
      const { result } = renderCreateRule(null);
      draft(result);
      expect(result.current.canSubmit).toBe(false);
    });

    it("names Okta's rule-name limit rather than letting the write be rejected for it", () => {
      const { result } = renderCreateRule();
      draft(result, 'x'.repeat(MAX_RULE_NAME_LENGTH + 1));

      expect(result.current.nameError).toContain(String(MAX_RULE_NAME_LENGTH));
      expect(result.current.canSubmit).toBe(false);
    });

    it('says nothing about an empty name — a field nobody has filled in is not an error', () => {
      const { result } = renderCreateRule();
      expect(result.current.nameError).toBeNull();
    });

    it('refuses to fire a second write from the success step', async () => {
      const { result } = renderCreateRule();
      draft(result);

      await act(async () => {
        await result.current.confirm();
      });
      expect(result.current.canSubmit).toBe(false);

      await act(async () => {
        await result.current.confirm();
      });
      expect(api.createGroupRule).toHaveBeenCalledTimes(1);
    });
  });

  describe('the expression check', () => {
    it('notices an expression it cannot parse without blocking the write', () => {
      const { result } = renderCreateRule();
      draft(result, 'Engineering intake', 'user.department ?? ');

      expect(result.current.expressionNotice).toContain('could not be parsed here');
      expect(result.current.canSubmit).toBe(true);
    });

    it('stays quiet on an expression it can parse', () => {
      const { result } = renderCreateRule();
      draft(result);
      expect(result.current.expressionNotice).toBeNull();
    });

    it('stays quiet on an empty field', () => {
      const { result } = renderCreateRule();
      expect(result.current.expressionNotice).toBeNull();
    });
  });

  describe('opening and closing', () => {
    it('opens on a fresh draft, discarding whatever the last visit left', async () => {
      const { result } = renderCreateRule();
      draft(result);
      await act(async () => {
        await result.current.confirm();
      });

      act(() => result.current.open());

      expect(result.current.isOpen).toBe(true);
      expect(result.current.name).toBe('');
      expect(result.current.expression).toBe('');
      expect(result.current.createdRuleName).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('closes and discards the draft', () => {
      const { result } = renderCreateRule();
      act(() => result.current.open());
      draft(result);

      act(() => result.current.close());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.name).toBe('');
      expect(result.current.expression).toBe('');
    });
  });
});

describe('useCreateFeedingRule — announcing the create to the open pane', () => {
  const created = { success: true, rule: { id: '0prFAKE1', name: 'Engineering intake' } };

  beforeEach(() => {
    vi.clearAllMocks();
    api.createGroupRule.mockResolvedValue(created);
  });

  function renderWithCallback(initial: (() => void) | undefined) {
    let onCreated = initial;
    const view = renderHook(() => useCreateFeedingRule({ targetTabId: 1, group, onCreated }));
    return {
      ...view,
      setOnCreated(next: (() => void) | undefined) {
        onCreated = next;
        view.rerender();
      },
    };
  }

  it('announces a landed create so the caller can reload the pane', async () => {
    const onCreated = vi.fn();
    const { result } = renderWithCallback(onCreated);
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('stays silent when Okta rejects the create — there is nothing new to show', async () => {
    api.createGroupRule.mockResolvedValue({ success: false, error: 'Rule name already in use' });
    const onCreated = vi.fn();
    const { result } = renderWithCallback(onCreated);
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(onCreated).not.toHaveBeenCalled();
  });

  it('stays silent when the write throws', async () => {
    api.createGroupRule.mockRejectedValue(new Error('Tab disconnected'));
    const onCreated = vi.fn();
    const { result } = renderWithCallback(onCreated);
    draft(result);

    await act(async () => {
      await result.current.confirm();
    });

    expect(onCreated).not.toHaveBeenCalled();
  });

  it('reads the callback at call time, so a caller can withdraw it mid-flight', async () => {
    const onCreated = vi.fn();
    const { result, setOnCreated } = renderWithCallback(onCreated);
    draft(result);

    setOnCreated(undefined);
    await act(async () => {
      await result.current.confirm();
    });

    expect(onCreated).not.toHaveBeenCalled();
    expect(result.current.createdRuleId).toBe('0prFAKE1');
  });
});
