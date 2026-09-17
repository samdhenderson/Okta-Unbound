import React from 'react';
import Icon from '../shared/Icon';

export interface SamlXmlTreeProps {
  element: Element;
  defaultOpenDepth?: number;
}

const DEFAULT_OPEN_DEPTH = 3;

function elementChildren(element: Element): Element[] {
  return Array.from(element.children);
}

function ownText(element: Element): string {
  return element.children.length === 0 ? (element.textContent?.trim() ?? '') : '';
}

const TreeNode: React.FC<{ element: Element; depth: number; openDepth: number }> = ({
  element,
  depth,
  openDepth,
}) => {
  const children = elementChildren(element);
  const [isOpen, setIsOpen] = React.useState(depth < openDepth);
  const text = ownText(element);
  const attributes = Array.from(element.attributes).filter(
    (attribute) => !attribute.name.startsWith('xmlns'),
  );

  const label = (
    <>
      <span className="font-mono text-primary-text">{element.nodeName}</span>
      {attributes.map((attribute) => (
        <span key={attribute.name} className="font-mono text-xs text-neutral-600">
          {' '}
          {attribute.name}=<span className="text-neutral-900">&quot;{attribute.value}&quot;</span>
        </span>
      ))}
    </>
  );

  return (
    <li className="py-0.5">
      {children.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="flex w-full items-start gap-1 rounded-sm text-left text-sm hover:bg-neutral-50 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
          >
            <Icon
              type={isOpen ? 'chevron-down' : 'chevron-right'}
              size="sm"
              className="mt-0.5 shrink-0 text-neutral-500"
            />
            <span className="min-w-0 break-all">{label}</span>
          </button>
          {isOpen && (
            <ul className="ml-4 border-l border-neutral-200 pl-2">
              {children.map((child, index) => (
                <TreeNode
                  key={`${child.nodeName}-${index}`}
                  element={child}
                  depth={depth + 1}
                  openDepth={openDepth}
                />
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="flex items-start gap-1 pl-5 text-sm">
          <span className="min-w-0 break-all">
            {label}
            {text && <span className="text-neutral-900">: {text}</span>}
          </span>
        </div>
      )}
    </li>
  );
};

const SamlXmlTree: React.FC<SamlXmlTreeProps> = ({
  element,
  defaultOpenDepth = DEFAULT_OPEN_DEPTH,
}) => (
  <ul className="max-h-96 overflow-auto rounded-md border border-neutral-200 bg-white p-2">
    <TreeNode element={element} depth={0} openDepth={defaultOpenDepth} />
  </ul>
);

export default SamlXmlTree;
