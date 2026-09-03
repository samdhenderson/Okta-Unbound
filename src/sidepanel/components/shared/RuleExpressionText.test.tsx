import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RuleExpressionText from './RuleExpressionText';

const resolve = (groupId: string): string | undefined =>
  ({ '00gFAKE1': 'Engineering — Platform', '00gFAKE2': 'Contractors — EMEA' })[groupId];

describe('RuleExpressionText', () => {
  it('names a group id that resolves, and keeps the id copyable', () => {
    render(<RuleExpressionText text='isMemberOfAnyGroup("00gFAKE1")' resolveGroupName={resolve} />);

    expect(screen.getByText('Engineering — Platform')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy group id 00gFAKE1' })).toBeInTheDocument();
    expect(screen.queryByText(/00gFAKE1"/)).not.toBeInTheDocument();
  });

  it('leaves an id the resolver cannot name as raw text', () => {
    render(<RuleExpressionText text='isMemberOfGroup("00gFAKE9")' resolveGroupName={resolve} />);

    expect(screen.getByText('isMemberOfGroup("00gFAKE9")')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the whole expression verbatim when no resolver is given', () => {
    render(<RuleExpressionText text='isMemberOfGroup("00gFAKE1")' />);

    expect(screen.getByText('isMemberOfGroup("00gFAKE1")')).toBeInTheDocument();
    expect(screen.queryByText('Engineering — Platform')).not.toBeInTheDocument();
  });

  it('names each resolvable id in a mixed expression and leaves the rest alone', () => {
    const { container } = render(
      <RuleExpressionText
        text='isMemberOfAnyGroup("00gFAKE1", "00gFAKE9", "00gFAKE2") && user.department == "Engineering"'
        resolveGroupName={resolve}
      />,
    );

    expect(screen.getByText('Engineering — Platform')).toBeInTheDocument();
    expect(screen.getByText('Contractors — EMEA')).toBeInTheDocument();
    expect(container.textContent).toContain('"00gFAKE9"');
    expect(container.textContent).toContain('user.department == "Engineering"');
  });

  it('renders untrusted expression text as text, not markup', () => {
    const text = 'user.department == "<img src=x onerror=alert(1)>"';
    const { container } = render(<RuleExpressionText text={text} resolveGroupName={resolve} />);

    expect(screen.getByText(text)).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });
});
