import { useCallback, useState } from 'react';
import type { AlertMessageData } from '../components/shared/AlertMessage';
import type { Actor } from './useOktaApi/core';

export const ACTOR_UNAVAILABLE_TEXT =
  "Couldn't confirm your signed-in identity. This action will be recorded without an actor.";

export const ACTOR_UNAVAILABLE_NOTICE: AlertMessageData = {
  text: ACTOR_UNAVAILABLE_TEXT,
  type: 'warning',
};

export interface UseActorNoticeReturn {
  actorNotice: AlertMessageData | null;
  noteActor: (actor: Actor) => void;
  dismissActorNotice: () => void;
}

export function useActorNotice(): UseActorNoticeReturn {
  const [actorNotice, setActorNotice] = useState<AlertMessageData | null>(null);

  const noteActor = useCallback((actor: Actor) => {
    setActorNotice(actor.kind === 'resolved' ? null : ACTOR_UNAVAILABLE_NOTICE);
  }, []);

  const dismissActorNotice = useCallback(() => setActorNotice(null), []);

  return { actorNotice, noteActor, dismissActorNotice };
}
