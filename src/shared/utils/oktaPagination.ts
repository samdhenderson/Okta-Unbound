import type { z } from 'zod';
import { parseOktaList } from '../schemas/okta';

export const OKTA_PAGE_SIZE = 200;

export function parseNextLink(linkHeader?: string): string | null {
  if (!linkHeader) return null;

  const links = linkHeader.split(',');
  for (const link of links) {
    if (link.includes('rel="next"')) {
      const match = link.match(/<([^>]+)>/);
      if (match) {
        const fullUrl = new URL(match[1]);
        return fullUrl.pathname + fullUrl.search;
      }
    }
  }
  return null;
}

export function nextPageUrl(
  currentUrl: string,
  linkHeader: string | undefined,
  pageSize: number,
): string | null {
  if (pageSize === 0) return null;
  const next = parseNextLink(linkHeader);
  if (!next || next === currentUrl) return null;
  return next;
}

function rawQueryParam(url: string, name: string): string | null {
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return null;

  for (const pair of url.slice(queryStart + 1).split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (key === name) return eq === -1 ? '' : pair.slice(eq + 1);
  }
  return null;
}

function preserveQueryParams(nextUrl: string, firstUrl: string, names: string[]): string {
  let result = nextUrl;
  for (const name of names) {
    if (rawQueryParam(result, name) !== null) continue;
    const value = rawQueryParam(firstUrl, name);
    if (value === null) continue;
    result += `${result.includes('?') ? '&' : '?'}${name}=${value}`;
  }
  return result;
}

export interface PaginatedPageResult {
  success: boolean;
  data?: unknown;
  headers?: Record<string, string>;
  error?: string;
}

export interface FetchAllPagesOptions<T> {
  onPage?: (items: T[], totalSoFar: number) => void;
  onBeforePage?: (pageNumber: number) => void;
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
  preserveParams?: string[];
  maxPages?: number;
  context?: string;
  errorMessage?: string;
}

export async function fetchAllPages<T = unknown>(
  request: (url: string) => Promise<PaginatedPageResult>,
  firstUrl: string,
  options: FetchAllPagesOptions<T> = {},
): Promise<T[]> {
  const { onPage, onBeforePage, schema, maxPages, errorMessage, preserveParams } = options;
  const context = options.context ?? firstUrl.split('?')[0];
  const all: T[] = [];
  let url: string | null = firstUrl;
  let pageCount = 0;

  while (url) {
    pageCount++;
    onBeforePage?.(pageCount);

    const response = await request(url);
    if (!response.success) {
      throw new Error(response.error || errorMessage || `Paginated fetch failed (${context})`);
    }

    const rawPageSize = Array.isArray(response.data) ? response.data.length : 0;
    const items: T[] = schema
      ? parseOktaList(schema, response.data, context)
      : ((Array.isArray(response.data) ? response.data : []) as T[]);
    all.push(...items);
    onPage?.(items, all.length);

    if (maxPages !== undefined && pageCount >= maxPages) break;

    const rawNext = nextPageUrl(url, response.headers?.link, rawPageSize);
    const next =
      rawNext !== null && preserveParams?.length
        ? preserveQueryParams(rawNext, firstUrl, preserveParams)
        : rawNext;
    url = next === url ? null : next;
  }

  return all;
}
