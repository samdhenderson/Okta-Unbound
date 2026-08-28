import React from 'react';
import { formatDate } from '../../../shared/utils/dateFormat';

interface RulesMetaRowProps {
  apiCost: number | null;
  lastFetchTime: string | null;
  hasRules: boolean;
}

const RulesMetaRow: React.FC<RulesMetaRowProps> = ({ apiCost, lastFetchTime, hasRules }) => {
  if (apiCost === null && !(lastFetchTime && hasRules)) return null;

  return (
    <div className="flex gap-(--sp-inline) flex-wrap">
      {apiCost !== null && (
        <div className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            API Requests:
          </span>
          <span className="text-sm font-bold text-primary-text">{apiCost}</span>
        </div>
      )}
      {lastFetchTime && hasRules && (
        <div className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
            Cached:
          </span>
          <span className="text-sm font-mono text-neutral-700">{formatDate(lastFetchTime)}</span>
        </div>
      )}
    </div>
  );
};

export default RulesMetaRow;
