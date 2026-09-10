import React from 'react';
import Icon from '../shared/Icon';
import { oktaAdminEntityUrl, type OktaAdminTarget } from '../../../shared/utils/oktaUrl';

interface OpenInOktaLinkProps {
  oktaOrigin?: string | null;
  target: OktaAdminTarget;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-3 py-1.5 text-sm gap-2',
};

const OpenInOktaLink: React.FC<OpenInOktaLinkProps> = ({
  oktaOrigin,
  target,
  label = 'Open in Okta',
  size = 'sm',
  className = '',
}) => {
  const href = oktaAdminEntityUrl(oktaOrigin, target);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open this ${target.type} in the Okta Admin Console`}
      className={`inline-flex items-center ${sizeClasses[size]} font-medium bg-white text-neutral-700 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:border-neutral-500 transition-colors duration-(--dur-instant) ${className}`}
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <span>{label}</span>
      <Icon type="external-link" size="sm" />
    </a>
  );
};

export default OpenInOktaLink;
