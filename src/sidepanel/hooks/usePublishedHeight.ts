import { useEffect, type RefObject } from 'react';

export interface UsePublishedHeightOptions {
  scopeSelector?: string;
  enabled?: boolean;
}

export function usePublishedHeight(
  ref: RefObject<HTMLElement | null>,
  variable: string,
  options: UsePublishedHeightOptions = {},
): void {
  const { scopeSelector, enabled = true } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled || typeof ResizeObserver !== 'function') return;

    const scope = scopeSelector
      ? (node.closest(scopeSelector) as HTMLElement | null)
      : document.documentElement;
    if (!scope) return;

    const publish = () => {
      scope.style.setProperty(variable, `${Math.round(node.getBoundingClientRect().height)}px`);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => {
      observer.disconnect();
      scope.style.removeProperty(variable);
    };
  }, [ref, variable, scopeSelector, enabled]);
}
