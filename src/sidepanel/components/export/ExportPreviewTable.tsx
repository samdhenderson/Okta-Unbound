import React from 'react';
import { AlertMessage } from '../shared';
import { oktaAdminEntityUrl } from '../../../shared/utils/oktaUrl';
import type { ExportColumn, IdLinkify } from '../../export/types';

const PREVIEW_LIMIT = 100;

interface ExportPreviewTableProps {
  columns: ExportColumn<unknown>[];
  rows: unknown[];
  fetched: number;
  dropped: number;
  capped: boolean;
  linkify?: IdLinkify;
  oktaOrigin?: string;
}

function projectCell(column: ExportColumn<unknown>, row: unknown): string {
  const raw = column.accessor(row);
  if (column.format) {
    const formatted = column.format(raw, row);
    return formatted == null ? '' : String(formatted);
  }
  return raw == null ? '' : String(raw);
}

const ExportPreviewTable: React.FC<ExportPreviewTableProps> = ({
  columns,
  rows,
  fetched,
  dropped,
  capped,
  linkify,
  oktaOrigin,
}) => {
  const total = rows.length;

  if (total === 0) {
    const message =
      fetched > 0
        ? `The server returned ${fetched} row${fetched === 1 ? '' : 's'}, but all were skipped as unrecognized. Schema mismatch — please report it.`
        : 'The server returned no rows for this query.';
    return <AlertMessage message={{ type: fetched > 0 ? 'warning' : 'info', text: message }} />;
  }

  const shown = Math.min(PREVIEW_LIMIT, total);
  const linkColumn = linkify
    ? columns.find((column) => column.id === linkify.idColumnId)
    : undefined;

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-700">
        Showing {shown} of {total} — all {total} rows will export.
      </div>

      {dropped > 0 && (
        <p className="text-xs text-neutral-500">{dropped} rows skipped (unrecognized shape)</p>
      )}

      {capped && (
        <AlertMessage
          message={{
            type: 'info',
            text: 'This export hit the row cap — only the first rows are included.',
          }}
        />
      )}

      <div className="overflow-x-auto rounded-md border border-neutral-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-(--sp-row-x) py-(--sp-row-y) text-left font-semibold text-neutral-700 whitespace-nowrap"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, PREVIEW_LIMIT).map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-neutral-100 last:border-b-0">
                {columns.map((column) => {
                  const value = projectCell(column, row);
                  const href =
                    linkColumn && column.id === linkColumn.id && linkify
                      ? oktaAdminEntityUrl(oktaOrigin, linkify.entityType, value)
                      : null;
                  return (
                    <td
                      key={column.id}
                      className="px-(--sp-row-x) py-(--sp-row-y) text-neutral-700 whitespace-nowrap"
                    >
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-text hover:underline"
                        >
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExportPreviewTable;
