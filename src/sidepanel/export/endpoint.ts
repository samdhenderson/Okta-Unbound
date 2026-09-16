import type { EntityExport, SelectionTarget } from './types';

export interface EndpointOptions {
  contextId?: string;
  filterText?: string;
  selectionRef?: SelectionTarget;
}

export function buildExportEndpoint(
  descriptor: EntityExport,
  options: EndpointOptions = {},
): string {
  if (descriptor.context.kind === 'from-selection') {
    if (!options.selectionRef) {
      throw new Error(`Export "${descriptor.id}" requires a ticked ${descriptor.context.label}.`);
    }
    const base = descriptor.context.endpoint(options.selectionRef);
    return withQuery(base, descriptor.context.query ?? {});
  }

  let base: string;
  if (descriptor.context.kind === 'search-to-select') {
    if (!options.contextId) {
      throw new Error(`Export "${descriptor.id}" requires a selected ${descriptor.context.label}.`);
    }
    base = descriptor.context.endpoint(options.contextId);
  } else {
    if (!descriptor.endpoint) {
      throw new Error(`Export "${descriptor.id}" has no endpoint.`);
    }
    base = descriptor.endpoint;
  }

  const params: Record<string, string | number> = { ...descriptor.defaultQuery };
  if (descriptor.filter.kind !== 'none' && options.filterText?.trim()) {
    params[descriptor.filter.kind] = options.filterText.trim();
  }

  return withQuery(base, params);
}

function withQuery(base: string, params: Record<string, string | number>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}
