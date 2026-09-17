import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IndexedEntity } from '../../hooks/useOrgEntityIndex';

const ASSERTION_XML = `<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" Destination="https://sp.example.com/acs">
  <saml2:Assertion>
    <saml2:Subject>
      <saml2:NameID>ada@example.com</saml2:NameID>
    </saml2:Subject>
  </saml2:Assertion>
</saml2p:Response>`;

const ASSERTION_B64 = btoa(ASSERTION_XML);

const APPS: IndexedEntity[] = [
  { kind: 'app', id: '0oaFAKE000000000000', name: 'Salesforce', secondary: 'SAML 2.0' },
];

const searchByName = vi.fn(() => APPS);
const fetchAppAssertion = vi.fn();

vi.mock('../../contexts/OrgEntityIndexContext', () => ({
  useOrgEntityIndex: () => ({
    searchByName,
    lookup: () => ({ status: 'unknown' }),
    isAuthoritative: () => false,
  }),
}));

vi.mock('../../hooks/useOktaApi', () => ({
  useOktaApi: () => ({ fetchAppAssertion }),
}));

const { default: SamlTracer } = await import('./SamlTracer');

beforeEach(() => {
  searchByName.mockClear();
  fetchAppAssertion.mockReset();
  fetchAppAssertion.mockResolvedValue({ ok: true, assertion: ASSERTION_B64 });
});

async function pickApp(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Fetch from an app'), 'sales');
  return screen.getByRole('button', { name: /Salesforce/ });
}

describe('SamlTracer fetch by app', () => {
  it('offers nothing until the query is worth scanning for', async () => {
    const user = userEvent.setup();
    render(<SamlTracer targetTabId={1} oktaOrigin="https://example.okta.com" />);

    await user.type(screen.getByLabelText('Fetch from an app'), 's');

    expect(searchByName).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /Salesforce/ })).not.toBeInTheDocument();
  });

  it('fetches the picked app and decodes what comes back', async () => {
    const user = userEvent.setup();
    render(<SamlTracer targetTabId={1} oktaOrigin="https://example.okta.com" />);

    await user.click(await pickApp(user));

    expect(fetchAppAssertion).toHaveBeenCalledWith(
      '0oaFAKE000000000000',
      'https://example.okta.com',
    );
    await waitFor(() => expect(screen.getByText('ada@example.com')).toBeInTheDocument());
    expect(screen.getByLabelText('SAMLResponse')).toHaveValue(ASSERTION_B64);
  });

  it('reports a failure by reason, and decodes nothing', async () => {
    fetchAppAssertion.mockResolvedValue({ ok: false, reason: 'no-sso-link' });
    const user = userEvent.setup();
    render(<SamlTracer targetTabId={1} oktaOrigin="https://example.okta.com" />);

    await user.click(await pickApp(user));

    await waitFor(() =>
      expect(screen.getByText(/no sign-on link in this org/)).toBeInTheDocument(),
    );
    expect(screen.getByLabelText('SAMLResponse')).toHaveValue('');
  });

  it('does not fetch twice while a fetch is in flight', async () => {
    let release: (value: unknown) => void = () => {};
    fetchAppAssertion.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<SamlTracer targetTabId={1} oktaOrigin="https://example.okta.com" />);

    const row = await pickApp(user);
    await user.click(row);
    await user.click(row);

    expect(fetchAppAssertion).toHaveBeenCalledTimes(1);

    release({ ok: true, assertion: ASSERTION_B64 });
    await waitFor(() => expect(screen.getByText('ada@example.com')).toBeInTheDocument());
  });

  it('drops the assertion and the app query when the tab goes away', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <SamlTracer isActive targetTabId={1} oktaOrigin="https://example.okta.com" />,
    );

    await user.click(await pickApp(user));
    await waitFor(() => expect(screen.getByText('ada@example.com')).toBeInTheDocument());

    rerender(<SamlTracer isActive={false} targetTabId={1} oktaOrigin="https://example.okta.com" />);

    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
    expect(screen.getByLabelText('SAMLResponse')).toHaveValue('');
    expect(screen.getByLabelText('Fetch from an app')).toHaveValue('');
  });
});
