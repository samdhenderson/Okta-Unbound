import React from 'react';
import { AlertMessage, LoadingSpinner } from '../shared';
import type { QualificationSubjectState } from '../../hooks/useQualificationSubject';

export interface QualificationSubjectStatusProps {
  state: QualificationSubjectState;
}

const FAILURE_TEXT = {
  'user-not-found':
    'The user could not be loaded. They may have been deleted, or the response did not validate.',
  'groups-failed': "The user's group list could not be loaded, so no verdict can be stated.",
  'no-tab': 'No Okta tab is available to read the user from.',
} as const;

const QualificationSubjectStatus: React.FC<QualificationSubjectStatusProps> = ({ state }) => {
  if (state.status === 'loading') {
    return <LoadingSpinner size="sm" centered message="Reading the user and their groups…" />;
  }
  if (state.status === 'failed') {
    return <AlertMessage message={{ text: FAILURE_TEXT[state.reason], type: 'danger' }} />;
  }
  return null;
};

export default QualificationSubjectStatus;
