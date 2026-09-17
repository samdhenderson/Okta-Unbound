import React from 'react';
import {
  AlertMessage,
  Button,
  EmptyState,
  Input,
  ListRow,
  Tabs,
  Textarea,
  CopyButton,
} from '../shared';
import Icon from '../shared/Icon';
import SamlFacts from './SamlFacts';
import SamlXmlTree from './SamlXmlTree';
import { useOrgEntityIndex } from '../../contexts/OrgEntityIndexContext';
import { useSamlTrace, type SamlTraceReason } from '../../hooks/useSamlTrace';
import {
  decodeSamlResponse,
  type SamlDecodeReason,
  type DecodedSaml,
} from '@/sidepanel/saml/decodeSaml';

type ViewMode = 'fields' | 'tree' | 'xml';

const MIN_APP_QUERY = 2;

const MAX_APP_ROWS = 6;

const REFUSAL_COPY: Readonly<Record<SamlDecodeReason, string>> = {
  empty: 'Paste a SAMLResponse to decode it.',
  'too-large': 'That value is larger than any real assertion. Check you pasted the right field.',
  'not-base64':
    'That is not base64. Copy the SAMLResponse form field, not the whole request or the URL around it.',
  'not-xml': 'That decoded, but not into XML. It may be a different field from the same request.',
  'not-saml':
    'That is XML, but not a SAML response or assertion. Check you copied the SAMLResponse field.',
};

const TRACE_FAILURE_COPY: Readonly<Record<SamlTraceReason, string>> = {
  disconnected: 'No Okta tab is connected, so there is no session to sign in with.',
  'app-unreadable': 'Okta would not return that app. Your admin role may not cover it.',
  'origin-unknown':
    'The Okta org this tab belongs to has not been identified yet. Reload the Okta tab and try again.',
  'no-sso-link':
    'That app has no sign-on link in this org, so there is no assertion to fetch. Apps using a non-SAML sign-on mode have none to give.',
  'fetch-failed': 'The sign-on request did not return an assertion.',
};

export interface SamlTracerProps {
  isActive?: boolean;
  targetTabId?: number | null;
  oktaOrigin?: string;
}

const SamlTracer: React.FC<SamlTracerProps> = ({
  isActive = true,
  targetTabId = null,
  oktaOrigin,
}) => {
  const [pasted, setPasted] = React.useState('');
  const [decoded, setDecoded] = React.useState<DecodedSaml | null>(null);
  const [refusal, setRefusal] = React.useState<SamlDecodeReason | null>(null);
  const [view, setView] = React.useState<ViewMode>('fields');
  const [appQuery, setAppQuery] = React.useState('');
  const [traceFailure, setTraceFailure] = React.useState<SamlTraceReason | null>(null);

  const index = useOrgEntityIndex();
  const { trace, isTracing } = useSamlTrace({ targetTabId, oktaOrigin });

  const appMatches = React.useMemo(
    () =>
      appQuery.trim().length < MIN_APP_QUERY
        ? []
        : index.searchByName('app', appQuery, MAX_APP_ROWS),
    [appQuery, index],
  );

  const decodeValue = React.useCallback((value: string) => {
    const result = decodeSamlResponse(value);
    if (result.ok) {
      setDecoded(result);
      setRefusal(null);
    } else {
      setDecoded(null);
      setRefusal(result.reason);
    }
  }, []);

  React.useEffect(() => {
    if (!isActive) {
      setPasted('');
      setDecoded(null);
      setRefusal(null);
      setAppQuery('');
      setTraceFailure(null);
    }
  }, [isActive]);

  const clear = () => {
    setPasted('');
    setDecoded(null);
    setRefusal(null);
    setTraceFailure(null);
  };

  const fetchFromApp = async (appId: string) => {
    if (isTracing) return;
    setTraceFailure(null);
    const result = await trace(appId);
    if (!result.ok) {
      setTraceFailure(result.reason);
      return;
    }
    setPasted(result.assertion);
    decodeValue(result.assertion);
  };

  return (
    <div className="space-y-(--sp-rung)">
      <Textarea
        value={pasted}
        onChange={setPasted}
        label="SAMLResponse"
        rows={4}
        placeholder="Paste the base64 SAMLResponse from the sign-on request"
        hint="Nothing here is stored. The decoded assertion is dropped when you clear the field or leave the tab."
      />

      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          onClick={() => decodeValue(pasted)}
          disabled={pasted.trim().length === 0}
        >
          Decode
        </Button>
        <Button variant="secondary" onClick={clear} disabled={pasted.length === 0 && !decoded}>
          Clear
        </Button>
      </div>

      <div className="space-y-2 border-t border-neutral-200 pt-(--sp-rung)">
        <AlertMessage
          message={{
            text: 'Fetching signs in to the app as you. Okta mints a real assertion and records an app sign-on in the org’s System Log.',
            type: 'warning',
          }}
        />
        <Input
          value={appQuery}
          onChange={setAppQuery}
          label="Fetch from an app"
          type="search"
          icon={<Icon type="search" size="sm" className="text-neutral-400" />}
          fullWidth
          disabled={targetTabId === null}
          placeholder="Search apps by name"
          hint={
            targetTabId === null
              ? 'Connect an Okta tab to fetch an assertion.'
              : 'Pick an app to follow its sign-on link and decode what comes back.'
          }
        />
        {appMatches.length > 0 && (
          <ul className="space-y-1">
            {appMatches.map((app) => (
              <li key={app.id}>
                <ListRow as="button" density="compact" onClick={() => void fetchFromApp(app.id)}>
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="truncate text-sm text-neutral-900">{app.name}</span>
                    {app.secondary && (
                      <span className="shrink-0 text-xs text-neutral-600">{app.secondary}</span>
                    )}
                  </div>
                </ListRow>
              </li>
            ))}
          </ul>
        )}
        {isTracing && (
          <p className="text-xs text-neutral-600" role="status">
            Signing in to fetch an assertion…
          </p>
        )}
        {traceFailure && (
          <AlertMessage
            message={{ text: TRACE_FAILURE_COPY[traceFailure], type: 'danger' }}
            onDismiss={() => setTraceFailure(null)}
          />
        )}
      </div>

      {refusal && (
        <AlertMessage
          message={{ text: REFUSAL_COPY[refusal], type: 'danger' }}
          onDismiss={() => setRefusal(null)}
        />
      )}

      {decoded ? (
        <div className="space-y-(--sp-rung)">
          <div className="flex items-center justify-between gap-2">
            <Tabs
              ariaLabel="Assertion view"
              activeKey={view}
              onChange={(key) => setView(key as ViewMode)}
              tabs={[
                { key: 'fields', label: 'Fields' },
                { key: 'tree', label: 'Tree' },
                { key: 'xml', label: 'XML' },
              ]}
            />
            <CopyButton label="Copy XML" getText={() => decoded.xml} size="sm" />
          </div>

          {view === 'fields' && <SamlFacts facts={decoded.facts} />}
          {view === 'tree' && <SamlXmlTree element={decoded.document.documentElement} />}
          {view === 'xml' && (
            <pre className="max-h-96 overflow-auto rounded-md border border-neutral-200 bg-white p-3 text-xs text-neutral-900">
              {decoded.xml}
            </pre>
          )}
        </div>
      ) : (
        !refusal && (
          <EmptyState
            icon="key"
            title="No assertion decoded yet"
            description="Paste a base64 SAMLResponse above, or fetch one from an app, to see what it claims about the person signing in."
          />
        )
      )}
    </div>
  );
};

export default SamlTracer;
