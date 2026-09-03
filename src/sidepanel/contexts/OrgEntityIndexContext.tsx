import React, { createContext, useContext, type ReactNode } from 'react';
import {
  useOrgEntityIndexSource,
  type OrgEntityIndex,
  type UseOrgEntityIndexSourceOptions,
} from '../hooks/useOrgEntityIndex';

const OrgEntityIndexContext = createContext<OrgEntityIndex | undefined>(undefined);

export interface OrgEntityIndexProviderProps extends UseOrgEntityIndexSourceOptions {
  children: ReactNode;
}

export const OrgEntityIndexProvider: React.FC<OrgEntityIndexProviderProps> = ({
  oktaOrigin,
  targetTabId,
  enabled = true,
  children,
}) => {
  const index = useOrgEntityIndexSource({ oktaOrigin, targetTabId, enabled });
  return <OrgEntityIndexContext.Provider value={index}>{children}</OrgEntityIndexContext.Provider>;
};

export const useOrgEntityIndex = (): OrgEntityIndex => {
  const index = useContext(OrgEntityIndexContext);
  if (!index) {
    throw new Error('useOrgEntityIndex must be used within an OrgEntityIndexProvider');
  }
  return index;
};
