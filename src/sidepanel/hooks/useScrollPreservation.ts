import { useCallback, useLayoutEffect, useRef } from 'react';
import type React from 'react';

export function useScrollPreservation(
  scrollRef: React.RefObject<HTMLElement | null>,
  visible: boolean,
): () => void {
  const savedTop = useRef(0);
  const wasVisible = useRef(visible);

  const capture = useCallback(() => {
    const node = scrollRef.current;
    if (node) savedTop.current = node.scrollTop;
  }, [scrollRef]);

  useLayoutEffect(() => {
    const becameVisible = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!becameVisible) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = savedTop.current;
  }, [visible, scrollRef]);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!visible || !node) return;
    const onScroll = () => {
      savedTop.current = node.scrollTop;
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => node.removeEventListener('scroll', onScroll);
  }, [visible, scrollRef]);

  return capture;
}
