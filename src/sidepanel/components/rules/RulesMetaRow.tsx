import React from 'react';

interface RulesMetaRowProps {
  apiCost: number | null;
}

const RulesMetaRow: React.FC<RulesMetaRowProps> = ({ apiCost }) => {
  if (apiCost === null) return null;

  return (
    <div className="flex gap-(--sp-inline) flex-wrap">
      <div className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
          API Requests:
        </span>
        <span className="text-sm font-bold text-primary-text">{apiCost}</span>
      </div>
    </div>
  );
};

export default RulesMetaRow;
