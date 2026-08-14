import { useEffect, useRef } from 'react';

export type OwedIdentity = string | number | null | undefined;

export function useOwedLoad(identity: OwedIdentity, ready: boolean, run: () => void): void {
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  const paidFor = useRef<OwedIdentity>(undefined);

  useEffect(() => {
    if (!ready || identity === null || identity === undefined) return;
    if (paidFor.current === identity) return;
    paidFor.current = identity;
    runRef.current();
  }, [identity, ready]);
}
