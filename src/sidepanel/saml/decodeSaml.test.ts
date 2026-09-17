import { describe, it, expect } from 'vitest';
import { decodeSamlResponse, MAX_INPUT_LENGTH } from './decodeSaml';

const RESPONSE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
  Destination="https://sp.example.com/acs" ID="id123">
  <saml2:Issuer>http://www.okta.com/exkFAKE000000000000</saml2:Issuer>
  <saml2p:Status>
    <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
  </saml2p:Status>
  <saml2:Assertion>
    <saml2:Issuer>http://www.okta.com/exkFAKE000000000000</saml2:Issuer>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
      <ds:SignatureValue>FAKE</ds:SignatureValue>
    </ds:Signature>
    <saml2:Subject>
      <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">ada@example.com</saml2:NameID>
    </saml2:Subject>
    <saml2:Conditions NotBefore="2026-09-16T12:00:00.000Z" NotOnOrAfter="2026-09-16T12:05:00.000Z">
      <saml2:AudienceRestriction>
        <saml2:Audience>https://sp.example.com/metadata</saml2:Audience>
      </saml2:AudienceRestriction>
    </saml2:Conditions>
    <saml2:AttributeStatement>
      <saml2:Attribute Name="email">
        <saml2:AttributeValue>ada@example.com</saml2:AttributeValue>
      </saml2:Attribute>
      <saml2:Attribute Name="groups">
        <saml2:AttributeValue>Everyone</saml2:AttributeValue>
        <saml2:AttributeValue>Engineering</saml2:AttributeValue>
      </saml2:Attribute>
    </saml2:AttributeStatement>
  </saml2:Assertion>
</saml2p:Response>`;

const OTHER_PREFIX_XML = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" Destination="https://sp.example.com/acs">
  <saml:Issuer>https://idp.example.com</saml:Issuer>
  <saml:Assertion>
    <saml:Subject><saml:NameID>ada@example.com</saml:NameID></saml:Subject>
  </saml:Assertion>
</samlp:Response>`;

const encode = (xml: string) => btoa(String.fromCharCode(...new TextEncoder().encode(xml)));

describe('decodeSamlResponse', () => {
  it('reads every fact off a response', () => {
    const result = decodeSamlResponse(encode(RESPONSE_XML));

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.facts).toMatchObject({
      issuer: 'http://www.okta.com/exkFAKE000000000000',
      destination: 'https://sp.example.com/acs',
      audiences: ['https://sp.example.com/metadata'],
      nameId: 'ada@example.com',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      notBefore: '2026-09-16T12:00:00.000Z',
      notOnOrAfter: '2026-09-16T12:05:00.000Z',
      hasSignature: true,
      statusCode: 'urn:oasis:names:tc:SAML:2.0:status:Success',
    });
  });

  it('keeps every value of a multi-valued attribute', () => {
    const result = decodeSamlResponse(encode(RESPONSE_XML));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.facts.attributes).toEqual([
      { name: 'email', values: ['ada@example.com'] },
      { name: 'groups', values: ['Everyone', 'Engineering'] },
    ]);
  });

  it('reads a document whose elements carry a different prefix', () => {
    const result = decodeSamlResponse(encode(OTHER_PREFIX_XML));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.facts.issuer).toBe('https://idp.example.com');
    expect(result.facts.nameId).toBe('ada@example.com');
  });

  it('reports an absent signature as absent, not as invalid', () => {
    const result = decodeSamlResponse(encode(OTHER_PREFIX_XML));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.facts.hasSignature).toBe(false);
  });

  it('reports a missing fact as null rather than as an empty string', () => {
    const result = decodeSamlResponse(encode(OTHER_PREFIX_XML));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.facts.notBefore).toBeNull();
    expect(result.facts.statusCode).toBeNull();
    expect(result.facts.audiences).toEqual([]);
  });

  it('survives a value that was percent-encoded on its way out of a form post', () => {
    const encoded = encodeURIComponent(encode(RESPONSE_XML));
    const result = decodeSamlResponse(encoded);

    expect(result.ok).toBe(true);
  });

  it('decodes non-ASCII text as UTF-8 rather than as bytes', () => {
    const xml = OTHER_PREFIX_XML.replace('ada@example.com', 'Ada Løvelace');
    const result = decodeSamlResponse(encode(xml));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.facts.nameId).toBe('Ada Løvelace');
  });

  it('indents the XML so it can be read', () => {
    const result = decodeSamlResponse(encode(OTHER_PREFIX_XML));
    if (!result.ok) throw new Error('expected a decode');

    expect(result.xml).toContain('\n  <saml:Issuer>');
  });

  it('accepts a bare Assertion, which is what some IdPs hand over', () => {
    const assertion = `<saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
      <saml2:Issuer>https://idp.example.com</saml2:Issuer>
    </saml2:Assertion>`;

    expect(decodeSamlResponse(encode(assertion)).ok).toBe(true);
  });

  describe('refusals', () => {
    it('names an empty value', () => {
      expect(decodeSamlResponse('   ')).toEqual({ ok: false, reason: 'empty' });
    });

    it('names a value too long to be worth parsing', () => {
      expect(decodeSamlResponse('A'.repeat(MAX_INPUT_LENGTH + 1))).toEqual({
        ok: false,
        reason: 'too-large',
      });
    });

    it('names a value that is not base64', () => {
      expect(decodeSamlResponse('not base64 !!!')).toEqual({ ok: false, reason: 'not-base64' });
    });

    it('names base64 that is not XML', () => {
      expect(decodeSamlResponse(encode('just some text'))).toEqual({
        ok: false,
        reason: 'not-xml',
      });
    });

    it('names XML that is not a SAML document', () => {
      expect(decodeSamlResponse(encode('<html><body>Sign in</body></html>'))).toEqual({
        ok: false,
        reason: 'not-saml',
      });
    });

    it('reports a reason code, never a sentence to render', () => {
      const result = decodeSamlResponse('nope');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.reason).toMatch(/^[a-z-]+$/);
    });
  });
});
