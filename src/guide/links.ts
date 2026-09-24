import { newIssueUrl } from '../shared/githubLinks';
import type { ChapterDef } from './chapters';

export { GITHUB_HOME_URL, GITHUB_ISSUES_URL, newIssueUrl } from '../shared/githubLinks';

export function chapterIssueUrl(chapter: ChapterDef): string {
  return newIssueUrl(`${chapter.title}: `);
}

export function homeReportIssueUrl(): string {
  return newIssueUrl('Home report idea: ');
}

export const EXTERNAL_LINK_PROPS = { target: '_blank', rel: 'noopener noreferrer' } as const;
