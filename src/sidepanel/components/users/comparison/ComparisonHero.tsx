import React from 'react';
import { initialsOf, hueFromId } from '../../../../shared/utils/userDisplay';
import { similarityColor } from './comparisonAnalytics';
import { StableWidth } from '../../shared';
import type { OktaUser } from '../../../../shared/types';

interface ComparisonHeroProps {
  contextUser: OktaUser;
  comparedUser: OktaUser;
  contextName: string;
  comparedName: string;
  similarity: number;
  scopeNote?: string;
  isLoading: boolean;
}

const ComparisonHero: React.FC<ComparisonHeroProps> = ({
  contextUser,
  comparedUser,
  contextName,
  comparedName,
  similarity,
  scopeNote,
  isLoading,
}) => (
  <div className="overflow-hidden rounded-md border border-neutral-200 bg-gradient-to-br from-white via-white to-primary-light/40 p-(--sp-card)">
    <div className="flex items-center gap-2">
      <UserSide user={contextUser} name={contextName} label="Context" />
      <span className="shrink-0 text-sm text-neutral-400" aria-hidden>
        ⇄
      </span>
      <UserSide user={comparedUser} name={comparedName} label="Compared" align="right" />
    </div>

    <div className="mt-3 flex items-baseline justify-between gap-2">
      <span className="min-w-0 truncate text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {isLoading ? '· ·' : scopeNote ? `Match · ${scopeNote}` : 'Match'}
      </span>
      <StableWidth reserve="100%" align="end" className="shrink-0">
        <span
          className="font-mono text-sm leading-none font-bold tabular-nums"
          style={{ color: similarityColor(similarity) }}
        >
          {isLoading ? '··' : `${similarity}%`}
        </span>
      </StableWidth>
    </div>

    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-100" aria-hidden>
      {!isLoading && (
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(0, Math.min(100, similarity))}%`,
            backgroundColor: similarityColor(similarity),
          }}
        />
      )}
    </div>
  </div>
);

const UserSide: React.FC<{
  user: OktaUser;
  name: string;
  label: string;
  align?: 'left' | 'right';
}> = ({ user, name, label, align = 'left' }) => {
  const hue = hueFromId(user.id);
  const initials = initialsOf(user);
  const isRight = align === 'right';
  const contact = user.profile.email || user.profile.login;

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 ${isRight ? 'flex-row-reverse text-right' : 'text-left'}`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 65% 38%))`,
          fontFamily: 'var(--font-heading)',
        }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </div>
        <div
          className="truncate text-xs font-semibold text-neutral-900"
          title={`${name} · ${contact}`}
        >
          {name}
        </div>
      </div>
    </div>
  );
};

export default ComparisonHero;
