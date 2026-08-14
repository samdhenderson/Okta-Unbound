import { useCallback, useEffect, useState } from 'react';

export interface CommandPaletteControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export function useCommandPalette(): CommandPaletteControls {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.altKey || !(event.metaKey || event.ctrlKey)) return;
      if (event.key !== 'k' && event.key !== 'K') return;
      if (event.repeat) return;
      event.preventDefault();
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, open, close };
}
