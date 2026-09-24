import { describe, expect, it } from 'vitest';
import pkg from '../../package.json' with { type: 'json' };
import { chapterById } from './chapters';
import {
  CHROME_WEB_STORE_URL,
  EXTERNAL_LINK_PROPS,
  GITHUB_ISSUES_URL,
  chapterIssueUrl,
  homeReportIssueUrl,
  newIssueUrl,
} from './links';

function titleOf(href: string): string | null {
  return new URL(href).searchParams.get('title');
}

describe('newIssueUrl', () => {
  it('points at the new-issue form of the tracker', () => {
    expect(newIssueUrl('Rules: ').startsWith(`${GITHUB_ISSUES_URL}/new?`)).toBe(true);
  });

  it('round-trips the title through the query string', () => {
    expect(titleOf(newIssueUrl('Rules: '))).toBe('Rules: ');
  });
});

describe('chapterIssueUrl', () => {
  it('names the chapter in the title', () => {
    const rules = chapterById('rules');
    expect(titleOf(chapterIssueUrl(rules))).toBe('Rules: ');
  });
});

describe('homeReportIssueUrl', () => {
  it('asks for a Home report idea', () => {
    expect(titleOf(homeReportIssueUrl())).toBe('Home report idea: ');
  });
});

describe('EXTERNAL_LINK_PROPS', () => {
  it('opens in a new tab without leaking the opener', () => {
    expect(EXTERNAL_LINK_PROPS.target).toBe('_blank');
    expect(EXTERNAL_LINK_PROPS.rel).toBe('noopener noreferrer');
  });
});

describe('CHROME_WEB_STORE_URL', () => {
  it('addresses the listing over https', () => {
    const url = new URL(CHROME_WEB_STORE_URL);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('chromewebstore.google.com');
  });

  it('ends in the id package.json states', () => {
    const url = new URL(CHROME_WEB_STORE_URL);
    expect(url.pathname.split('/').pop()).toBe(pkg.chromeWebStoreId);
  });
});
