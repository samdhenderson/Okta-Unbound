import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export function sceneId(title: string): string {
  return `feature-${slug(title)}`;
}

export function sceneHeadingId(title: string): string {
  return `scene-${slug(title)}`;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export interface SceneEntry {
  id: string;
  title: string;
}

interface SceneRegistry {
  scenes: ReadonlyArray<SceneEntry>;
  active: string | null;
  register: (entry: SceneEntry, element: HTMLElement) => () => void;
}

const noop = () => {};

const SceneRegistryContext = createContext<SceneRegistry>({
  scenes: [],
  active: null,
  register: () => noop,
});

function inDocumentOrder(entries: Map<string, { entry: SceneEntry; element: HTMLElement }>) {
  return [...entries.values()]
    .sort((a, b) =>
      a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    .map((item) => item.entry);
}

export const SceneRegistryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const items = useRef(new Map<string, { entry: SceneEntry; element: HTMLElement }>());
  const [scenes, setScenes] = useState<ReadonlyArray<SceneEntry>>([]);
  const [active, setActive] = useState<string | null>(null);
  const ratios = useRef(new Map<string, number>());
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          ratios.current.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        let best: string | null = null;
        let bestRatio = 0.2;
        ratios.current.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        setActive(best);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    observer.current = io;
    items.current.forEach(({ element }) => io.observe(element));
    return () => {
      io.disconnect();
      observer.current = null;
    };
  }, []);

  const register = useCallback((entry: SceneEntry, element: HTMLElement) => {
    items.current.set(entry.id, { entry, element });
    observer.current?.observe(element);
    setScenes(inDocumentOrder(items.current));
    return () => {
      items.current.delete(entry.id);
      ratios.current.delete(entry.id);
      observer.current?.unobserve(element);
      setScenes(inDocumentOrder(items.current));
    };
  }, []);

  const value = useMemo(() => ({ scenes, active, register }), [scenes, active, register]);
  return <SceneRegistryContext.Provider value={value}>{children}</SceneRegistryContext.Provider>;
};

export function useSceneRegistry(): SceneRegistry {
  return useContext(SceneRegistryContext);
}

export function useRegisterScene(entry: SceneEntry, element: HTMLElement | null): void {
  const { register } = useContext(SceneRegistryContext);
  const { id, title } = entry;
  useEffect(() => {
    if (!element) return;
    return register({ id, title }, element);
  }, [register, id, title, element]);
}
