import React from 'react';
import Icon from '../../sidepanel/components/shared/Icon';
import { EXTERNAL_LINK_PROPS } from '../links';

export interface FeedbackLinkProps {
  href: string;
  children: React.ReactNode;
}

const FeedbackLink: React.FC<FeedbackLinkProps> = ({ href, children }) => (
  <a
    href={href}
    {...EXTERNAL_LINK_PROPS}
    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-text underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
  >
    {children}
    <Icon type="external-link" size="xs" />
  </a>
);

export default FeedbackLink;
