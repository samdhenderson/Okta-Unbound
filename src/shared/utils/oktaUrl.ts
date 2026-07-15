const OKTA_DOMAINS = ['okta.com', 'oktapreview.com', 'okta-emea.com'] as const;

export function isOktaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return OKTA_DOMAINS.some((domain) => url.includes(domain));
}
