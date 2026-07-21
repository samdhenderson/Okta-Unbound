import React from 'react';
import { Input } from '../shared';
import type { ExportMatchCount } from '../../hooks/useExportTab';

interface ExportFilterBoxProps {
  value: string;
  onChange: (value: string) => void;
  help: string;
  placeholder: string;
  matchCount: ExportMatchCount | null;
  matchCountLoading: boolean;
  disabled?: boolean;
}

const MatchCountLine: React.FC<{
  loading: boolean;
  matchCount: ExportMatchCount | null;
}> = ({ loading, matchCount }) => {
  if (loading) {
    return <span className="text-xs text-neutral-500">Checking…</span>;
  }
  if (!matchCount) return null;
  if (matchCount.count === 0) {
    return <span className="text-xs font-medium text-warning-text">No matches</span>;
  }
  return (
    <span className="text-xs font-medium text-neutral-700">
      {matchCount.count}
      {matchCount.hasMore ? '+' : ''} matching
    </span>
  );
};

const ExportFilterBox: React.FC<ExportFilterBoxProps> = ({
  value,
  onChange,
  help,
  placeholder,
  matchCount,
  matchCountLoading,
  disabled = false,
}) => {
  return (
    <div className="space-y-1.5">
      <Input
        label="Filter"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        hint={help}
        disabled={disabled}
      />
      <div className="min-h-4">
        <MatchCountLine loading={matchCountLoading} matchCount={matchCount} />
      </div>
    </div>
  );
};

export default ExportFilterBox;
