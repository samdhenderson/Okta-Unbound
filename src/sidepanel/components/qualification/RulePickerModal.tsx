import { useMemo, useState } from 'react';
import { Badge, Input, ListRow, Modal } from '../shared';
import type { MembershipRule } from '../../../shared/types';

export interface RulePickerModalProps<T extends MembershipRule = MembershipRule> {
  isOpen: boolean;
  onClose: () => void;
  rules: readonly T[];
  onPick: (rule: T) => void;
  title?: string;
}

function RulePickerModal<T extends MembershipRule>({
  isOpen,
  onClose,
  rules,
  onPick,
  title = 'Check a rule',
}: RulePickerModalProps<T>) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const shown = useMemo(
    () =>
      needle === '' ? rules : rules.filter((rule) => rule.name.toLowerCase().includes(needle)),
    [rules, needle],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-3">
        <Input
          type="search"
          value={query}
          onChange={setQuery}
          placeholder="Filter rules by name"
          ariaLabel="Filter rules by name"
          hint={`${rules.length} ${rules.length === 1 ? 'rule' : 'rules'} loaded. No request is made.`}
        />
        {shown.length === 0 ? (
          <p className="text-sm text-neutral-600">No rule name contains “{query.trim()}”.</p>
        ) : (
          <ul className="max-h-80 space-y-1 overflow-y-auto" aria-label="Rules">
            {shown.map((rule) => (
              <li key={rule.id}>
                <ListRow as="button" density="compact" onClick={() => onPick(rule)}>
                  <span className="flex w-full items-center justify-between gap-2">
                    <span
                      className="min-w-0 flex-1 truncate text-left text-sm text-neutral-900"
                      title={rule.name}
                    >
                      {rule.name}
                    </span>
                    {rule.status !== 'ACTIVE' && (
                      <Badge variant="warning">
                        {rule.status === 'INVALID' ? 'Invalid' : 'Inactive'}
                      </Badge>
                    )}
                  </span>
                </ListRow>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default RulePickerModal;
