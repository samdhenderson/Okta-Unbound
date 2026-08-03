import { useCallback, useEffect, useRef, useState } from 'react';

const COPIED_RESET_MS = 1500;

export interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => void;
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        if (timerRef.current !== null) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
      },
      () => {
        // Clipboard can be blocked (permissions / insecure context); fail quietly.
      },
    );
  }, []);

  return { copied, copy };
}
