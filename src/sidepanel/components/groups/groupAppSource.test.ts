import { describe, it, expect } from 'vitest';
import { toGroupAppRows } from './groupAppSource';
import type { AppGrant } from '../../hooks/useGroupAccessGrants';
import type { PushGroupMapping } from '../../../shared/types';

const slack: AppGrant = {
  id: '0oaFAKE1',
  label: 'Slack',
  name: 'slack',
  status: 'ACTIVE',
  signOnMode: 'SAML_2_0',
  lastUpdated: new Date('2025-11-14T09:30:00Z'),
};

const bookmark: AppGrant = { id: '0oaFAKE2', label: 'Wiki' };

const mapping: PushGroupMapping = {
  mappingId: '0pgFAKE1',
  sourceUserGroupId: '00gFAKE1',
  appId: '0oaFAKE1',
  appName: 'Slack',
  targetGroupName: 'eng-team',
  priority: 2,
};

describe('toGroupAppRows', () => {
  it('keeps every descriptive field the assignment walk already paid for', () => {
    const [row] = toGroupAppRows([slack], []);

    expect(row).toMatchObject({
      id: '0oaFAKE1',
      label: 'Slack',
      name: 'slack',
      status: 'ACTIVE',
      statusVariant: 'success',
      signOnMode: 'SAML_2_0',
    });
    expect(row?.lastUpdated).toEqual(new Date('2025-11-14T09:30:00Z'));
  });

  it('leaves an unreported field absent rather than inventing a value for it', () => {
    const [row] = toGroupAppRows([bookmark], []);

    expect(row?.status).toBeUndefined();
    expect(row?.signOnMode).toBeUndefined();
    expect(row?.lastUpdated).toBeUndefined();
    expect(row?.statusVariant).toBe('neutral');
  });

  it('preserves the assignment order', () => {
    expect(toGroupAppRows([slack, bookmark], []).map((row) => row.id)).toEqual([
      '0oaFAKE1',
      '0oaFAKE2',
    ]);
  });

  describe('push is three-state and stays three-state', () => {
    it('reports unknown when the push enrichment never ran', () => {
      const [row] = toGroupAppRows([slack], undefined);
      expect(row?.push).toEqual({ state: 'unknown' });
    });

    it('reports not-pushed only when the mappings actually loaded', () => {
      const [row] = toGroupAppRows([slack], []);
      expect(row?.push).toEqual({ state: 'not-pushed' });
    });

    it('carries the target group and priority for a pushed app', () => {
      const [row] = toGroupAppRows([slack], [mapping]);
      expect(row?.push).toEqual({
        state: 'pushed',
        targetGroupName: 'eng-team',
        priority: 2,
      });
    });

    it('marks only the app the mapping names', () => {
      const [pushed, notPushed] = toGroupAppRows([slack, bookmark], [mapping]);
      expect(pushed?.push.state).toBe('pushed');
      expect(notPushed?.push.state).toBe('not-pushed');
    });

    it('carries an empty target group through rather than substituting one', () => {
      const [row] = toGroupAppRows(
        [slack],
        [
          {
            mappingId: '0pgFAKE2',
            sourceUserGroupId: '00gFAKE1',
            appId: '0oaFAKE1',
            targetGroupName: '',
          },
        ],
      );
      expect(row?.push).toEqual({ state: 'pushed', targetGroupName: '', priority: undefined });
    });

    it('takes the first mapping when an app carries more than one', () => {
      const second: PushGroupMapping = {
        ...mapping,
        mappingId: '0pgFAKE9',
        targetGroupName: 'other',
      };
      const [row] = toGroupAppRows([slack], [mapping, second]);
      expect(row?.push).toMatchObject({ state: 'pushed', targetGroupName: 'eng-team' });
    });
  });
});
