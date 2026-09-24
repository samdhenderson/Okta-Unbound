import React from 'react';
import Icon from '../../sidepanel/components/shared/Icon';
import { CHROME_WEB_STORE_URL, EXTERNAL_LINK_PROPS } from '../links';

export interface InstallCtaProps {
  variant?: 'rail' | 'band';
}

const LINK =
  'inline-flex items-center gap-1.5 rounded-sm font-medium text-primary-text underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

const InstallCta: React.FC<InstallCtaProps> = ({ variant = 'rail' }) => {
  const link = (
    <a href={CHROME_WEB_STORE_URL} {...EXTERNAL_LINK_PROPS} className={LINK}>
      Install from the Chrome Web Store
      <Icon type="external-link" size="xs" />
    </a>
  );

  if (variant === 'rail') {
    return <p className="px-2 pb-3 text-[11px]">{link}</p>;
  }

  return (
    <p className="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700">
      Reading this on the web? Install Okta Unbound, then open the panel beside your Okta tab.{' '}
      <span className="whitespace-nowrap">{link}</span>
    </p>
  );
};

export default InstallCta;
