import type { OktaUser } from '../../shared/types';
import { demoUsers } from './users';

export type DemoProfilePatch = Partial<OktaUser['profile']>;

const patches = new Map<string, DemoProfilePatch>();

let revision = 0;

let cachedRevision = -1;
let cachedUsers: OktaUser[] = demoUsers;
let cachedById: ReadonlyMap<string, OktaUser> = new Map(demoUsers.map((u) => [u.id, u]));

function rebuild(): void {
  if (cachedRevision === revision) return;
  cachedUsers =
    patches.size === 0
      ? // By identity, not by copy. A scene that never writes must not pay for
        demoUsers
      : demoUsers.map((user) => {
          const patch = patches.get(user.id);
          if (!patch) return user;
          return {
            ...user,
            lastUpdated: new Date().toISOString(),
            profile: { ...user.profile, ...patch },
          };
        });
  cachedById = new Map(cachedUsers.map((user) => [user.id, user]));
  cachedRevision = revision;
}

export function demoRevision(): number {
  return revision;
}

export function applyProfilePatch(userId: string, patch: DemoProfilePatch): void {
  const existing = patches.get(userId);
  patches.set(userId, existing ? { ...existing, ...patch } : { ...patch });
  revision += 1;
}

export function resetDemoWrites(): void {
  if (patches.size === 0) return;
  patches.clear();
  revision += 1;
}

export function currentUsers(): readonly OktaUser[] {
  rebuild();
  return cachedUsers;
}

export function currentUserById(userId: string): OktaUser | undefined {
  rebuild();
  return cachedById.get(userId);
}
