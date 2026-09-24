import{j as l,e as h,I as p}from"./iframe-mmN7AxbW.js";import{P as d}from"./PoliciesListActionBar-D_LkEEnw.js";import"./preload-helper-PPVm8Dsz.js";const{expect:t,fn:u,within:c}=__STORYBOOK_MODULE_TEST__,g={title:"Policies/PoliciesListActionBar",component:d,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The auth-policies rung is read-only by design, so it declares no page verbs — the `actions` array is empty and `ActionBar` draws no row for it. The search is the sub-row, and it is the only thing this band carries.\n\nThere is **no selection register**: `Select all` and `Deselect all` are furniture rather than verbs, and they stand on `PoliciesListPanel`’s count row beside the numbers they act on. The register is a measured row that exists to stop a selection verb popping into the band on the first tick; this rung has no such verb, so an empty register would be reserved space for nothing.\n\nNo control here states a count: `PoliciesListPanel`’s count row is the rung’s one statement of both numbers."}}},argTypes:{search:{description:"The rung’s search field, rendered as the band’s sub-row."}},args:{}},n={play:async({canvasElement:a})=>{const e=c(a);await t(e.getByTestId("policies-list-action-bar")).toBeInTheDocument(),await t(e.queryAllByRole("button")).toHaveLength(0)}},o={play:async({canvasElement:a})=>{const e=c(a);await t(e.queryByTestId("action-bar-register")).not.toBeInTheDocument(),await t(e.queryByRole("group",{name:"Selection actions for the auth policies list"})).not.toBeInTheDocument();for(const r of["Select all","Deselect all"])await t(e.queryByRole("button",{name:r})).not.toBeInTheDocument()}},s={args:{search:l.jsx(h,{value:"",onChange:u(),type:"search",icon:l.jsx(p,{type:"search",size:"md"}),ariaLabel:"Search auth policies",placeholder:"Search policies by name or description…"})},play:async({canvasElement:a})=>{const e=c(a),r=e.getByTestId("policies-list-action-bar"),i=c(r).getByLabelText("Search auth policies");await t(i).toBeInTheDocument(),await t(r).toContainElement(i),await t(e.queryAllByRole("button")).toHaveLength(0)}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('policies-list-action-bar')).toBeInTheDocument();
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  }
}`,...n.parameters?.docs?.source},description:{story:`The band with nothing in it. Both declared rows are empty — no page verb, and
no selection register — so the band renders no control at all.`,...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('group', {
      name: 'Selection actions for the auth policies list'
    })).not.toBeInTheDocument();
    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', {
        name
      })).not.toBeInTheDocument();
    }
  }
}`,...o.parameters?.docs?.source},description:{story:`No register is rendered, not even an empty one: the furniture that used to sit
here lives on the count row above the list, and a reserved row with nothing
to reserve space for would cost the band height it cannot justify.`,...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    search: <Input value="" onChange={fn()} type="search" icon={<Icon type="search" size="md" />} ariaLabel="Search auth policies" placeholder="Search policies by name or description…" />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByTestId('policies-list-action-bar');
    const search = within(band).getByLabelText('Search auth policies');
    await expect(search).toBeInTheDocument();
    // The search is the band's whole content: no verb row, no register.
    await expect(band).toContainElement(search);
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  }
}`,...s.parameters?.docs?.source},description:{story:`With the search in the sub-row, which is what the rung actually renders — and
the sub-row leads the band, since the empty action row is not drawn.`,...s.parameters?.docs?.description}}};const w=["Default","NoSelectionRegister","WithSearch"];export{n as Default,o as NoSelectionRegister,s as WithSearch,w as __namedExportsOrder,g as default};
