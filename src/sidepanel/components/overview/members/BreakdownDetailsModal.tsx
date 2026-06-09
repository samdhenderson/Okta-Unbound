import React from 'react';
import Modal from '../../shared/Modal';
import Button from '../../shared/Button';
import ScrollableList from '../../shared/ScrollableList';
import BreakdownReport from './BreakdownReport';
import type { BreakdownRow } from './memberAnalytics';

interface BreakdownDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  rows: BreakdownRow[];
  activeValues: Set<string>;
  onRowClick: (row: BreakdownRow) => void;
}

const BreakdownDetailsModal: React.FC<BreakdownDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  rows,
  activeValues,
  onRowClick,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-600">
          All {rows.length.toLocaleString()} values. Click any value to filter the member list by
          it.
        </p>
        <ScrollableList maxHeight="50vh" fillAvailable={false}>
          <BreakdownReport rows={rows} activeValues={activeValues} onRowClick={onRowClick} />
        </ScrollableList>
      </div>
    </Modal>
  );
};

export default BreakdownDetailsModal;
