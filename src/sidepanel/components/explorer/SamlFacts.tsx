import React from 'react';
import Badge from '../shared/Badge';
import type { SamlFacts as Facts } from '@/sidepanel/saml/decodeSaml';

export interface SamlFactsProps {
  facts: Facts;
}

const Row: React.FC<{ label: string; value?: string | null; children?: React.ReactNode }> = ({
  label,
  value,
  children,
}) => (
  <div className="grid grid-cols-[minmax(7rem,9rem)_1fr] gap-(--sp-inline) py-1.5">
    <dt className="text-xs font-medium uppercase tracking-wide text-neutral-600">{label}</dt>
    <dd className="min-w-0 break-all text-sm text-neutral-900">
      {children ??
        (value ? value : <span className="text-neutral-600">Not in this assertion</span>)}
    </dd>
  </div>
);

const SamlFacts: React.FC<SamlFactsProps> = ({ facts }) => (
  <div className="space-y-(--sp-rung)">
    <dl className="divide-y divide-neutral-200">
      <Row label="Issuer" value={facts.issuer} />
      <Row label="Destination" value={facts.destination} />
      <Row label="Audience">
        {facts.audiences.length > 0 ? (
          <ul className="space-y-0.5">
            {facts.audiences.map((audience) => (
              <li key={audience}>{audience}</li>
            ))}
          </ul>
        ) : (
          <span className="text-neutral-600">Not in this assertion</span>
        )}
      </Row>
      <Row label="Name ID" value={facts.nameId} />
      <Row label="Name ID format" value={facts.nameIdFormat} />
      <Row label="Valid from" value={facts.notBefore} />
      <Row label="Valid until" value={facts.notOnOrAfter} />
      <Row label="Status" value={facts.statusCode} />
      <Row label="Signature">
        {facts.hasSignature ? (
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Present</Badge>
            <span className="text-xs text-neutral-600">
              Not verified — checking it needs the IdP&apos;s certificate.
            </span>
          </span>
        ) : (
          <Badge variant="warning">No signature element</Badge>
        )}
      </Row>
    </dl>

    <section aria-labelledby="saml-attributes">
      <h3
        id="saml-attributes"
        className="text-xs font-medium uppercase tracking-wide text-neutral-600"
      >
        Attributes
      </h3>
      {facts.attributes.length === 0 ? (
        <p className="pt-1.5 text-sm text-neutral-600">
          This assertion carries no attribute statement.
        </p>
      ) : (
        <dl className="divide-y divide-neutral-200">
          {facts.attributes.map((attribute) => (
            <Row key={attribute.name} label={attribute.name}>
              <ul className="space-y-0.5">
                {attribute.values.map((value, index) => (
                  <li key={`${value}-${index}`}>{value}</li>
                ))}
              </ul>
            </Row>
          ))}
        </dl>
      )}
    </section>
  </div>
);

export default SamlFacts;
