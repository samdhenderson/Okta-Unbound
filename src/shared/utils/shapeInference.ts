export type ShapeType =
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'boolean' }
  | { kind: 'null' }
  | { kind: 'unknown' }
  | { kind: 'array'; element: ShapeType }
  | { kind: 'object'; fields: ShapeField[] }
  | { kind: 'union'; options: ShapeType[] };

export interface ShapeField {
  key: string;
  type: ShapeType;
  optional: boolean;
}

export function inferShape(value: unknown): ShapeType {
  if (value === null) return { kind: 'null' };
  if (typeof value === 'string') return { kind: 'string' };
  if (typeof value === 'number') return { kind: 'number' };
  if (typeof value === 'boolean') return { kind: 'boolean' };

  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: 'array', element: { kind: 'unknown' } };
    return { kind: 'array', element: mergeShapes(value.map(inferShape)) };
  }

  if (typeof value === 'object') {
    const fields = Object.entries(value as Record<string, unknown>).map(([key, item]) => ({
      key,
      type: inferShape(item),
      optional: false,
    }));
    return { kind: 'object', fields };
  }

  return { kind: 'unknown' };
}

function shapeSignature(shape: ShapeType): string {
  switch (shape.kind) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
    case 'unknown':
      return shape.kind;
    case 'array':
      return `array<${shapeSignature(shape.element)}>`;
    case 'object':
      return `object<${shape.fields
        .map((f) => f.key)
        .sort()
        .join(',')}>`;
    case 'union':
      return `union<${shape.options.map(shapeSignature).sort().join('|')}>`;
  }
}

function mergeObjectShapes(
  shapes: ReadonlyArray<Extract<ShapeType, { kind: 'object' }>>,
): ShapeType {
  const shapesByKey = new Map<string, ShapeType[]>();
  const presenceByKey = new Map<string, number>();

  for (const shape of shapes) {
    for (const field of shape.fields) {
      shapesByKey.set(field.key, [...(shapesByKey.get(field.key) ?? []), field.type]);
      presenceByKey.set(field.key, (presenceByKey.get(field.key) ?? 0) + 1);
    }
  }

  const fields: ShapeField[] = Array.from(shapesByKey.entries()).map(([key, types]) => ({
    key,
    type: mergeShapes(types),
    optional: (presenceByKey.get(key) ?? 0) < shapes.length,
  }));

  return { kind: 'object', fields };
}

export function mergeShapes(shapes: ShapeType[]): ShapeType {
  if (shapes.length === 0) return { kind: 'unknown' };
  if (shapes.length === 1) return shapes[0];

  if (shapes.every((s): s is Extract<ShapeType, { kind: 'object' }> => s.kind === 'object')) {
    return mergeObjectShapes(shapes);
  }

  const seen = new Map<string, ShapeType>();
  for (const shape of shapes) {
    const signature = shapeSignature(shape);
    if (!seen.has(signature)) seen.set(signature, shape);
  }
  const deduped = Array.from(seen.values());
  return deduped.length === 1 ? deduped[0] : { kind: 'union', options: deduped };
}

export function formatShape(shape: ShapeType, indent = 0): string {
  const pad = '  '.repeat(indent);
  switch (shape.kind) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'null':
    case 'unknown':
      return shape.kind;
    case 'union':
      return shape.options.map((option) => formatShape(option, indent)).join(' | ');
    case 'array':
      return `Array<${formatShape(shape.element, indent)}>`;
    case 'object': {
      if (shape.fields.length === 0) return '{}';
      const lines = [...shape.fields]
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(
          (field) =>
            `${pad}  ${field.key}${field.optional ? '?' : ''}: ${formatShape(field.type, indent + 1)};`,
        );
      return `{\n${lines.join('\n')}\n${pad}}`;
    }
  }
}

export function shapeOutline(value: unknown): string {
  return formatShape(inferShape(value));
}
