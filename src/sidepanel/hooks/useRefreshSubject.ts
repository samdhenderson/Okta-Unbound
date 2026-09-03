import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

export interface RefreshSubject {
  name: string;
  run: () => void;
}

interface Entry {
  name: string;
  runRef: { current: () => void };
}

let stack: Entry[] = [];
const listeners = new Set<() => void>();

function currentEntry(): Entry | null {
  return stack.length > 0 ? stack[stack.length - 1] : null;
}

let snapshot: RefreshSubject | null = null;

function republish(): void {
  const entry = currentEntry();
  if (entry === null) {
    if (snapshot === null) return;
    snapshot = null;
  } else if (snapshot === null || snapshot.name !== entry.name) {
    snapshot = { name: entry.name, run: () => entry.runRef.current() };
  } else {
    return;
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): RefreshSubject | null {
  return snapshot;
}

export function useRefreshSubject(name: string | null, run: () => void, enabled = true): void {
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  useEffect(() => {
    if (!enabled || name === null) return;
    const entry: Entry = { name, runRef };
    stack = [...stack, entry];
    republish();
    return () => {
      stack = stack.filter((candidate) => candidate !== entry);
      republish();
    };
  }, [name, enabled]);
}

export function useCurrentRefreshSubject(): RefreshSubject | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useAppRefresh(
  refetchPageContext: () => Promise<unknown> | void,
  isPinned: boolean,
): { subjectName: string | null; refresh: () => void } {
  const subject = useCurrentRefreshSubject();
  const refresh = useCallback(() => {
    if (!isPinned) void refetchPageContext();
    subject?.run();
  }, [isPinned, refetchPageContext, subject]);

  return { subjectName: subject?.name ?? null, refresh };
}
