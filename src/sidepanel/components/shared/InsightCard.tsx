import React, { useId, useState } from 'react';
import ListRow from './ListRow';
import StretchedButton from './StretchedButton';
import Icon from './Icon';

export interface InsightCardProps {
  title: (titleId: string) => React.ReactNode;
  subject: string;
  revealName: string;
  badges?: React.ReactNode;
  headline?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  subject,
  revealName,
  badges,
  headline,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const bodyId = useId();
  const titleId = useId();

  return (
    <ListRow
      headerClassName="relative"
      body={
        <div id={bodyId} className="disclose" data-open={expanded} inert={!expanded || undefined}>
          <div>
            <div className="space-y-3 border-t border-neutral-100 px-(--sp-card) pb-(--sp-card) pt-3">
              {children}
            </div>
          </div>
        </div>
      }
    >
      <StretchedButton
        label={`${expanded ? 'Hide' : 'Show'} the ${revealName} for ${subject}`}
        describedBy={titleId}
        expanded={expanded}
        controls={bodyId}
        onClick={() => setExpanded((open) => !open)}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-(--sp-inline)">
          {title(titleId)}
          <Icon
            type="chevron-right"
            size="sm"
            aria-hidden="true"
            className={`shrink-0 text-neutral-400 transition-transform duration-(--dur-quick) ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>

        {badges}

        {headline}
      </div>
    </ListRow>
  );
};

export default InsightCard;
