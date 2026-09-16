import type { OktaUser } from '../../shared/types';
import { userDisplayName } from '../../shared/utils/userDisplay';
import type { SelectionBasket } from './selectionStore';

export function userCohortBasket(users: readonly OktaUser[]): SelectionBasket {
  const pickedAt = Date.now();
  return {
    picked: users.map((user) => ({
      kind: 'user' as const,
      id: user.id,
      name: userDisplayName(user),
      pickedAt,
    })),
  };
}
