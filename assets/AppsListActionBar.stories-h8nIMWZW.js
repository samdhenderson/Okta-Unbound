import{j as l}from"./iframe-mmN7AxbW.js";import{A as p}from"./AppsListActionBar-BP0Z1qP1.js";import{A as h}from"./AppsToolbar-CJBSu-b6.js";import"./preload-helper-PPVm8Dsz.js";const{expect:t,fn:i,within:o}=__STORYBOOK_MODULE_TEST__,g={title:"Apps/AppsListActionBar",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The applications rung is read-only, so it has no page verbs at all — its `actions` array is empty by declaration, and `ActionBar` draws no row rather than a band of padding above nothing. It passes no selection `register` either: `Select all` and `Deselect all` are furniture, not verbs, and they live on `AppsListPanel`’s `ListCountRow` beside the figures they act on. A register with nothing in it would be a reserved row of padding, and there is no selection verb here for it to keep from popping into the band.\n\nWhat is left is the search row as the band’s sub-row, so the controls and the list dock as one surface. No control here states a count: `AppsListPanel`’s `ListCountRow`, directly above the rows, is the rung’s one statement of how many matched and how many are ticked."}}},argTypes:{search:{description:"The rung’s search and filter disclosure, rendered as the band’s sub-row."}}},a={play:async({canvasElement:r})=>{const e=o(r),s=e.getByRole("group",{name:"Actions for the applications list"});await t(e.queryByTestId("action-bar-register")).not.toBeInTheDocument(),await t(o(s).queryAllByRole("button")).toHaveLength(0)}},n={args:{search:l.jsx(h,{searchQuery:"",onSearchQueryChange:i(),filtersOpen:!1,onToggleFilters:i(),activeFilterCount:0})},play:async({canvasElement:r})=>{const e=o(r),s=e.getByRole("group",{name:"Actions for the applications list"});await t(o(s).getByLabelText("Search applications")).toBeInTheDocument(),await t(o(s).getByRole("button",{name:"Filters"})).toBeInTheDocument(),await t(e.queryByTestId("action-bar-register")).not.toBeInTheDocument();for(const c of["Select all","Deselect all"])await t(e.queryByRole("button",{name:c})).not.toBeInTheDocument()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByRole('group', {
      name: 'Actions for the applications list'
    });
    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    await expect(within(band).queryAllByRole('button')).toHaveLength(0);
  }
}`,...a.parameters?.docs?.source},description:{story:`The strip with nothing passed: no action row, and no register. The band is
declared for the rung it labels, not for controls it does not have.`,...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    search: <AppsToolbar searchQuery="" onSearchQueryChange={fn()} filtersOpen={false} onToggleFilters={fn()} activeFilterCount={0} />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const band = canvas.getByRole('group', {
      name: 'Actions for the applications list'
    });

    // The search sits inside the band, so the two dock as one surface.
    await expect(within(band).getByLabelText('Search applications')).toBeInTheDocument();
    await expect(within(band).getByRole('button', {
      name: 'Filters'
    })).toBeInTheDocument();
    await expect(canvas.queryByTestId('action-bar-register')).not.toBeInTheDocument();
    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', {
        name
      })).not.toBeInTheDocument();
    }
  }
}`,...n.parameters?.docs?.source},description:{story:`The rung as it actually renders: the real {@link AppsToolbar} in the sub-row.
Its filter disclosure is the only control the band offers — there is still no
register, and no selection furniture anywhere in the strip.`,...n.parameters?.docs?.description}}};const b=["Default","WithSearch"];export{a as Default,n as WithSearch,b as __namedExportsOrder,g as default};
