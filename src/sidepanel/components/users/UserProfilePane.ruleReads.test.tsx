import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfilePane from './UserProfilePane';
import type { AttributeDescriptor } from './profileAttributes';
import type { ProfileDisplayConfig } from '../../../shared/storage/profileDisplayStore';

const attribute = (name: string, label: string, value: string): AttributeDescriptor => ({
  key: `profile.${name}`,
  name,
  label,
  kind: 'base',
  value,
  raw: value,
  isEmpty: value === '',
});

const ATTRIBUTES: AttributeDescriptor[] = [
  attribute('department', 'Department', 'Engineering'),
  attribute('title', 'Title', 'Staff Platform Engineer'),
];

const CONFIG: ProfileDisplayConfig = {
  layout: 'rows',
  showApiNames: false,
  showRuleChips: true,
  showEmpty: false,
  categories: [{ key: 'organization', name: 'Organization' }],
  assign: { department: 'organization', title: 'organization' },
  attrOrder: ['department', 'title'],
  hidden: {},
};

describe('the Profile pane withholds the rule-read axis when no rule was consulted', () => {
  it('omits the count and stands the filter down', async () => {
    render(<UserProfilePane attributes={ATTRIBUTES} config={CONFIG} ruleReads={undefined} />);

    expect(screen.getByText(/2 of 2 attributes shown/)).toBeInTheDocument();
    expect(screen.queryByText(/read by rules that grant access/)).not.toBeInTheDocument();

    const pill = screen.getByRole('button', { name: 'Used by rules' });
    expect(pill).toHaveAttribute('aria-disabled', 'true');
    expect(pill).toHaveAccessibleDescription(
      'The group rules have not been read, so which attributes they use is unknown.',
    );

    pill.focus();
    expect(pill).toHaveFocus();

    await userEvent.click(pill);
    expect(pill).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(/2 of 2 attributes shown/)).toBeInTheDocument();

    expect(screen.queryByText(/^\d+ rules?$/)).not.toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Staff Platform Engineer')).toBeInTheDocument();
  });

  it('states a zero that was actually established', () => {
    render(<UserProfilePane attributes={ATTRIBUTES} config={CONFIG} ruleReads={{}} />);

    expect(screen.getByText(/0 read by rules that grant access/)).toBeInTheDocument();
    const pill = screen.getByRole('button', { name: 'Used by rules' });
    expect(pill).toBeEnabled();
    expect(pill).not.toHaveAttribute('aria-disabled');
  });

  it('counts and marks the attributes a granting rule reads', () => {
    render(
      <UserProfilePane
        attributes={ATTRIBUTES}
        config={CONFIG}
        ruleReads={{ department: ['Engineering → VPN Access'] }}
      />,
    );

    expect(screen.getByText(/1 read by rules that grant access/)).toBeInTheDocument();
    expect(screen.getByText('1 rule')).toBeInTheDocument();
  });
});
