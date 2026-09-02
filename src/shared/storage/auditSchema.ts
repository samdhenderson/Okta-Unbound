import { z } from 'zod';
import { createLogger } from '../utils/logger';
import type { PersistedAuditLogEntry } from '../types';

const log = createLogger('AuditSchema');

const auditActionSchema = z.enum([
  'remove_users',
  'add_users',
  'export',
  'activate_rule',
  'deactivate_rule',
]);

const auditResultSchema = z.enum(['success', 'partial', 'failed']);

const actorResolutionSchema = z.enum(['resolved', 'unavailable']);

const timestampSchema = z
  .date()
  .refine((value) => !Number.isNaN(value.getTime()), { message: 'invalid timestamp' });

const auditDetailsSchema = z.object({
  usersSucceeded: z.number(),
  usersFailed: z.number(),
  apiRequestCount: z.number(),
  durationMs: z.number(),
  errorMessages: z.array(z.string()).optional(),
});

export const persistedAuditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: timestampSchema,
  action: auditActionSchema,
  groupId: z.string(),
  groupName: z.string(),
  performedBy: z.string().nullable(),
  actorResolution: actorResolutionSchema.optional().catch(undefined),
  affectedUsers: z.array(z.string()),
  result: auditResultSchema,
  details: auditDetailsSchema,
});

export function parsePersistedAuditRows(
  rows: unknown[],
  context: string,
): PersistedAuditLogEntry[] {
  const valid: PersistedAuditLogEntry[] = [];
  let dropped = 0;

  for (const row of rows) {
    const result = persistedAuditLogEntrySchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      dropped += 1;
    }
  }

  if (dropped > 0) {
    log.warn('Dropped malformed audit rows on read', { context, dropped, total: rows.length });
  }

  return valid;
}
