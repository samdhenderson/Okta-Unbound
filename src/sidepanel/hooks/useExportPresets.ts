import { useCallback, useEffect, useState } from 'react';
import { presetStore, type ExportPreset } from '@/shared/storage/presetStore';

export interface UseExportPresets {
  presets: ExportPreset[];
  save: (
    name: string,
    enabledColumnIds: string[],
    filterText?: string,
  ) => Promise<ExportPreset | null>;
  remove: (id: string) => Promise<void>;
  loadLastUsed: () => Promise<{ enabledColumnIds: string[] } | null>;
  saveLastUsed: (enabledColumnIds: string[]) => Promise<void>;
  reconcile: (ids: string[]) => string[];
}

export function useExportPresets(entityId: string, validColumnIds: string[]): UseExportPresets {
  const [presets, setPresets] = useState<ExportPreset[]>([]);
  const validKey = validColumnIds.join(',');

  const reconcile = useCallback(
    (ids: string[]): string[] => {
      const valid = new Set(validColumnIds);
      return ids.filter((id) => valid.has(id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validKey],
  );

  const refresh = useCallback(async () => {
    const list = await presetStore.listPresets(entityId);
    setPresets(list);
  }, [entityId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (name: string, enabledColumnIds: string[], filterText?: string) => {
      const preset = await presetStore.savePreset({ entityId, name, enabledColumnIds, filterText });
      await refresh();
      return preset;
    },
    [entityId, refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await presetStore.deletePreset(id);
      await refresh();
    },
    [refresh],
  );

  const loadLastUsed = useCallback(async () => {
    const last = await presetStore.getLastUsed(entityId);
    if (!last) return null;
    return { enabledColumnIds: reconcile(last.enabledColumnIds) };
  }, [entityId, reconcile]);

  const saveLastUsed = useCallback(
    async (enabledColumnIds: string[]) => {
      await presetStore.setLastUsed(entityId, enabledColumnIds);
    },
    [entityId],
  );

  return { presets, save, remove, loadLastUsed, saveLastUsed, reconcile };
}
