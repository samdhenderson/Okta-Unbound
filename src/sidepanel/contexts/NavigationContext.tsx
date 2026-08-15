import React, { createContext, useContext, useMemo, type ReactNode } from 'react';

export type EntityType = 'rule' | 'group' | 'user' | 'app' | 'policy';

export interface EntityRef {
  type: EntityType;
  id: string;
}

export type NavigationHandlers = Partial<Record<EntityType, (id: string) => void>>;

export interface EntityNavigation {
  navigateTo: (ref: EntityRef) => void;
  canNavigateTo: (type: EntityType) => boolean;
}

const NO_NAVIGATION: EntityNavigation = {
  navigateTo: () => {},
  canNavigateTo: () => false,
};

const NavigationContext = createContext<EntityNavigation>(NO_NAVIGATION);

export interface NavigationProviderProps {
  handlers: NavigationHandlers;
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ handlers, children }) => {
  const value = useMemo<EntityNavigation>(
    () => ({
      navigateTo: ({ type, id }) => handlers[type]?.(id),
      canNavigateTo: (type) => typeof handlers[type] === 'function',
    }),
    [handlers],
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useEntityNavigation = (): EntityNavigation => useContext(NavigationContext);
