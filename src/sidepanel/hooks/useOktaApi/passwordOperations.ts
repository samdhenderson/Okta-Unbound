import type { CoreApi } from './core';
import type { OktaUser } from '@/shared/types';
import { oktaUserSchema } from '@/shared/schemas/okta';
import { createLogger } from '@/shared/utils/logger';

const log = createLogger('useOktaApi');

export type PasswordWriteResult =
  | { readonly kind: 'saved'; readonly user: OktaUser }
  | { readonly kind: 'saved-with-temp'; readonly user: OktaUser; readonly tempPassword: string }
  | { readonly kind: 'failed'; readonly error: string }
  | { readonly kind: 'unknown'; readonly error: string };

const UNCONFIRMED =
  'The change could not be confirmed. Reload the user to check whether it applied.';

function readTempPassword(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const value = (data as { tempPassword?: unknown }).tempPassword;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function createPasswordOperations(coreApi: CoreApi) {
  const write = async (
    userId: string,
    endpoint: string,
    reason: string,
    body: unknown,
    wantsTempPassword: boolean,
  ): Promise<PasswordWriteResult> => {
    try {
      const response = await coreApi.makeApiRequest(endpoint, {
        method: 'POST',
        ...(body === undefined ? {} : { body }),
        reason,
      });

      if (!response.success) {
        log.error('Password write rejected', { userId, reason });
        return { kind: 'failed', error: response.error || 'Okta rejected the password change' };
      }

      const tempPassword = wantsTempPassword ? readTempPassword(response.data) : null;

      const parsed = oktaUserSchema.safeParse(response.data);
      if (!parsed.success) {
        log.error('Password write response failed validation', {
          userId,
          reason,
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            code: issue.code,
          })),
        });
        return { kind: 'unknown', error: UNCONFIRMED };
      }

      if (wantsTempPassword && tempPassword === null) {
        log.error('Okta returned no temporary password', { userId });
        return {
          kind: 'unknown',
          error: 'Okta accepted the request but returned no temporary password.',
        };
      }

      log.info('Password write applied', { userId, reason });
      return tempPassword === null
        ? { kind: 'saved', user: parsed.data }
        : { kind: 'saved-with-temp', user: parsed.data, tempPassword };
    } catch {
      log.error('Password write outcome unknown', { userId, reason });
      return { kind: 'unknown', error: UNCONFIRMED };
    }
  };

  const setUserPassword = async (
    userId: string,
    password: string,
  ): Promise<PasswordWriteResult> => {
    if (password.length === 0) {
      throw new Error('Refusing to set an empty password');
    }
    return write(
      userId,
      `/api/v1/users/${userId}`,
      'Set user password',
      { credentials: { password: { value: password } } },
      false,
    );
  };

  const expirePassword = async (userId: string): Promise<PasswordWriteResult> =>
    write(
      userId,
      `/api/v1/users/${userId}/lifecycle/expire_password`,
      'Expire user password',
      undefined,
      false,
    );

  const expirePasswordWithTempPassword = async (userId: string): Promise<PasswordWriteResult> =>
    write(
      userId,
      `/api/v1/users/${userId}/lifecycle/expire_password_with_temp_password`,
      'Expire password with temporary password',
      undefined,
      true,
    );

  return { setUserPassword, expirePassword, expirePasswordWithTempPassword };
}
