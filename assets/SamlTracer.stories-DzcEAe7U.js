import{j as w}from"./iframe-mmN7AxbW.js";import{S as y}from"./SamlTracer-CFnNZn-D.js";import{O as h}from"./OrgEntityIndexContext-DK-zeuDH.js";import"./preload-helper-PPVm8Dsz.js";import"./useOktaApi.mock-B7ApM7uM.js";import"./useOrgSnapshot-BR7he6Mh.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleUtils-Vt2BA8lQ.js";const{expect:n,userEvent:t,within:s}=__STORYBOOK_MODULE_TEST__,v=`<saml2p:Response xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
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
</saml2p:Response>`,u=btoa(String.fromCharCode(...new TextEncoder().encode(v))),D={title:"Explorer/SamlTracer",component:y,parameters:{layout:"padded",docs:{description:{component:"Paste a base64 SAMLResponse and read what it claims. It states what the assertion contains and stops there — diagnosing a failure would need the service provider's own configuration, which the panel does not have. Nothing decoded here is stored, logged, or sent anywhere."}}},args:{isActive:!0,targetTabId:1,oktaOrigin:"https://example.okta.com"},decorators:[a=>w.jsx(h,{oktaOrigin:null,targetTabId:null,enabled:!1,children:w.jsx(a,{})})]},o={},c={play:async({canvasElement:a})=>{const e=s(a);await t.click(e.getByLabelText("SAMLResponse")),await t.paste(u),await t.click(e.getByRole("button",{name:"Decode"})),await n(e.getByText("ada@example.com")).toBeInTheDocument(),await n(e.getByText("https://sp.example.com/metadata")).toBeInTheDocument(),await n(e.getByText("Engineering")).toBeInTheDocument()}},r={play:async({canvasElement:a})=>{const e=s(a);await t.click(e.getByLabelText("SAMLResponse")),await t.paste(u),await t.click(e.getByRole("button",{name:"Decode"})),await n(e.getByText("Present")).toBeInTheDocument(),await n(e.getByText(/needs the IdP's certificate/)).toBeInTheDocument()}},i={play:async({canvasElement:a})=>{const e=s(a);await t.click(e.getByLabelText("SAMLResponse")),await t.paste(u),await t.click(e.getByRole("button",{name:"Decode"})),await t.click(e.getByRole("tab",{name:"Tree"}));const g=e.getByRole("button",{name:/saml2p:Response/});await n(g).toHaveAttribute("aria-expanded","true"),await t.click(g),await n(g).toHaveAttribute("aria-expanded","false")}},l={play:async({canvasElement:a})=>{const e=s(a);await t.click(e.getByLabelText("SAMLResponse")),await t.paste("this is not base64 at all !!"),await t.click(e.getByRole("button",{name:"Decode"})),await n(e.getByText(/That is not base64/)).toBeInTheDocument()}},p={play:async({canvasElement:a})=>{const e=s(a);await t.click(e.getByLabelText("SAMLResponse")),await t.paste(u),await t.click(e.getByRole("button",{name:"Decode"})),await t.click(e.getByRole("button",{name:"Clear"})),await n(e.queryByText("ada@example.com")).not.toBeInTheDocument(),await n(e.getByLabelText("SAMLResponse")).toHaveValue("")}},m={play:async({canvasElement:a})=>{const e=s(a);await n(e.getByText(/records an app sign-on/)).toBeInTheDocument(),await n(e.getByLabelText("Fetch from an app")).toBeEnabled()}},d={args:{targetTabId:null},play:async({canvasElement:a})=>{const e=s(a);await n(e.getByLabelText("Fetch from an app")).toBeDisabled(),await n(e.getByText("Connect an Okta tab to fetch an assertion.")).toBeInTheDocument()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source},description:{story:"Nothing pasted yet.",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // \`paste\` rather than \`type\`: the fixture is a few thousand characters, and
    // pasting is what a reader actually does here.
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Decode'
    }));
    await expect(canvas.getByText('ada@example.com')).toBeInTheDocument();
    await expect(canvas.getByText('https://sp.example.com/metadata')).toBeInTheDocument();
    await expect(canvas.getByText('Engineering')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"A decoded assertion, opening on the facts a sign-on problem is usually about.",...c.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Decode'
    }));
    await expect(canvas.getByText('Present')).toBeInTheDocument();
    await expect(canvas.getByText(/needs the IdP's certificate/)).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:`A signature element is reported as present and **not** as valid — verifying one
needs the IdP's certificate, which the panel does not have.`,...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Decode'
    }));
    await userEvent.click(canvas.getByRole('tab', {
      name: 'Tree'
    }));
    const root = canvas.getByRole('button', {
      name: /saml2p:Response/
    });
    await expect(root).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(root);
    await expect(root).toHaveAttribute('aria-expanded', 'false');
  }
}`,...i.parameters?.docs?.source},description:{story:"The tree view folds the assertion instead of scrolling it.",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste('this is not base64 at all !!');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Decode'
    }));
    await expect(canvas.getByText(/That is not base64/)).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"A refusal names what went wrong with the paste, not what went wrong with the login.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('SAMLResponse'));
    await userEvent.paste(ASSERTION_B64);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Decode'
    }));
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear'
    }));
    await expect(canvas.queryByText('ada@example.com')).not.toBeInTheDocument();
    await expect(canvas.getByLabelText('SAMLResponse')).toHaveValue('');
  }
}`,...p.parameters?.docs?.source},description:{story:"Clear drops the assertion — it is a credential, not a document.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/records an app sign-on/)).toBeInTheDocument();
    await expect(canvas.getByLabelText('Fetch from an app')).toBeEnabled();
  }
}`,...m.parameters?.docs?.source},description:{story:`The consequence is on screen before the control that causes it: fetching an
assertion is a sign-on, and it is logged as one.`,...m.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Fetch from an app')).toBeDisabled();
    await expect(canvas.getByText('Connect an Okta tab to fetch an assertion.')).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"With no Okta tab connected there is no session to sign in with, and the field says so.",...d.parameters?.docs?.description}}};const L=["Empty","Decoded","SignatureIsReportedNotJudged","TreeView","RefusesWhatIsNotAnAssertion","ClearDropsIt","StatesTheSideEffectBeforeFetching","FetchNeedsAConnectedTab"];export{p as ClearDropsIt,c as Decoded,o as Empty,d as FetchNeedsAConnectedTab,l as RefusesWhatIsNotAnAssertion,r as SignatureIsReportedNotJudged,m as StatesTheSideEffectBeforeFetching,i as TreeView,L as __namedExportsOrder,D as default};
