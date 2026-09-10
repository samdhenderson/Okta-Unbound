const OKTA_DOMAINS = ['okta.com', 'oktapreview.com', 'okta-emea.com'] as const;

export function isOktaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  let hostname: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    hostname = parsed.hostname;
  } catch {
    return false;
  }
  return OKTA_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export function oktaOriginOf(url: string | null | undefined): string | null {
  if (!isOktaUrl(url)) return null;
  try {
    return new URL(url as string).origin;
  } catch {
    return null;
  }
}

export type OktaAdminTarget =
  | { type: 'group'; id: string | null | undefined }
  | { type: 'user'; id: string | null | undefined }
  | {
      type: 'app';
      id: string | null | undefined;
      name: string | null | undefined;
    };

export function oktaAdminEntityUrl(
  origin: string | null | undefined,
  target: OktaAdminTarget,
): string | null {
  if (!origin || !target.id) return null;
  switch (target.type) {
    case 'group':
      return `${origin}/admin/group/${target.id}`;
    case 'user':
      return `${origin}/admin/user/profile/view/${target.id}`;
    case 'app':
      return target.name ? `${origin}/admin/app/${target.name}/instance/${target.id}` : null;
  }
}
