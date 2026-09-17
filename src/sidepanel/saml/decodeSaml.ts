export const MAX_INPUT_LENGTH = 1_000_000;

export const MAX_DOCUMENT_LENGTH = 2_000_000;

export type SamlDecodeReason = 'empty' | 'too-large' | 'not-base64' | 'not-xml' | 'not-saml';

export interface SamlAttribute {
  readonly name: string;
  readonly values: readonly string[];
}

export interface SamlFacts {
  readonly issuer: string | null;
  readonly destination: string | null;
  readonly audiences: readonly string[];
  readonly nameId: string | null;
  readonly nameIdFormat: string | null;
  readonly notBefore: string | null;
  readonly notOnOrAfter: string | null;
  readonly attributes: readonly SamlAttribute[];
  readonly hasSignature: boolean;
  readonly statusCode: string | null;
}

export interface DecodedSaml {
  readonly ok: true;
  readonly xml: string;
  readonly document: XMLDocument;
  readonly facts: SamlFacts;
}

export interface SamlDecodeFailure {
  readonly ok: false;
  readonly reason: SamlDecodeReason;
}

export type SamlDecodeResult = DecodedSaml | SamlDecodeFailure;

function byLocalName(root: ParentNode, localName: string): Element[] {
  return Array.from(root.querySelectorAll('*')).filter(
    (element) => element.localName === localName,
  );
}

function textOf(root: ParentNode, localName: string): string | null {
  const [element] = byLocalName(root, localName);
  const text = element?.textContent?.trim();
  return text ? text : null;
}

function decodeBase64(value: string): string | null {
  try {
    const binary = atob(value.replace(/\s+/g, ''));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return null;
  }
}

function prettyPrint(node: Node, depth = 0): string {
  const indent = '  '.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim() ?? '';
    return text ? `${indent}${text}\n` : '';
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node as Element;
  const attributes = Array.from(element.attributes)
    .map((attribute) => ` ${attribute.name}="${attribute.value}"`)
    .join('');
  const children = Array.from(element.childNodes)
    .map((child) => prettyPrint(child, depth + 1))
    .join('');

  if (!children) return `${indent}<${element.nodeName}${attributes}/>\n`;
  return `${indent}<${element.nodeName}${attributes}>\n${children}${indent}</${element.nodeName}>\n`;
}

function extractFacts(document: XMLDocument): SamlFacts {
  const root = document.documentElement;

  const [subject] = byLocalName(root, 'Subject');
  const [nameIdElement] = subject ? byLocalName(subject, 'NameID') : byLocalName(root, 'NameID');

  const [conditions] = byLocalName(root, 'Conditions');
  const [statusCodeElement] = byLocalName(root, 'StatusCode');

  return {
    issuer: textOf(root, 'Issuer'),
    destination: root.getAttribute('Destination'),
    audiences: byLocalName(root, 'Audience')
      .map((element) => element.textContent?.trim() ?? '')
      .filter((value) => value.length > 0),
    nameId: nameIdElement?.textContent?.trim() || null,
    nameIdFormat: nameIdElement?.getAttribute('Format') ?? null,
    notBefore: conditions?.getAttribute('NotBefore') ?? null,
    notOnOrAfter: conditions?.getAttribute('NotOnOrAfter') ?? null,
    attributes: byLocalName(root, 'Attribute').map((element) => ({
      name: element.getAttribute('Name') ?? element.getAttribute('FriendlyName') ?? '',
      values: byLocalName(element, 'AttributeValue').map(
        (value) => value.textContent?.trim() ?? '',
      ),
    })),
    hasSignature: byLocalName(root, 'Signature').length > 0,
    statusCode: statusCodeElement?.getAttribute('Value') ?? null,
  };
}

export function decodeSamlResponse(value: string): SamlDecodeResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: false, reason: 'empty' };
  if (trimmed.length > MAX_INPUT_LENGTH) return { ok: false, reason: 'too-large' };

  const candidate = trimmed.includes('%') ? safeDecodeUri(trimmed) : trimmed;

  const xml = decodeBase64(candidate);
  if (xml === null) return { ok: false, reason: 'not-base64' };
  if (xml.length > MAX_DOCUMENT_LENGTH) return { ok: false, reason: 'too-large' };

  const document = new DOMParser().parseFromString(xml, 'text/xml');
  if (document.getElementsByTagName('parsererror').length > 0 || !document.documentElement) {
    return { ok: false, reason: 'not-xml' };
  }

  const rootName = document.documentElement.localName;
  if (rootName !== 'Response' && rootName !== 'Assertion') {
    return { ok: false, reason: 'not-saml' };
  }

  return {
    ok: true,
    xml: prettyPrint(document.documentElement).trimEnd(),
    document,
    facts: extractFacts(document),
  };
}

function safeDecodeUri(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
