import{j as y}from"./iframe-mmN7AxbW.js";import f from"./ApiExplorerTab-BFaZ8qyV.js";import{O as h}from"./OrgEntityIndexContext-DK-zeuDH.js";import{u as p,m as d}from"./useOktaApi.mock-B7ApM7uM.js";import"./preload-helper-PPVm8Dsz.js";import"./featureFlags-DnWGFDCb.js";import"./redact-D38qASmd.js";import"./shapeInference-CxaCm6QT.js";import"./PathCombobox-Bccrtu0U.js";import"./paletteRowStyles-ldxw9afL.js";import"./SamlTracer-CFnNZn-D.js";import"./useEntitySearchSources-C0IDcNC-.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./usePoliciesData-oY6cZYph.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./policyFilters-0Alm462X.js";import"./useOrgSnapshot-BR7he6Mh.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleUtils-Vt2BA8lQ.js";const{expect:u,fn:g,userEvent:a,waitFor:l,within:m}=__STORYBOOK_MODULE_TEST__,G={title:"ApiExplorer/ApiExplorerTab",component:f,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:"A dev-tool surface for discovering what an Okta endpoint's response actually contains. It is GET-only and goes through the same scheduler path as every other feature, so it adds no write surface. The response viewer defaults to the values-free Shape view; Redacted and Raw are one click away."}}},argTypes:{targetTabId:{description:"Chrome tab id of the connected Okta tab; sending is disabled when null."},oktaOrigin:{description:"Okta org origin, used to redact it out of embedded response URLs."}},args:{targetTabId:1,oktaOrigin:"https://example.okta.com"},decorators:[t=>y.jsx(h,{oktaOrigin:null,targetTabId:null,enabled:!1,children:y.jsx(t,{})})],beforeEach:()=>{p.mockReturnValue(d())}},o={},s={beforeEach:()=>{p.mockReturnValue(d({makeApiRequest:g(async()=>({success:!0,status:200,data:{id:"00uFAKE000000000001",status:"ACTIVE",profile:{login:"ada@example.com"}}}))}))},play:async({canvasElement:t})=>{const e=m(t),n=e.getByRole("combobox",{name:"API path"});await a.type(n,"/api/v1/users/00uFAKE000000000001"),await a.click(e.getByRole("button",{name:"Send"})),await l(()=>u(e.getByText("200")).toBeInTheDocument())}},r={beforeEach:()=>{p.mockReturnValue(d({makeApiRequest:g(async()=>({success:!1,error:"Endpoint not found"}))}))},play:async({canvasElement:t})=>{const e=m(t),n=e.getByRole("combobox",{name:"API path"});await a.type(n,"/api/v1/nope"),await a.click(e.getByRole("button",{name:"Send"})),await l(()=>u(e.getByText("Endpoint not found")).toBeInTheDocument())}},i={args:{targetTabId:null}},c={play:async({canvasElement:t})=>{const e=m(t),n=e.getByRole("combobox",{name:"API path"});await a.clear(n),await a.type(n,"/api/v1/users/{{userId}}/factors"),await a.click(e.getByRole("button",{name:"Send"})),await l(()=>u(e.getByText("Fill in {userId} before sending.")).toBeInTheDocument())}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source},description:{story:"No request sent yet — the empty state names the affordance.",...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      makeApiRequest: fn(async () => ({
        success: true,
        status: 200,
        data: {
          id: '00uFAKE000000000001',
          status: 'ACTIVE',
          profile: {
            login: 'ada@example.com'
          }
        }
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(input, '/api/v1/users/00uFAKE000000000001');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Send'
    }));
    await waitFor(() => expect(canvas.getByText('200')).toBeInTheDocument());
  }
}`,...s.parameters?.docs?.source},description:{story:"A GET fired and answered — the Shape view over a populated response.",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      makeApiRequest: fn(async () => ({
        success: false,
        error: 'Endpoint not found'
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(input, '/api/v1/nope');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Send'
    }));
    await waitFor(() => expect(canvas.getByText('Endpoint not found')).toBeInTheDocument());
  }
}`,...r.parameters?.docs?.source},description:{story:"The request failed — a dismissible `danger` banner above the untouched empty state.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null
  }
}`,...i.parameters?.docs?.source},description:{story:"No Okta tab connected — Send stays disabled regardless of path.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });

    // \`{{\` and \`}}\` are userEvent's escapes for the literal braces.
    await userEvent.clear(field);
    await userEvent.type(field, '/api/v1/users/{{userId}}/factors');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Send'
    }));
    await waitFor(() => expect(canvas.getByText('Fill in {userId} before sending.')).toBeInTheDocument());
  }
}`,...c.parameters?.docs?.source},description:{story:"A path still carrying a `{token}` is not a request. The refusal names the token,\nwhich is the one thing Okta's own 404 would not have told you.",...c.parameters?.docs?.description}}};const H=["Default","Sent","ErrorState","Disconnected","RefusingAnUnfilledHole"];export{o as Default,i as Disconnected,r as ErrorState,c as RefusingAnUnfilledHole,s as Sent,H as __namedExportsOrder,G as default};
