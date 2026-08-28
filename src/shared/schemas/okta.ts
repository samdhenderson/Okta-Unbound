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
  credentials: z
    .object({
      provider: z
        .object({
          type: z.string().optional(),
          name: z.string().optional(),
        })
        .optional(),
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
    name: z.string().optional().catch(undefined),
    label: z.string().optional().catch(undefined),
    status: z.string().optional().catch(undefined),
    signOnMode: z.string().optional().catch(undefined),
    created: z.string().nullish().catch(undefined),
    lastUpdated: z.string().nullish().catch(undefined),
    _links: z.unknown().optional(),
    _embedded: z.unknown().optional(),
    features: z.array(z.string()).optional().catch(undefined),
    orn: z.string().optional().catch(undefined),
  })
  .passthrough();

export type OktaAppListItem = z.infer<typeof oktaAppListItemSchema>;

export const oktaAppGroupAssignmentSchema = z
  .object({
    id: z.string(),
    priority: z.number().optional(),
    profile: z
      .object({
        name: z.string().optional(),
        groupName: z.string().optional(),
      })
      .passthrough()
      .nullish(),
    _links: z
      .object({
        group: z.object({ href: z.string().optional() }).passthrough().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type OktaAppGroupAssignment = z.infer<typeof oktaAppGroupAssignmentSchema>;

export const oktaFactorSchema = z
  .object({
    id: z.string().optional().catch(undefined),
    factorType: z.string().optional().catch(undefined),
    provider: z.string().optional().catch(undefined),
    status: z.string().optional().catch(undefined),
  })
  .passthrough();

export type OktaFactorListItem = z.infer<typeof oktaFactorSchema>;

export const oktaAppUserSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    scope: z.string().optional(),
    syncState: z.string().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    credentials: z.object({ userName: z.string().optional() }).passthrough().optional(),
    _links: z
      .object({
        group: z.object({ href: z.string().optional() }).passthrough().optional(),
      })
      .passthrough()
      .optional()
      .catch(undefined),
  })
  .passthrough();

export type OktaAppUser = z.infer<typeof oktaAppUserSchema>;

export type AppAssignmentScope = 'USER' | 'GROUP';

export function extractAppAssignmentScope(embedded: unknown): AppAssignmentScope | undefined {
  if (typeof embedded !== 'object' || embedded === null) return undefined;

  const parsed = oktaAppUserSchema.safeParse((embedded as Record<string, unknown>).user);
  if (!parsed.success) return undefined;

  const { scope } = parsed.data;
  return scope === 'USER' || scope === 'GROUP' ? scope : undefined;
}

const PROFILE_SOURCE_FEATURE = 'PROFILE_MASTERING';

export function isProfileSourceApp(features: readonly string[] | undefined): boolean {
  return features !== undefined && features.includes(PROFILE_SOURCE_FEATURE);
}

const GROUP_PUSH_FEATURE = 'GROUP_PUSH';

export function isGroupPushApp(features: readonly string[] | undefined): boolean {
  return features !== undefined && features.includes(GROUP_PUSH_FEATURE);
}

const GROUP_ID_PATTERN = /^00g[A-Za-z0-9]{15,}$/;

function trailingPathSegment(href: string): string | undefined {
  const path = href.split('?')[0].split('#')[0].replace(/\/+$/, '');
  const segment = path.split('/').pop();
  return segment ? segment : undefined;
}

export function extractAppGrantGroupId(embedded: unknown): string | undefined {
  if (typeof embedded !== 'object' || embedded === null) return undefined;

  const parsed = oktaAppUserSchema.safeParse((embedded as Record<string, unknown>).user);
  if (!parsed.success) return undefined;

  const href = parsed.data._links?.group?.href;
  if (typeof href !== 'string' || href.length === 0) return undefined;

  const candidate = trailingPathSegment(href);
  return candidate && GROUP_ID_PATTERN.test(candidate) ? candidate : undefined;
}

export const oktaAppGroupSchema = z
  .object({
    id: z.string(),
    priority: z.number().optional(),
    lastUpdated: z.string().nullish(),
    profile: z.record(z.unknown()).optional(),
  })
  .passthrough();

export type OktaAppGroup = z.infer<typeof oktaAppGroupSchema>;

export const oktaPolicyListItemSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    priority: z.number().nullish(),
    description: z.string().nullish(),
    system: z.boolean().optional(),
    created: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    _links: z.unknown().optional(),
  })
  .passthrough();

export const oktaPolicyRuleSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    status: z.string().optional(),
    priority: z.number().nullish(),
    system: z.boolean().optional(),
    conditions: z.unknown().optional(),
    actions: z.unknown().optional(),
  })
  .passthrough();

export type OktaPolicyListItem = z.infer<typeof oktaPolicyListItemSchema>;

export type OktaPolicyRule = z.infer<typeof oktaPolicyRuleSchema>;

export type OktaUserResponse = z.infer<typeof oktaUserSchema>;
export type OktaGroupResponse = z.infer<typeof oktaGroupSchema>;
export type OktaGroupRuleResponse = z.infer<typeof oktaGroupRuleSchema>;
export type OktaUserListItem = z.infer<typeof oktaUserListItemSchema>;
export type OktaGroupListItem = z.infer<typeof oktaGroupListItemSchema>;

export function parseOkta<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  data: unknown,
  context: string,
): T {
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

export const oktaUserSchemaPropertySchema = z
  .object({
    title: z.string().optional(),
    type: z.string().optional(),
    mutability: z.string().optional(),
    required: z.boolean().optional(),
    enum: z.array(z.unknown()).optional(),
    oneOf: z.array(z.unknown()).optional(),
    master: z
      .object({
        type: z.string().optional(),
        priority: z.unknown().optional(),
      })
      .passthrough()
      .nullish(),
  })
  .passthrough();

export type OktaUserSchemaProperty = z.infer<typeof oktaUserSchemaPropertySchema>;

const oktaUserSchemaPropertiesSchema = z.record(z.string(), z.unknown()).transform((raw, ctx) => {
  const properties: Record<string, OktaUserSchemaProperty> = {};
  let dropped = 0;
  for (const [key, value] of Object.entries(raw)) {
    const result = oktaUserSchemaPropertySchema.safeParse(value);
    if (result.success) {
      properties[key] = result.data;
    } else {
      dropped += 1;
    }
  }
  if (dropped > 0) {
    log.warn('Dropped malformed properties from Okta user schema', {
      context: ctx.path.join('.') || 'definitions',
      dropped,
      total: Object.keys(raw).length,
    });
  }
  return properties;
});

const oktaUserSchemaDefinitionSchema = z
  .object({
    properties: oktaUserSchemaPropertiesSchema.optional(),
  })
  .passthrough();

export const oktaUserProfileSchemaSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    definitions: z
      .object({
        base: oktaUserSchemaDefinitionSchema.optional(),
        custom: oktaUserSchemaDefinitionSchema.optional(),
      })
      .passthrough()
      .optional(),
    properties: z
      .object({
        profile: z
          .object({
            allOf: z.unknown().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type OktaUserProfileSchema = z.infer<typeof oktaUserProfileSchemaSchema>;
