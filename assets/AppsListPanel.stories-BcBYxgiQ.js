import{A as h}from"./AppsListPanel-CFzYjA_c.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./useStaggerReveal-CSztixYY.js";import"./AppListItem-B-91ahfe.js";import"./revealOnHover-DU3PDCIu.js";import"./useEntityQuery-D7Ia1EpU.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./dateFormat-C9yVDsck.js";import"./appFilters-CTS9Q_fJ.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:c,fn:p,userEvent:d,waitFor:g,within:m}=__STORYBOOK_MODULE_TEST__,u=[{id:"0oaFAKE0001",name:"salesforce",label:"Salesforce",status:"ACTIVE",signOnMode:"SAML_2_0",created:"2026-01-15T09:00:00.000Z",lastUpdated:"2026-06-02T11:30:00.000Z"},{id:"0oaFAKE0002",name:"workday",label:"Workday HR",status:"INACTIVE",signOnMode:"SAML_2_0",created:"2026-03-01T09:00:00.000Z"},{id:"0oaFAKE0003",name:"bookmark",label:"Internal Wiki",status:"ACTIVE",signOnMode:"BOOKMARK",created:"2025-11-20T09:00:00.000Z"}],F={title:"Apps/AppsListPanel",component:h,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'Renders an `AppListItem` per filtered app, forwarding the org origin and the lazy assignment-count fetcher, and a row skeleton while the inventory loads. The two empty states are distinct: "nothing loaded" offers a reload, "nothing matches" offers a filter reset — and only when a filter or search is actually active.'}}},argTypes:{loading:{description:"Whether the inventory load is in progress."},apps:{description:"Apps to render, already filtered and sorted."},hasApps:{description:"Whether any apps are loaded — picks which empty state to show."},activeFilterCount:{description:'Active-filter count — gates the "Clear filters" empty-state action.'},hasSearchQuery:{description:'Whether a search query is active — also gates "Clear filters".'},onClearFilters:{description:"Clears the search and status filters."},onReload:{description:"Reloads the inventory."},oktaOrigin:{description:"Okta origin passed to each row for its deep link."},fetchAssignmentCounts:{description:"Loads a single app's assignment counts, lazily, once its row is expanded."},selectedIds:{description:"Every basket id of kind 'app', including ones ticked elsewhere."},onToggleSelect:{description:"Tick or untick one row's app."}},args:{loading:!1,apps:u,hasApps:!0,activeFilterCount:0,hasSearchQuery:!1,totalCount:3,onClearFilters:p(),onReload:p(),oktaOrigin:"https://example.okta.com",fetchAssignmentCounts:p(async()=>({users:128,groups:4})),selectedIds:new Set,onToggleSelect:p()}},t={},s={play:async({canvasElement:a})=>{const e=m(a);await c(e.queryByText("128 users")).not.toBeInTheDocument(),await d.click(e.getByRole("button",{name:"Expand Salesforce"})),await c(e.getByRole("button",{name:"Collapse Salesforce"})).toBeInTheDocument(),await g(()=>c(e.getByText("128 users")).toBeInTheDocument())}},n={args:{loading:!0,apps:[]}},o={args:{apps:[],hasApps:!0,activeFilterCount:1,hasSearchQuery:!0},play:async({args:a,canvasElement:e})=>{const l=m(e);await d.click(l.getByRole("button",{name:"Clear filters"})),await c(a.onClearFilters).toHaveBeenCalled()}},r={args:{apps:[],hasApps:!1},play:async({args:a,canvasElement:e})=>{const l=m(e);await d.click(l.getByRole("button",{name:"Load applications"})),await c(a.onReload).toHaveBeenCalled()}},i={args:{selectedIds:new Set([u[0].id])}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source},description:{story:"Three applications spanning the active/inactive and SAML/bookmark axes.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('128 users')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Expand Salesforce'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Collapse Salesforce'
    })).toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  }
}`,...s.parameters?.docs?.source},description:{story:"Assignment counts arrive only once a row is expanded — never on the list render.",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    apps: []
  }
}`,...n.parameters?.docs?.source},description:{story:"The inventory load is in progress.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    apps: [],
    hasApps: true,
    activeFilterCount: 1,
    hasSearchQuery: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear filters'
    }));
    await expect(args.onClearFilters).toHaveBeenCalled();
  }
}`,...o.parameters?.docs?.source},description:{story:"Filters exclude every loaded app — offers a filter reset.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    apps: [],
    hasApps: false
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Load applications'
    }));
    await expect(args.onReload).toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source},description:{story:"Nothing loaded yet (or an org with no apps) — offers a reload.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: new Set([sampleApps[0].id])
  }
}`,...i.parameters?.docs?.source},description:{story:"One app already ticked — the row shows it, and the control line reports the count.",...i.parameters?.docs?.description}}};const I=["Default","ExpandingARowFetchesCounts","Loading","NoMatches","NothingLoaded","WithSelection"];export{t as Default,s as ExpandingARowFetchesCounts,n as Loading,o as NoMatches,r as NothingLoaded,i as WithSelection,I as __namedExportsOrder,F as default};
