import type { EntityExport } from './types';
import type { ExportApiDeps } from './types.deps';

type DescriptorExport = EntityExport | EntityExport[];

interface DescriptorModule {
  default: DescriptorExport | ((deps: ExportApiDeps) => DescriptorExport);
}

const descriptorModules = import.meta.glob<DescriptorModule>(
  ['./descriptors/*.ts', '!./descriptors/*.test.ts'],
  { eager: true },
);

export function buildRegistry(deps: ExportApiDeps): Record<string, EntityExport> {
  const descriptors = Object.values(descriptorModules).flatMap((mod) => {
    const exported = mod.default;
    const produced = typeof exported === 'function' ? exported(deps) : exported;
    return Array.isArray(produced) ? produced : [produced];
  });

  return Object.fromEntries(descriptors.map((descriptor) => [descriptor.id, descriptor]));
}

export function listDescriptors(registry: Record<string, EntityExport>): EntityExport[] {
  return Object.values(registry).sort((a, b) => a.displayName.localeCompare(b.displayName));
}
