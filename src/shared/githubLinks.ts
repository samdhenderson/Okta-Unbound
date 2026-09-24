import pkg from '../../package.json' with { type: 'json' };

export const GITHUB_ISSUES_URL: string = pkg.bugs.url;

export const GITHUB_HOME_URL: string = pkg.homepage;

export function newIssueUrl(title: string): string {
  const url = new URL(`${GITHUB_ISSUES_URL}/new`);
  url.searchParams.set('title', title);
  return url.toString();
}
