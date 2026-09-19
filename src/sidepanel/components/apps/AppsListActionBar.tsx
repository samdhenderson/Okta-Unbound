import React from 'react';
import { ActionBar } from '../shared';

export interface AppsListActionBarProps {
  search?: React.ReactNode;
}

const AppsListActionBar: React.FC<AppsListActionBarProps> = ({ search }) => (
  <ActionBar
    ariaLabel="Actions for the applications list"
    actions={[]}
    subRow={search}
    testId="apps-list-action-bar"
  />
);

export default AppsListActionBar;
