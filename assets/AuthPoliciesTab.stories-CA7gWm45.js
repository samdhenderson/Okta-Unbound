import T from"./AuthPoliciesTab-Dgt7HWqn.js";import{u as s,m as n}from"./useOktaApi.mock-B7ApM7uM.js";import{r as i}from"./entityCache-CUqsH66e.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./PoliciesListPanel-CAO5PYRD.js";import"./useStaggerReveal-CSztixYY.js";import"./PolicyCard-DdsyZFsZ.js";import"./revealOnHover-DU3PDCIu.js";import"./PolicyRulesList-CDkvg2jw.js";import"./useEntityQuery-D7Ia1EpU.js";import"./PoliciesListActionBar-D_LkEEnw.js";import"./useOwedLoad-DMyi27pQ.js";import"./usePoliciesData-oY6cZYph.js";import"./keys-CUIcVywe.js";import"./useRefreshSubject-CLFXuOV-.js";import"./useRungSelection-DArsUsD0.js";import"./useSelection-BI2UGOh3.js";import"./selectionStore-CrmbAKHN.js";import"./policyFilters-0Alm462X.js";import"./dateFormat-C9yVDsck.js";const{expect:o,fn:a,userEvent:g,waitFor:E,within:w}=__STORYBOOK_MODULE_TEST__,b=[{id:"rstFAKE000000000001",name:"Any two factors",status:"ACTIVE",type:"ACCESS_POLICY",priority:1,description:"Requires two factors for high-risk applications",system:!1,created:"2026-01-15T09:00:00.000Z",lastUpdated:"2026-06-02T11:30:00.000Z"},{id:"rstFAKE000000000002",name:"Contractor sign-on",status:"INACTIVE",type:"ACCESS_POLICY",priority:2,description:"Device-bound access for external contractors",system:!1,created:"2026-02-01T09:00:00.000Z"},{id:"rstFAKE000000000003",name:"Default Policy",status:"ACTIVE",type:"ACCESS_POLICY",priority:3,description:"Catch-all policy applied to apps with no explicit policy",system:!0}],v=[{id:"0prFAKE000000000001",name:"Trusted device, no prompt",status:"ACTIVE",priority:1},{id:"0prFAKE000000000002",name:"Off-network step-up",status:"ACTIVE",priority:2},{id:"0prFAKE000000000003",name:"Catch-all Rule",status:"ACTIVE",priority:3,system:!0}],N={title:"Policies/AuthPoliciesTab",component:T,tags:["autodocs"],parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:"Auth Policies tab shell: browse and search the org's app authentication policies, with each card's rules fetched lazily on expand.\n\nRead-only by construction. Because Okta's policy endpoints are commonly forbidden for non-super-admins, a `403` is indistinguishable from an empty org, so the empty state names both."}}},argTypes:{targetTabId:{description:"Chrome tab id of the connected Okta tab; the load is skipped when absent."},isActive:{description:"Whether this is the selected top-level tab; the load defers until it is."},selectedPolicyId:{description:"A policy to arrive at, applied once as a filter then cleared."}},args:{targetTabId:1},beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(async()=>({outcome:"listed",policies:b})),getPolicyRules:a(async()=>v)}))}},c={},l={beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(()=>new Promise(()=>{}))}))}},p={beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(async()=>({outcome:"listed",policies:[]}))}))},play:async({canvasElement:t})=>{const e=w(t);await o(await e.findByText("Okta reports this org has no app authentication policies.")).toBeInTheDocument()}},d={beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(async()=>({outcome:"forbidden"}))}))},play:async({canvasElement:t})=>{const e=w(t);await o(await e.findByText("Policies are not readable by this admin role")).toBeInTheDocument(),await o(e.queryByRole("button",{name:/dismiss/i})).not.toBeInTheDocument()}},m={beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(async()=>({outcome:"failed",message:"Failed to fetch auth policies"}))}))}},u={play:async({canvasElement:t})=>{const e=w(t),r=await e.findByRole("button",{name:"Show rules for Any two factors"});await g.click(r),await E(()=>o(e.getByText("Trusted device, no prompt")).toBeInTheDocument())}},y={play:async({canvasElement:t})=>{const e=w(t),r=await e.findByRole("button",{name:"Show rules for Any two factors"});await g.click(r),await E(()=>o(e.getByText(/Could not load rules/)).toBeInTheDocument())},beforeEach:()=>{i(),s.mockReturnValue(n({listPolicies:a(async()=>({outcome:"listed",policies:b})),getPolicyRules:a(async()=>{throw new Error("Policy rules unavailable")})}))}},h={play:async({canvasElement:t})=>{const e=w(t),r=await e.findByRole("searchbox",{name:"Search auth policies"});await g.type(r,"contractor"),await E(()=>o(e.getByText("Contractor sign-on")).toBeInTheDocument()),await o(e.queryByText("Any two factors")).not.toBeInTheDocument()}},f={args:{targetTabId:void 0}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source},description:{story:"Three policies loaded — the populated list with its search box.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      listPolicies: fn(() => new Promise<never>(() => {}))
    }));
  }
}`,...l.parameters?.docs?.source},description:{story:"The policy load is still in flight — full-panel spinner.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      listPolicies: fn(async () => ({
        outcome: 'listed',
        policies: []
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Okta reports this org has no app authentication policies.')).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Okta answered and the org has no app authentication policies.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      listPolicies: fn(async () => ({
        outcome: 'forbidden'
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Policies are not readable by this admin role')).toBeInTheDocument();
    // A refusal is a standing fact, not a banner to dismiss.
    await expect(canvas.queryByRole('button', {
      name: /dismiss/i
    })).not.toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:`Okta refused the read for this admin role. Its own state, its own sentence —
this is what used to be folded into the empty state as "or your admin role
can't read policies" (D-D).`,...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      listPolicies: fn(async () => ({
        outcome: 'failed' as const,
        message: 'Failed to fetch auth policies'
      }))
    }));
  }
}`,...m.parameters?.docs?.source},description:{story:"The policy load failed — dismissible `danger` banner above the empty list.",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: 'Show rules for Any two factors'
    });
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText('Trusted device, no prompt')).toBeInTheDocument());
  }
}`,...u.parameters?.docs?.source},description:{story:"A policy expanded to reveal its lazily-fetched rules.",...u.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: 'Show rules for Any two factors'
    });
    await userEvent.click(toggle);
    await waitFor(() => expect(canvas.getByText(/Could not load rules/)).toBeInTheDocument());
  },
  beforeEach: () => {
    resetEntityCache();
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      listPolicies: fn(async () => ({
        outcome: 'listed',
        policies: samplePolicies
      })),
      getPolicyRules: fn(async () => {
        throw new Error('Policy rules unavailable');
      })
    }));
  }
}`,...y.parameters?.docs?.source},description:{story:"A policy whose rules fail to load — the inline per-policy `danger` state on expand.",...y.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const search = await canvas.findByRole('searchbox', {
      name: 'Search auth policies'
    });
    await userEvent.type(search, 'contractor');
    await waitFor(() => expect(canvas.getByText('Contractor sign-on')).toBeInTheDocument());
    await expect(canvas.queryByText('Any two factors')).not.toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"Type into the search box: the list narrows to the matching policy.",...h.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: undefined
  }
}`,...f.parameters?.docs?.source},description:{story:'No Okta tab connected — nothing is fetched; the header offers "Load Policies".',...f.parameters?.docs?.description}}};const M=["Default","Loading","Empty","ReadForbidden","ErrorState","ExpandedRules","RulesLoadFailure","SearchFiltersList","Disconnected"];export{c as Default,f as Disconnected,p as Empty,m as ErrorState,u as ExpandedRules,l as Loading,d as ReadForbidden,y as RulesLoadFailure,h as SearchFiltersList,M as __namedExportsOrder,N as default};
