import React from 'react';
import ListRow from '../shared/ListRow';
import OpenInOktaLink from '../shared/OpenInOktaLink';
import Icon from '../shared/Icon';
import { destinationLabel, KIND_ICON } from './jumpDestinations';
import type { JumpResult } from '../../hooks/useJumpResolver';
import type { OktaAdminEntityType } from '../../../shared/utils/oktaUrl';

export interface JumpResultRowProps {
  result: JumpResult;
  onSelect?: (result: JumpResult) => void;
  oktaOrigin?: string | null;
}

const OKTA_LINK_TYPE: Partial<Record<JumpResult['kind'], OktaAdminEntityType>> = {
  group: 'group',
  user: 'user',
  app: 'app',
};

const JumpResultRow: React.FC<JumpResultRowProps> = ({ result, onSelect, oktaOrigin }) => {
  const linkType = OKTA_LINK_TYPE[result.kind];

  const mark = onSelect ? (
    <span className="text-xs font-medium text-neutral-600 shrink-0">
      {destinationLabel(result.kind)} ›
    </span>
  ) : linkType ? (
    <OpenInOktaLink oktaOrigin={oktaOrigin} entityType={linkType} entityId={result.id} size="sm" />
  ) : null;

  return (
    <ListRow
      as={onSelect ? 'button' : 'div'}
      density="comfortable"
      onClick={onSelect ? () => onSelect(result) : undefined}
      ariaLabel={onSelect ? `${result.name} — open in ${destinationLabel(result.kind)}` : undefined}
    >
      <div className="flex items-center gap-3 min-w-0 w-full">
        <Icon type={KIND_ICON[result.kind]} size="sm" className="text-neutral-500 shrink-0" />
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm font-medium text-neutral-900 truncate">{result.name}</div>
          {result.secondary && (
            <div className="text-xs text-neutral-600 truncate">{result.secondary}</div>
          )}
        </div>
        {mark}
      </div>
    </ListRow>
  );
};

export default JumpResultRow;
