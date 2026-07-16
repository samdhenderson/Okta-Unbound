import { z } from 'zod';

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
    mobilePhone: z.string().nullish(),
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

export const oktaUserListSchema = z.array(oktaUserSchema);

export type OktaUserResponse = z.infer<typeof oktaUserSchema>;
export type OktaGroupResponse = z.infer<typeof oktaGroupSchema>;
export type OktaGroupRuleResponse = z.infer<typeof oktaGroupRuleSchema>;

export function parseOkta<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Okta response validation failed (${context}): ${result.error.message}`);
  }
  return result.data;
}
