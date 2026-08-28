import React from 'react';
import StatCard from '../shared/StatCard';
import type { RuleStats } from '../../../shared/types';

interface RulesStatsGridProps {
  stats: RuleStats;
}

const RulesStatsGrid: React.FC<RulesStatsGridProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard title="Total Rules" value={stats.total} color="neutral" icon="list" />
    <StatCard title="Active" value={stats.active} color="success" icon="check" />
    <StatCard title="Inactive" value={stats.inactive} color="neutral" icon="pause" />
    <StatCard
      title="Conflicts"
      value={stats.conflicts}
      color={stats.conflicts > 0 ? 'warning' : 'neutral'}
      icon="alert"
    />
  </div>
);

export default RulesStatsGrid;
