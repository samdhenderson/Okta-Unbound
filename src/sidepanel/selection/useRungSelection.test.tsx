import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRungSelection } from './useRungSelection';
import { selectionStore } from './selectionStore';

interface FakeEntity {
  id: string;
  name: string;
}

const fullGroupList: FakeEntity[] = [
  { id: '00gFAKE0001', name: 'Marketing' },
  { id: '00gFAKE0002', name: 'Engineering' },
  { id: '00gFAKE0003', name: 'Sales' },
];

const nameOf = (entity: FakeEntity) => entity.name;

beforeEach(() => {
  selectionStore.clearAll();
});

describe('useRungSelection', () => {
  it('resolves selectedEntities against the full list, so a pick survives the list being filtered down and back', () => {
    const { result, rerender } = renderHook(
      ({ entities }: { entities: FakeEntity[] }) => useRungSelection('group', entities, nameOf),
      { initialProps: { entities: fullGroupList } },
    );

    act(() => {
      result.current.toggleSelect('00gFAKE0002');
    });
    expect(result.current.selectedEntities.map((e) => e.id)).toEqual(['00gFAKE0002']);

    rerender({ entities: [fullGroupList[0]] });
    expect(result.current.selectedIds.has('00gFAKE0002')).toBe(true);

    rerender({ entities: fullGroupList });
    expect(result.current.selectedEntities.map((e) => e.id)).toEqual(['00gFAKE0002']);
  });

  it('a group ticked through one rung hook shows up in a second, independently-rendered rung hook of the same kind', () => {
    const first = renderHook(() => useRungSelection('group', fullGroupList, nameOf));
    const second = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    act(() => {
      first.result.current.toggleSelect('00gFAKE0001');
    });

    expect(second.result.current.selectedIds.has('00gFAKE0001')).toBe(true);
    expect(second.result.current.selectedEntities.map((e) => e.id)).toEqual(['00gFAKE0001']);
  });

  it('a group hook does not report an entry ticked under kind user', () => {
    const users: FakeEntity[] = [{ id: '00uFAKE0001', name: 'user@example.com' }];
    const userHook = renderHook(() => useRungSelection('user', users, nameOf));
    const groupHook = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    act(() => {
      userHook.result.current.toggleSelect('00uFAKE0001');
    });

    expect(groupHook.result.current.selectedIds.size).toBe(0);
    expect(groupHook.result.current.selectedEntities).toEqual([]);
  });

  it('deselectAll on the group partition leaves a previously-ticked user entry untouched', () => {
    const users: FakeEntity[] = [{ id: '00uFAKE0001', name: 'user@example.com' }];
    const userHook = renderHook(() => useRungSelection('user', users, nameOf));
    const groupHook = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    act(() => {
      userHook.result.current.toggleSelect('00uFAKE0001');
      groupHook.result.current.toggleSelect('00gFAKE0001');
    });
    expect(userHook.result.current.selectedIds.size).toBe(1);
    expect(groupHook.result.current.selectedIds.size).toBe(1);

    act(() => {
      groupHook.result.current.deselectAll();
    });

    expect(groupHook.result.current.selectedIds.size).toBe(0);
    expect(userHook.result.current.selectedIds.has('00uFAKE0001')).toBe(true);
  });

  it('toggleSelect does nothing for an id not present in entities — there is no display name to record', () => {
    const { result } = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    act(() => {
      result.current.toggleSelect('00gNOTINLIST');
    });

    expect(result.current.selectedIds.size).toBe(0);
  });

  it('toggleSelect releases an entity that has since left entities, because unticking needs only identity', () => {
    const { result, rerender } = renderHook(
      ({ entities }: { entities: FakeEntity[] }) => useRungSelection('group', entities, nameOf),
      { initialProps: { entities: fullGroupList } },
    );

    act(() => {
      result.current.toggleSelect('00gFAKE0002');
    });
    expect(result.current.selectedIds.has('00gFAKE0002')).toBe(true);

    rerender({ entities: fullGroupList.filter((g) => g.id !== '00gFAKE0002') });

    act(() => {
      result.current.toggleSelect('00gFAKE0002');
    });

    expect(result.current.selectedIds.has('00gFAKE0002')).toBe(false);
  });

  it('replaceSelection returns the AddOutcome with the added count on a Select-all', () => {
    const { result } = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    let outcome;
    act(() => {
      outcome = result.current.replaceSelection(fullGroupList.map((g) => g.id));
    });

    expect(outcome).toMatchObject({ added: 3, alreadyPicked: 0, refused: 0 });
    expect(result.current.selectedIds.size).toBe(3);
  });

  it('replaceSelection replaces the partition rather than unioning with it — ids no longer in the new list are gone', () => {
    const { result } = renderHook(() => useRungSelection('group', fullGroupList, nameOf));

    act(() => {
      result.current.toggleSelect('00gFAKE0003');
    });
    expect(result.current.selectedIds.has('00gFAKE0003')).toBe(true);

    act(() => {
      result.current.replaceSelection(['00gFAKE0001', '00gFAKE0002']);
    });

    expect(result.current.selectedIds).toEqual(new Set(['00gFAKE0001', '00gFAKE0002']));
    expect(result.current.selectedIds.has('00gFAKE0003')).toBe(false);
  });
});
