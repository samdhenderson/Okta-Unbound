import { useScheduler } from '../contexts/SchedulerContext';

export function useSessionExpiry(targetTabId: number | null): boolean {
  const { state } = useScheduler();
  if (targetTabId === null) return false;
  return (state?.expiredSessionTabIds ?? []).includes(targetTabId);
}
