import type { EntityExport } from './types';

export interface EndpointOptions {
  contextId?: string;
  filterText?: string;
}

export function buildExportEndpoint(
  descriptor: EntityExport,
  options: EndpointOptions = {},
): string {
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

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(descriptor.defaultQuery)) {
    params.set(key, String(value));
  }
  if (descriptor.filter.kind !== 'none' && options.filterText?.trim()) {
    params.set(descriptor.filter.kind, options.filterText.trim());
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
