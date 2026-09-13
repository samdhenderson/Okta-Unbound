import React from 'react';
import SelectionSummaryButton from '../components/shared/SelectionSummaryButton';
import { useSelection } from './useSelection';

export interface SelectionSummaryProps {
  onOpen: () => void;
}

const SelectionSummary: React.FC<SelectionSummaryProps> = ({ onOpen }) => {
  const { total, counts } = useSelection();
  return <SelectionSummaryButton total={total} counts={counts} onOpen={onOpen} />;
};

export default SelectionSummary;
