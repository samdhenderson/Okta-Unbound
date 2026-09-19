import React from 'react';
import { ActionBar } from '../shared';

export interface PoliciesListActionBarProps {
  search?: React.ReactNode;
}

const PoliciesListActionBar: React.FC<PoliciesListActionBarProps> = ({ search }) => (
  <ActionBar
    ariaLabel="Actions for the auth policies list"
    actions={[]}
    subRow={search}
    testId="policies-list-action-bar"
  />
);

export default PoliciesListActionBar;
