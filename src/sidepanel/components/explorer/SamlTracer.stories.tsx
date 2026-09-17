import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import React from 'react';
import SamlTracer from './SamlTracer';
import { OrgEntityIndexProvider } from '../../contexts/OrgEntityIndexContext';

const ASSERTION_XML = `<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion" Destination="https://sp.example.com/acs">
  <saml2:Issuer>http://www.okta.com/exkFAKE000000000000</saml2:Issuer>
  <saml2p:Status><saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></saml2p:Status>
  <saml2:Assertion>
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignatureValue>FAKE</ds:SignatureValue></ds:Signature>
    <saml2:Subject>
      <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">ada@example.com</saml2:NameID>
    </saml2:Subject>
    <saml2:Conditions NotBefore="2026-09-16T12:00:00.000Z" NotOnOrAfter="2026-09-16T12:05:00.000Z">
      <saml2:AudienceRestriction><saml2:Audience>https://sp.example.com/metadata</saml2:Audience></saml2:AudienceRestriction>
    </saml2:Conditions>
    <saml2:AttributeStatement>
      <saml2:Attribute Name="groups">
        <saml2:AttributeValue>Everyone</saml2:AttributeValue>
        <saml2:AttributeValue>Engineering</saml2:AttributeValue>
      </saml2:Attribute>
    </saml2:AttributeStatement>
  </saml2:Assertion>
</saml2p:Response>`;

const ASSERTION_B64 = btoa(String.fromCharCode(...new TextEncoder().encode(ASSERTION_XML)));

const meta = {
  title: 'Explorer/SamlTracer',
  component: SamlTracer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Paste a base64 SAMLResponse and read what it claims. It states what the ' +
          'assertion contains and stops there — diagnosing a failure would need the ' +
          "service provider's own configuration, which the panel does not have. Nothing " +
          'decoded here is stored, logged, or sent anywhere.',
      },
    },
  },
  args: { isActive: true, targetTabId: 1, oktaOrigin: 'https://example.okta.com' },
  decorators: [
    (Story: React.ComponentType) => (
      <OrgEntityIndexProvider oktaOrigin={null} targetTabId={null} enabled={false}>
        <Story />
      </OrgEntityIndexProvider>
    ),
  ],
} satisfies Meta<typeof SamlTracer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Decoded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', { name: 'Decode' }));

    await expect(canvas.getByText('ada@example.com')).toBeInTheDocument();
    await expect(canvas.getByText('https://sp.example.com/metadata')).toBeInTheDocument();
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();
  },
};

export const SignatureIsReportedNotJudged: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', { name: 'Decode' }));

    await expect(canvas.getByText('Present')).toBeInTheDocument();
    await expect(canvas.getByText(/needs the IdP's certificate/)).toBeInTheDocument();
  },
};

export const TreeView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', { name: 'Decode' }));
    await userEvent.click(canvas.getByRole('tab', { name: 'Tree' }));

    const root = canvas.getByRole('button', { name: /saml2p:Response/ });
    await expect(root).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(root);
    await expect(root).toHaveAttribute('aria-expanded', 'false');
  },
};

export const RefusesWhatIsNotAnAssertion: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste('this is not base64 at all !!');
    await userEvent.click(canvas.getByRole('button', { name: 'Decode' }));

    await expect(canvas.getByText(/That is not base64/)).toBeInTheDocument();
  },
};

export const ClearDropsIt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', { name: 'Decode' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));

    await expect(canvas.queryByText('ada@example.com')).not.toBeInTheDocument();
    await expect(canvas.getByLabelText('SAMLResponse')).toHaveValue('');
  },
};

export const StatesTheSideEffectBeforeFetching: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/records an app sign-on/)).toBeInTheDocument();
    await expect(canvas.getByLabelText('Fetch from an app')).toBeEnabled();
  },
};

export const FetchNeedsAConnectedTab: Story = {
  args: { targetTabId: null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Fetch from an app')).toBeDisabled();
    await expect(
      canvas.getByText('Connect an Okta tab to fetch an assertion.'),
    ).toBeInTheDocument();
  },
};
