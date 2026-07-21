import { z } from 'zod';
import { createLogger } from '../utils/logger';

const log = createLogger('Schema');

export const userStatusSchema = z.enum([
  'ACTIVE',
  'DEPROVISIONED',
  'SUSPENDED',
  'STAGED',
  'PROVISIONED',
  'RECOVERY',
  'LOCKED_OUT',
  'PASSWORD_EXPIRED',
]);

export const oktaProfileSchema = z
  .object({
    login: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    secondEmail: z.string().optional(),
    mobilePhone: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    department: z.string().optional(),
    title: z.string().optional(),
    manager: z.string().optional(),
    managerId: z.string().optional(),
  })
  .passthrough();

export const oktaUserSchema = z.object({
  id: z.string(),
  status: userStatusSchema,
  created: z.string().optional(),
  activated: z.string().optional(),
  statusChanged: z.string().optional(),
  lastLogin: z.string().nullish(),
  lastUpdated: z.string().optional(),
  passwordChanged: z.string().nullish(),
  managedBy: z
    .object({
      rules: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
    })
    .optional(),
  profile: oktaProfileSchema,
});

export const oktaGroupSchema = z.object({
  id: z.string(),
  profile: z.object({
    name: z.string(),
    description: z.string().nullish(),
  }),
});

export const oktaGroupRuleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    type: z.string().optional(),
    conditions: z
      .object({
        expression: z.object({ value: z.string(), type: z.string() }).partial().optional(),
        people: z.unknown().optional(),
      })
      .passthrough()
      .optional(),
    actions: z
      .object({
        assignUserToGroups: z.object({ groupIds: z.array(z.string()) }).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const groupTypeSchema = z.enum(['OKTA_GROUP', 'APP_GROUP', 'BUILT_IN']);

export const oktaUserListItemSchema = oktaUserSchema.passthrough();

export const oktaGroupListItemSchema = z
  .object({
    id: z.string(),
    type: groupTypeSchema.optional(),
    profile: z
      .object({
        name: z.string(),
        description: z
          .string()
          .nullish()
          .transform((value) => value ?? undefined),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const oktaAppListItemSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    label: z.string().optional(),
    status: z.string().optional(),
    signOnMode: z.string().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
  })
  .passthrough();

export type OktaAppListItem = z.infer<typeof oktaAppListItemSchema>;

export type OktaUserResponse = z.infer<typeof oktaUserSchema>;
export type OktaGroupResponse = z.infer<typeof oktaGroupSchema>;
export type OktaGroupRuleResponse = z.infer<typeof oktaGroupRuleSchema>;
export type OktaUserListItem = z.infer<typeof oktaUserListItemSchema>;
export type OktaGroupListItem = z.infer<typeof oktaGroupListItemSchema>;

export function parseOkta<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      code: issue.code,
    }));
    throw new Error(`Okta response validation failed (${context}): ${JSON.stringify(issues)}`);
  }
  return result.data;
}

export function parseOktaList<S extends z.ZodTypeAny>(
  itemSchema: S,
  data: unknown,
  context: string,
): z.infer<S>[] {
  if (!Array.isArray(data)) {
    log.warn('Okta list response was not an array', { context, code: 'not_an_array' });
    return [];
  }

  const valid: z.infer<S>[] = [];
  let dropped = 0;
  for (const item of data) {
    const result = itemSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      dropped += 1;
    }
  }

  if (dropped > 0) {
    log.warn('Dropped malformed items from Okta list response', {
      context,
      dropped,
      total: data.length,
    });
  }

  return valid;
}
