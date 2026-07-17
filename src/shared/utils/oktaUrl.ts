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

export type OktaAdminEntityType = 'group' | 'user' | 'app';

export function oktaAdminEntityUrl(
  origin: string | null | undefined,
  type: OktaAdminEntityType,
  id: string | null | undefined,
): string | null {
  if (!origin || !id) return null;
  switch (type) {
    case 'group':
      return `${origin}/admin/group/${id}`;
    case 'user':
      return `${origin}/admin/user/profile/view/${id}`;
    case 'app':
      return `${origin}/admin/app/${id}/instance/${id}`;
  }
}
