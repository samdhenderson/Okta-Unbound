import{P as S}from"./PoliciesListPanel-CAO5PYRD.js";import{r as f}from"./entityCache-CUqsH66e.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./useStaggerReveal-CSztixYY.js";import"./PolicyCard-DdsyZFsZ.js";import"./revealOnHover-DU3PDCIu.js";import"./PolicyRulesList-CDkvg2jw.js";import"./useEntityQuery-D7Ia1EpU.js";const{expect:t,fn:i,userEvent:w,within:o}=__STORYBOOK_MODULE_TEST__,n=[{id:"rstFAKE000000000001",name:"Any two factors",status:"ACTIVE",type:"ACCESS_POLICY",priority:1,description:"Requires two factors for high-risk applications"},{id:"rstFAKE000000000002",name:"Contractor sign-on",status:"INACTIVE",type:"ACCESS_POLICY",priority:2,description:"Device-bound access for external contractors"},{id:"rstFAKE000000000003",name:"Default Policy",status:"ACTIVE",type:"ACCESS_POLICY",priority:3,system:!0}],b=[{id:"0prFAKE000000000001",name:"Catch-all Rule",status:"ACTIVE",priority:1,system:!0}],R={title:"Policies/PoliciesListPanel",component:S,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:'The Auth Policies tab\'s list region: a scrollable list of policy cards, and the right empty state for the situation. "Nothing loaded" also carries the admin-role caveat, because a `403` on the policies endpoint is indistinguishable from an org with no policies.'}}},argTypes:{isLoading:{description:"Whether a policy load is in flight."},policies:{description:"Policies after the search filter — what actually renders."},hasPolicies:{description:"Whether any policies are loaded (picks the empty state)."},onLoad:{description:"Load the policy list (the empty state's action)."},loadRules:{description:"Fetches a policy's rules for the expanded card."},selectedIds:{description:"Every basket id of kind 'policy', including ones ticked elsewhere."},onToggleSelect:{description:"Tick or untick one card's policy."},allFilteredSelected:{description:"Whether every searched policy is already picked — passed as a fact, never derived from the two counts."},onSelectAll:{description:"Replaces the policy selection with every searched policy."},onDeselectAll:{description:"Empties the policy partition."}},args:{isLoading:!1,policies:n,hasPolicies:!0,readState:"listed",onLoad:i(),loadRules:i(async()=>b),totalCount:3,selectedIds:new Set,onToggleSelect:i(),allFilteredSelected:!1,onSelectAll:i(),onDeselectAll:i()},beforeEach:()=>{f()}},c={},r={play:async({args:a,canvasElement:s})=>{const e=o(s);await w.click(e.getByRole("button",{name:"Show rules for Any two factors"})),await t(await e.findByText("Catch-all Rule")).toBeInTheDocument(),await t(a.loadRules).toHaveBeenCalledWith("rstFAKE000000000001")}},l={args:{isLoading:!0,policies:[],hasPolicies:!1}},d={args:{policies:[],hasPolicies:!1,readState:"listed"},play:async({args:a,canvasElement:s})=>{const e=o(s);await t(e.getByText("Okta reports this org has no app authentication policies.")).toBeInTheDocument(),await w.click(e.getByRole("button",{name:"Reload policies"})),await t(a.onLoad).toHaveBeenCalled()}},p={args:{policies:[],hasPolicies:!1,readState:"forbidden"},play:async({args:a,canvasElement:s})=>{const e=o(s);await t(e.getByText("Policies are not readable by this admin role")).toBeInTheDocument(),await t(e.queryByText(/ — or /)).not.toBeInTheDocument(),await w.click(e.getByRole("button",{name:"Check again"})),await t(a.onLoad).toHaveBeenCalled()}},h={args:{policies:[],hasPolicies:!1,readState:"unread"},play:async({canvasElement:a})=>{const s=o(a);await t(s.getByText("Nothing has been read from Okta yet.")).toBeInTheDocument()}},m={args:{policies:[],hasPolicies:!0}},u={args:{selectedIds:new Set([n[0].id])}},y={args:{selectedIds:new Set(n.map(a=>a.id)),allFilteredSelected:!0},play:async({canvasElement:a})=>{const s=o(a),e=s.getByRole("button",{name:"Select all"});await t(e).toBeDisabled(),await t(e).toHaveAccessibleDescription("All 3 policies matching the current search are already selected"),await t(s.getByRole("button",{name:"Deselect all"})).toBeEnabled()}},g={args:{policies:[n[0],n[2]],selectedIds:new Set([n[1].id,n[2].id]),allFilteredSelected:!1},play:async({args:a,canvasElement:s})=>{const e=o(s);await t(e.getByTestId("policies-count-line")).toHaveTextContent("Showing 2 of 3 · 2 selected");const v=e.getByRole("button",{name:"Select all"});await t(v).toBeEnabled(),await t(v).toHaveAccessibleDescription("Replace the policy selection with the 2 policies matching the current search"),await w.click(v),await t(a.onSelectAll).toHaveBeenCalledTimes(1),await w.click(e.getByRole("button",{name:"Deselect all"})),await t(a.onDeselectAll).toHaveBeenCalledTimes(1)}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source},description:{story:"Three policies.",...c.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Show rules for Any two factors'
    }));
    await expect(await canvas.findByText('Catch-all Rule')).toBeInTheDocument();
    await expect(args.loadRules).toHaveBeenCalledWith('rstFAKE000000000001');
  }
}`,...r.parameters?.docs?.source},description:{story:"Expanding a card fetches that policy's rules through `loadRules` and lists them.",...r.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true,
    policies: [],
    hasPolicies: false
  }
}`,...l.parameters?.docs?.source},description:{story:"The load is in flight.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    policies: [],
    hasPolicies: false,
    readState: 'listed'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Okta reports this org has no app authentication policies.')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Reload policies'
    }));
    await expect(args.onLoad).toHaveBeenCalled();
  }
}`,...d.parameters?.docs?.source},description:{story:`Okta answered and the org genuinely has none. The line says so outright: this
is an answer, not an absence.`,...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    policies: [],
    hasPolicies: false,
    readState: 'forbidden'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Policies are not readable by this admin role')).toBeInTheDocument();
    // No disjunction survives anywhere in the state.
    await expect(canvas.queryByText(/ — or /)).not.toBeInTheDocument();
    // A role can be widened, so re-checking stays available.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Check again'
    }));
    await expect(args.onLoad).toHaveBeenCalled();
  }
}`,...p.parameters?.docs?.source},description:{story:`Okta refused the read (403). Its own fact, named — where this used to print
"no policies found — or your admin role can't read policies" and leave the
reader to pick (D-D).`,...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    policies: [],
    hasPolicies: false,
    readState: 'unread'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing has been read from Okta yet.')).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"Nothing has been read yet, so nothing is claimed about the org.",...h.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    policies: [],
    hasPolicies: true
  }
}`,...m.parameters?.docs?.source},description:{story:"Policies are loaded but the search matches none of them.",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: new Set([samplePolicies[0].id])
  }
}`,...u.parameters?.docs?.source},description:{story:"One policy already ticked — the card shows it, and the control line reports the count.",...u.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: new Set(samplePolicies.map(policy => policy.id)),
    allFilteredSelected: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('All 3 policies matching the current search are already selected');
    await expect(canvas.getByRole('button', {
      name: 'Deselect all'
    })).toBeEnabled();
  }
}`,...y.parameters?.docs?.source},description:{story:`Every searched policy ticked. *Select all* is disabled rather than omitted —
it is furniture, not a verb — and its description names the boundary it is
standing on.`,...y.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    policies: [samplePolicies[0], samplePolicies[2]],
    selectedIds: new Set([samplePolicies[1].id, samplePolicies[2].id]),
    allFilteredSelected: false
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('policies-count-line')).toHaveTextContent('Showing 2 of 3 · 2 selected');
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeEnabled();
    await expect(selectAll).toHaveAccessibleDescription('Replace the policy selection with the 2 policies matching the current search');
    await userEvent.click(selectAll);
    await expect(args.onSelectAll).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Deselect all'
    }));
    await expect(args.onDeselectAll).toHaveBeenCalledTimes(1);
  }
}`,...g.parameters?.docs?.source},description:{story:`A basket the same size as the search result, holding different policies: the
search shows two cards, and of the two picks one was made on another screen.
The sizes agree and the sets do not, so *Select all* stays live — the boundary
stands on \`allFilteredSelected\`, asked of the searched list, never on
arithmetic over two counts that describe different sets.`,...g.parameters?.docs?.description}}};const I=["Default","ExpandingACard","Loading","NoPolicies","ReadForbidden","NotLoaded","NoSearchMatches","WithSelection","AllSearchedPoliciesSelected","SameSizeDifferentPolicies"];export{y as AllSearchedPoliciesSelected,c as Default,r as ExpandingACard,l as Loading,d as NoPolicies,m as NoSearchMatches,h as NotLoaded,p as ReadForbidden,g as SameSizeDifferentPolicies,u as WithSelection,I as __namedExportsOrder,R as default};
