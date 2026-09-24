import { useCallback, useEffect, useState } from 'react';
import { type ChapterId, hashFor, parseHash } from './chapters';

export interface HashRoute {
  chapter: ChapterId;
  navigate: (id: ChapterId) => void;
}

export function useHashRoute(): HashRoute {
  const [chapter, setChapter] = useState<ChapterId>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setChapter(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((id: ChapterId) => {
    window.location.hash = hashFor(id);
  }, []);

  return { chapter, navigate };
}
