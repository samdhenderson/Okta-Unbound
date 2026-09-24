import u from"./AppsTab-BPzgFCSb.js";import{u as g,m as f}from"./useOktaApi.mock-B7ApM7uM.js";import{V as w,W as h}from"./iframe-mmN7AxbW.js";import{o as d}from"./orgSnapshotStore-CqR6Bu-g.js";import"./AppsToolbar-CJBSu-b6.js";import"./AppsFilterPanel-JY18rcWu.js";import"./appFilters-CTS9Q_fJ.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";import"./AppsListPanel-CFzYjA_c.js";import"./useStaggerReveal-CSztixYY.js";import"./AppListItem-B-91ahfe.js";import"./revealOnHover-DU3PDCIu.js";import"./useEntityQuery-D7Ia1EpU.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./dateFormat-C9yVDsck.js";import"./AppsListActionBar-BP0Z1qP1.js";import"./useOwedLoad-DMyi27pQ.js";import"./useOrgSnapshot-BR7he6Mh.js";import"./useRefreshSubject-CLFXuOV-.js";import"./types-aoYpQiYS.js";import"./useRungSelection-DArsUsD0.js";import"./useSelection-BI2UGOh3.js";import"./selectionStore-CrmbAKHN.js";import"./preload-helper-PPVm8Dsz.js";import"./index-Dob3nYDb.js";const{expect:l,fn:S,userEvent:b,within:y}=__STORYBOOK_MODULE_TEST__,m="https://example.okta.com";async function p(a){await d.clearOrigin(m),a.length>0&&await d.upsertMany("apps",m,a.map(e=>({id:e.id,entity:e})),Date.now()),await d.patchMeta("apps",m,{complete:!0,lastFullWalkAt:Date.now(),itemCount:a.length})}const A=[{id:"0oaFAKE0001",name:"salesforce",label:"Salesforce",status:"ACTIVE",signOnMode:"SAML_2_0",created:"2026-01-15T09:00:00.000Z",lastUpdated:"2026-06-02T11:30:00.000Z"},{id:"0oaFAKE0002",name:"workday",label:"Workday HR",status:"INACTIVE",signOnMode:"SAML_2_0",created:"2026-03-01T09:00:00.000Z"},{id:"0oaFAKE0003",name:"bookmark",label:"Internal Wiki",status:"ACTIVE",signOnMode:"BOOKMARK",created:"2025-11-20T09:00:00.000Z"},{id:"0oaFAKE0004",name:"okta_org2org",status:"ACTIVE",signOnMode:"SAML_2_0"}],Y={title:"Apps/AppsTab",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:"Applications tab shell: browse, search, filter and sort the org's application inventory. It is read-only by construction — the rows come from the background-owned org snapshot, and the tab reaches for the API only lazily, per expanded row. A failed load surfaces as a dismissible `danger` banner rather than an empty list presented as complete."}}},argTypes:{targetTabId:{description:"Chrome tab id of the connected Okta tab; the inventory load is skipped when null."},oktaOrigin:{description:`Okta org origin used to build each row's "Open in Okta" deep link.`}},args:{targetTabId:1,oktaOrigin:"https://example.okta.com"},beforeEach:async()=>{w(),g.mockReturnValue(f({getAppAssignmentCounts:S(async()=>({users:128,groups:4}))})),await p(A)}},t={play:async({canvasElement:a})=>{await l(await y(a).findByText("Salesforce")).toBeInTheDocument()}},r={play:async({canvasElement:a})=>{const e=y(a);await e.findByText("Salesforce"),await b.type(e.getByRole("searchbox",{name:"Search applications"}),"Workday"),await l(await e.findByText("Workday HR")).toBeInTheDocument(),await l(e.queryByText("Salesforce")).not.toBeInTheDocument()}},o={beforeEach:async()=>{await p([]),h(()=>new Promise(()=>{}))}},s={beforeEach:async()=>{await p([])}},n={beforeEach:async()=>{await p([]),h(async()=>({success:!1,error:"Failed to fetch apps"}))}},i={args:{targetTabId:null}},c={beforeEach:async()=>{await p(Array.from({length:60},(a,e)=>({id:`0oaFAKE${String(e).padStart(4,"0")}`,name:`sample_app_${e}`,label:`Sample App ${e+1}`,status:e%4===0?"INACTIVE":"ACTIVE",signOnMode:e%3===0?"BOOKMARK":"SAML_2_0",created:"2026-02-01T09:00:00.000Z"})))}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  // The rows come from IndexedDB, not a mocked fetch, so this asserts the seed reached
  // the screen: without it the story would "pass" while rendering the empty state.
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText('Salesforce')).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source},description:{story:"Four applications loaded — the populated list with its toolbar.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Salesforce');
    await userEvent.type(canvas.getByRole('searchbox', {
      name: 'Search applications'
    }), 'Workday');
    await expect(await canvas.findByText('Workday HR')).toBeInTheDocument();
    await expect(canvas.queryByText('Salesforce')).not.toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"Searching narrows the inventory to the rows whose label matches.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedInventory([]);
    setSyncSnapshotResponder(() => new Promise<unknown>(() => {}));
  }
}`,...o.parameters?.docs?.source},description:{story:"The inventory sync is still in flight — full-panel spinner.",...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedInventory([]);
  }
}`,...s.parameters?.docs?.source},description:{story:'An org with no applications — the "nothing loaded" empty state.',...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedInventory([]);
    setSyncSnapshotResponder(async () => ({
      success: false,
      error: 'Failed to fetch apps'
    }));
  }
}`,...n.parameters?.docs?.source},description:{story:"The inventory load failed — dismissible `danger` banner above the empty list.",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null
  }
}`,...i.parameters?.docs?.source},description:{story:"No Okta tab connected — nothing is fetched and Refresh is disabled.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  beforeEach: async () => {
    await seedInventory(Array.from({
      length: 60
    }, (_, i) => ({
      id: \`0oaFAKE\${String(i).padStart(4, '0')}\`,
      name: \`sample_app_\${i}\`,
      label: \`Sample App \${i + 1}\`,
      status: i % 4 === 0 ? 'INACTIVE' : 'ACTIVE',
      signOnMode: i % 3 === 0 ? 'BOOKMARK' : 'SAML_2_0',
      created: '2026-02-01T09:00:00.000Z'
    })) as OktaAppListItem[]);
  }
}`,...c.parameters?.docs?.source},description:{story:"A larger inventory (60 generated apps), exercising the scrollable list.",...c.parameters?.docs?.description}}};const j=["Default","Searching","Loading","Empty","ErrorState","Disconnected","LargeInventory"];export{t as Default,i as Disconnected,s as Empty,n as ErrorState,c as LargeInventory,o as Loading,r as Searching,j as __namedExportsOrder,Y as default};
