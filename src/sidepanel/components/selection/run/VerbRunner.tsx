import React from 'react';
import { Button, Input, ListRow, LoadingSpinner, Modal, Select } from '../../shared';
import AttributeSpreadBar from '../../groups/detail/AttributeSpreadBar';
import BreakdownReport from '../../members/BreakdownReport';
import { costSentence } from '../../../selection/verbs/costSentence';
import { downloadCSV, generateCSV, sanitizeFilename } from '../../../../shared/utils/csvUtils';
import type { VerbRun } from './useVerbRun';
import type { VerbDetail, VerbField } from '../../../selection/verbs/types';
import type { SelectionBasket } from '../../../selection/selectionStore';

export interface VerbRunnerProps {
  run: VerbRun;
  basket: SelectionBasket;
}

const EMPTY_ACTIVE: Set<string> = new Set();

function download(detail: VerbDetail): void {
  const csv = generateCSV(
    [...detail.headers],
    detail.rows.map((row) => [...row]),
  );
  downloadCSV(csv, `${sanitizeFilename(detail.filenameStem)}.csv`);
}

interface ComposeFieldProps {
  field: VerbField;
  value: string;
  onChange: (value: string) => void;
}

const ComposeField: React.FC<ComposeFieldProps> = ({ field, value, onChange }) => {
  const spread = field.distribution;

  if (field.options && field.optionLayout === 'list') {
    return (
      <div className="space-y-(--sp-inline)">
        <p className="text-sm font-medium text-neutral-800">{field.label}</p>
        {field.help && <p className="text-xs text-neutral-600">{field.help}</p>}
        <div
          role="radiogroup"
          aria-label={field.label}
          className="max-h-[min(22rem,45vh)] overflow-y-auto space-y-(--sp-inline) pr-0.5"
        >
          {field.options.map((option) => (
            <ListRow
              key={option.value}
              as="button"
              role="radio"
              ariaChecked={option.value === value}
              state={option.value === value ? 'selected' : 'default'}
              density="compact"
              onClick={() => onChange(option.value)}
            >
              <span className="flex items-baseline justify-between gap-(--sp-inline)">
                <span className="truncate text-sm text-neutral-900">{option.label}</span>
                {option.summary && (
                  <span className="shrink-0 text-xs text-neutral-600">{option.summary}</span>
                )}
              </span>
              {option.distribution && (
                <AttributeSpreadBar rows={option.distribution} className="mt-(--sp-inline)" />
              )}
            </ListRow>
          ))}
        </div>
      </div>
    );
  }

  if (field.options) {
    return (
      <div className="space-y-(--sp-inline)">
        {spread && <BreakdownReport rows={[...spread]} activeValues={EMPTY_ACTIVE} />}
        <Select
          label={field.label}
          value={value}
          onChange={onChange}
          options={[
            { value: '', label: 'Choose one' },
            ...field.options.map((option) => ({ value: option.value, label: option.label })),
          ]}
        />
        {field.help && <p className="text-xs text-neutral-600">{field.help}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-(--sp-inline)">
      {spread && <BreakdownReport rows={[...spread]} activeValues={EMPTY_ACTIVE} />}
      <Input
        label={field.label}
        value={value}
        onChange={onChange}
        placeholder={field.placeholder}
        hint={field.help}
        type={field.control === 'number' ? 'number' : 'text'}
      />
    </div>
  );
};

const VerbRunner: React.FC<VerbRunnerProps> = ({ run, basket }) => {
  const { verb, stage, preflight, progress, outcome, error, confirm, close } = run;
  const { fields, values, setValue, isComposed, isRefreshing, submitFields } = run;
  if (!verb || stage === 'idle') return null;

  const isWorking = stage === 'preparing' || stage === 'measuring' || stage === 'running';
  const refusal = preflight?.refusal;
  const detail: VerbDetail | undefined = outcome?.detail;
  const cost = preflight?.cost ?? verb.cost(basket);

  const title =
    stage === 'results'
      ? error
        ? 'The run stopped'
        : 'What happened'
      : stage === 'preparing'
        ? 'Loading the options'
        : stage === 'measuring'
          ? 'Measuring first'
          : stage === 'running'
            ? 'Running'
            : verb.title;

  return (
    <Modal
      isOpen
      onClose={close}
      title={title}
      size={fields.some((field) => field.optionLayout === 'list') ? 'md' : 'sm'}
    >
      {stage === 'preparing' && (
        <div className="flex items-start gap-(--sp-field)">
          <LoadingSpinner size="sm" className="mt-0.5 shrink-0" />
          <p className="text-sm text-neutral-700">
            Reading what this org allows and what the selected users hold now, so every attribute
            offered is one you can write and one you can see the spread of.
          </p>
        </div>
      )}

      {stage === 'compose' && (
        <div className="space-y-(--sp-field)">
          {fields.map((field) => (
            <ComposeField
              key={field.id}
              field={field}
              value={values[field.id] ?? ''}
              onChange={(next) => setValue(field.id, next)}
            />
          ))}

          {isRefreshing && (
            <div className="flex items-center gap-(--sp-inline)">
              <LoadingSpinner size="sm" className="shrink-0" />
              <p className="text-xs text-neutral-600">Reading what that attribute accepts…</p>
            </div>
          )}
        </div>
      )}

      {stage === 'measuring' && (
        <div className="flex items-start gap-(--sp-field)">
          <LoadingSpinner size="sm" className="mt-0.5 shrink-0" />
          <div className="space-y-(--sp-inline)">
            <p className="text-sm text-neutral-700">
              Counting what this would change, so the confirmation can state it. Nothing has been
              changed yet.
            </p>
            {progress && <p className="text-xs text-neutral-600">{progress}</p>}
          </div>
        </div>
      )}

      {stage === 'confirm' && (
        <div className="space-y-(--sp-inline)">
          {preflight && preflight.lines.length > 0 && (
            <ul className="space-y-(--sp-inline) text-sm text-neutral-700">
              {preflight.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}

          {preflight && preflight.items === 0 && !refusal && (
            <p className="text-sm text-neutral-700">
              Nothing in this selection needs it. Running it would change nothing.
            </p>
          )}

          {!(refusal && preflight?.items === 0 && cost.requests === 0 && cost.writes === 0) && (
            <p className="text-sm text-neutral-700">{costSentence(cost)}</p>
          )}

          {verb.path === 'write' && !refusal && (
            <p className="text-xs text-danger-text">
              This cannot be undone from here. Putting the members back is a new run with its own
              cost and confirmation.
            </p>
          )}

          {refusal && <p className="text-sm text-danger-text">{refusal.message}</p>}
        </div>
      )}

      {stage === 'running' && (
        <div className="flex items-start gap-(--sp-field)">
          <LoadingSpinner size="sm" className="mt-0.5 shrink-0" />
          <div className="space-y-(--sp-inline)">
            <p className="text-sm text-neutral-700">
              Closing this does not stop the run. It stays visible in the activity bar, which is
              where it can be cancelled.
            </p>
            {progress && <p className="text-xs text-neutral-600">{progress}</p>}
          </div>
        </div>
      )}

      {stage === 'results' && (
        <div className="space-y-(--sp-inline)">
          <p className="text-sm text-neutral-700">{error ?? outcome?.summary}</p>
          {detail && (
            <p className="text-xs text-neutral-600">
              {detail.rows.length.toLocaleString()} rows are available as a CSV.
            </p>
          )}
        </div>
      )}

      <div className="mt-(--sp-rung) flex justify-end gap-(--sp-field)">
        {stage === 'compose' && (
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              Cancel
            </Button>
            {isComposed && (
              <Button variant="primary" size="sm" onClick={submitFields}>
                Continue
              </Button>
            )}
          </>
        )}

        {stage === 'confirm' && (
          <>
            <Button variant="secondary" size="sm" onClick={close}>
              Cancel
            </Button>
            {!refusal && (preflight?.items ?? 1) > 0 && (
              <Button
                variant={verb.path === 'write' ? 'danger' : 'primary'}
                size="sm"
                onClick={confirm}
              >
                {verb.label}
              </Button>
            )}
          </>
        )}

        {isWorking && (
          <Button variant="secondary" size="sm" onClick={close}>
            Close
          </Button>
        )}

        {stage === 'results' && (
          <>
            {detail && (
              <Button
                variant="secondary"
                size="sm"
                icon="download"
                onClick={() => download(detail)}
              >
                Download CSV
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={close}>
              Close
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VerbRunner;
