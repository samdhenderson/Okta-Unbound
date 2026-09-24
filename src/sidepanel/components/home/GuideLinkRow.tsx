import React from 'react';
import { Button } from '../shared';
import Icon from '../shared/Icon';
import { newIssueUrl } from '../../../shared/githubLinks';

export interface GuideLinkRowProps {
  onOpenGuide: () => void;
}

const FEEDBACK_URL = newIssueUrl('Feedback: ');

const GuideLinkRow: React.FC<GuideLinkRowProps> = ({ onOpenGuide }) => (
  <nav aria-label="Help" className="flex items-center gap-6 px-(--sp-row-x)">
    <Button variant="link" size="sm" icon="book" onClick={onOpenGuide}>
      User guide
    </Button>
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-9 items-center gap-2 rounded-sm py-1.5 text-xs font-medium text-primary-text underline-offset-2 transition-colors duration-(--dur-instant) hover:text-primary-dark hover:underline focus:outline-2 focus:outline-offset-2 focus:outline-primary"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      Send feedback
      <Icon type="external-link" size="sm" />
    </a>
  </nav>
);

export default GuideLinkRow;
