import type { EntityExport } from './types';
import type { ExportApiDeps } from './types.deps';

interface DescriptorModule {
  default: EntityExport | ((deps: ExportApiDeps) => EntityExport);
}

const descriptorModules = import.meta.glob<DescriptorModule>(
  ['./descriptors/*.ts', '!./descriptors/*.test.ts'],
  { eager: true },
);

export function buildRegistry(deps: ExportApiDeps): Record<string, EntityExport> {
  const descriptors = Object.values(descriptorModules).map((mod) => {
    const exported = mod.default;
    return typeof exported === 'function' ? exported(deps) : exported;
  });

  return Object.fromEntries(descriptors.map((descriptor) => [descriptor.id, descriptor]));
}

export function listDescriptors(registry: Record<string, EntityExport>): EntityExport[] {
  return Object.values(registry).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
