import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupReferenceChip from './GroupReferenceChip';
import type { ClauseGroupReference } from '../../../shared/rules/explainExpression';

const satisfied: ClauseGroupReference = {
  match: 'id',
  value: '00gFAKECHIPTEST1',
  satisfied: true,
  matchedGroupName: 'Engineering',
};

const unsatisfied: ClauseGroupReference = {
  match: 'id',
  value: '00gFAKECHIPTEST9',
  satisfied: false,
};

describe('GroupReferenceChip', () => {
  const COPY_ICON_ONLY = 1;

  it('renders no satisfied/unsatisfied glyph at all when no context was supplied', () => {
    const { container } = render(<GroupReferenceChip reference={satisfied} hasContext={false} />);

    expect(container.querySelectorAll('svg')).toHaveLength(COPY_ICON_ONLY);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('renders the satisfied glyph when context was supplied and the reference is satisfied', () => {
    const { container } = render(<GroupReferenceChip reference={satisfied} hasContext />);
    expect(container.querySelectorAll('svg')).toHaveLength(COPY_ICON_ONLY + 1);
  });

  it('renders the unsatisfied glyph when context was supplied and the reference is not satisfied', () => {
    const { container } = render(<GroupReferenceChip reference={unsatisfied} hasContext />);
    expect(container.querySelectorAll('svg')).toHaveLength(COPY_ICON_ONLY + 1);
    expect(screen.getByText('00gFAKECHIPTEST9')).toBeInTheDocument();
  });
});
