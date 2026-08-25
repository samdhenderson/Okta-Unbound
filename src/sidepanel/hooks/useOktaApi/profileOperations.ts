import type { CoreApi } from './core';
import type { OktaUser } from '@/shared/types';
import {
  oktaUserSchema,
  oktaUserProfileSchemaSchema,
  type OktaUserProfileSchema,
} from '@/shared/schemas/okta';
import { isExcludedProfileField } from '@/shared/utils/profileFields';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

export type UpdateProfileResult =
  | { readonly kind: 'saved'; readonly user: OktaUser }
  | { readonly kind: 'failed'; readonly error: string }
  | { readonly kind: 'unknown'; readonly error: string };

export function assertNoExcludedKeys(patch: Record<string, unknown>): void {
  let excluded = 0;
  for (const key of Object.keys(patch)) {
    if (isExcludedProfileField(key)) {
      excluded += 1;
    }
  }

  if (excluded > 0) {
    throw new Error(
      `Refusing to write ${excluded} security-sensitive profile attribute${excluded === 1 ? '' : 's'}`,
    );
  }
}

export function createProfileOperations(coreApi: CoreApi) {
  const getUserProfileSchema = async (): Promise<OktaUserProfileSchema | null> => {
    try {
      const response = await coreApi.makeApiRequest('/api/v1/meta/schemas/user/default', {
        reason: 'Fetch user profile schema',
      });
      if (!response.success || !response.data) {
        log.error('Failed to fetch user profile schema', { success: response.success });
        return null;
      }

      const parsed = oktaUserProfileSchemaSchema.safeParse(response.data);
      if (!parsed.success) {
        log.error('User profile schema failed validation', {
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
          })),
        });
        return null;
      }

      return parsed.data;
    } catch (error) {
      log.error('getUserProfileSchema error:', error);
      return null;
    }
  };

  const getUserRaw = async (userId: string): Promise<OktaUser | null> => {
    try {
      const response = await coreApi.makeApiRequest(`/api/v1/users/${userId}`, {
        reason: 'Fetch user profile for editing',
      });
      if (!response.success || !response.data) {
        log.error('Failed to fetch user', { userId, success: response.success });
        return null;
      }

      const parsed = oktaUserSchema.safeParse(response.data);
      if (!parsed.success) {
        log.error('User response failed validation', {
          userId,
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
          })),
        });
        return null;
      }

      return parsed.data;
    } catch {
      log.error('getUserRaw error', { userId });
      return null;
    }
  };

  const updateUserProfile = async (
    userId: string,
    patch: Record<string, unknown>,
  ): Promise<UpdateProfileResult> => {
    const attributeCount = Object.keys(patch).length;
    if (attributeCount === 0) {
      throw new Error('Refusing to write an empty profile patch');
    }
    assertNoExcludedKeys(patch);

    try {
      const response = await coreApi.makeApiRequest(`/api/v1/users/${userId}`, {
        method: 'POST',
        body: { profile: patch },
        reason: 'Update user profile attributes',
      });

      if (!response.success) {
        log.error('Profile update rejected', { userId, attributeCount });
        return { kind: 'failed', error: response.error || 'Okta rejected the profile update' };
      }

      const parsed = oktaUserSchema.safeParse(response.data);
      if (!parsed.success) {
        log.error('Profile update response failed validation', {
          userId,
          attributeCount,
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
          })),
        });
        return {
          kind: 'unknown',
          error: 'Okta accepted the update but returned an unreadable response',
        };
      }

      log.info('Profile updated', { userId, attributeCount });
      return { kind: 'saved', user: parsed.data };
    } catch {
      log.error('Profile update outcome unknown', { userId, attributeCount });
      return {
        kind: 'unknown',
        error: 'The update could not be confirmed. Reload the user to check whether it applied.',
      };
    }
  };

  return {
    getUserProfileSchema,
    getUserRaw,
    updateUserProfile,
  };
}
