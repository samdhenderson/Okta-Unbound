import{G as y}from"./GroupsListActionBar-CWErzllV.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:t,fn:h,userEvent:d,within:o}=__STORYBOOK_MODULE_TEST__,b={title:"Groups/GroupsListActionBar",component:y,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The groups-list rung's action bar: a page-scoped action row and a selection-scoped register, rendered as the band's last row on the band's own surface. *Export list* acts on the filter and is present in every state; *Export* acts on the ticked rows and is gone the moment they are unticked.\n\n`Select all` and `Deselect all` are **not here**. They are furniture rather than verbs, and they live on the rung's count row (`shared/ListCountRow`, rendered by `GroupsListPanel`) beside the numbers they act on. What is left in the register acts on the selection: *Compare* in the row, *Export* in the tier.\n\nThe register is still passed in every state, empty included, so ticking a row adds controls to a row that already exists and nothing below the band moves. Its leading control is never the export: the register's contents change as rows are ticked, so whatever leads it must cost at worst another click."}}},args:{selectedCount:0,filteredCount:42,onCompare:h(),onExportSelection:h(),onExportGroupsList:h()},argTypes:{selectedCount:{description:"Number of currently selected groups."},filteredCount:{description:"Number of groups after filtering."},onCompare:{description:"Opens the comparison modal (offered only for 2–5 selections)."},onExportSelection:{description:"Exports the selected groups."},onExportGroupsList:{description:"Exports the current (filtered) groups list."}}},r={play:async({args:s,canvasElement:n})=>{const e=o(n),a=e.getByRole("group",{name:"Selection actions for the groups list"});await t(o(a).queryAllByRole("button")).toHaveLength(0),await t(e.queryByRole("button",{name:"Select all"})).not.toBeInTheDocument(),await t(e.queryByRole("button",{name:"Deselect all"})).not.toBeInTheDocument(),await t(e.queryByRole("button",{name:/^Compare/})).not.toBeInTheDocument(),await d.click(e.getByRole("button",{name:"Export list"})),await t(s.onExportGroupsList).toHaveBeenCalledTimes(1)}},i={args:{selectedCount:3},play:async({canvasElement:s})=>{const n=o(s),e=n.getByRole("group",{name:"Selection actions for the groups list"}),a=o(e).getAllByRole("button")[0];await t(a).toHaveAccessibleName("Compare"),await t(n.getByRole("button",{name:"Export"})).toBeInTheDocument(),await t(o(e).queryByRole("button",{name:"Export"})).not.toBeInTheDocument()}},c={args:{selectedCount:3},play:async({args:s,canvasElement:n})=>{const e=o(n),a=e.getByRole("group",{name:"Selection actions for the groups list"});await t(o(a).getAllByRole("button").map(g=>g.textContent)).toEqual(["Compare"]);const m=e.getByRole("button",{name:"Compare"});await t(m).toHaveAccessibleDescription("Compare the 3 selected groups"),await t(e.getByRole("button",{name:"Export"})).toHaveAccessibleDescription("Export the 3 selected groups"),await d.click(m),await t(s.onCompare).toHaveBeenCalledTimes(1)}},l={args:{selectedCount:12},play:async({canvasElement:s})=>{const n=o(s),e=n.getByRole("group",{name:"Selection actions for the groups list"});await t(n.queryByRole("button",{name:/^Compare/})).not.toBeInTheDocument(),await t(o(e).queryAllByRole("button")).toHaveLength(0),await t(n.getByRole("button",{name:"Export"})).toBeInTheDocument()}},p={args:{selectedCount:3},play:async({canvasElement:s})=>{const n=o(s),e=n.getByRole("button",{name:"Export list"});await t(e).toBeEnabled();const a=n.getByRole("group",{name:"Selection actions for the groups list"});await t(o(a).queryByRole("button",{name:"Export list"})).not.toBeInTheDocument()}},u={args:{filteredCount:0},play:async({canvasElement:s})=>{const e=o(s).getByRole("button",{name:"Export list"});await t(e).toBeDisabled(),await t(e).toHaveAccessibleDescription("No groups match the current filter, so there is nothing to export")}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the groups list'
    });
    await expect(within(register).queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.queryByRole('button', {
      name: 'Select all'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Deselect all'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: /^Compare/
    })).not.toBeInTheDocument();

    // The page verb is the one control present at rest, and it is wired.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Export list'
    }));
    await expect(args.onExportGroupsList).toHaveBeenCalledTimes(1);
  }
}`,...r.parameters?.docs?.source},description:{story:`The register at rest: it is a row, and it is empty. No selection-scoped verb is
offered with nothing ticked — not even disabled — and the selection controls
that used to stand here are on the count row above the list.`,...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectedCount: 3
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the groups list'
    });
    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Compare');
    // Non-vacuity: the export really is on the strip at this size — it is just in
    // the tier rather than at the head of the register.
    await expect(canvas.getByRole('button', {
      name: 'Export'
    })).toBeInTheDocument();
    await expect(within(register).queryByRole('button', {
      name: 'Export'
    })).not.toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:`The safety property, in the register's own half: the register's contents vary
with the selection size, and the control it leads with is *Compare*, which opens
a modal. *Export* is the non-vacuity witness — a selection-scoped verb present at
this size, in the tier, nowhere near position one.

Scoped to the register, not the whole strip: the strip's first control is the page
row's \`primary\`, which is constant.`,...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selectedCount: 3
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the groups list'
    });
    await expect(within(register).getAllByRole('button').map(b => b.textContent)).toEqual(['Compare']);
    const compare = canvas.getByRole('button', {
      name: 'Compare'
    });
    await expect(compare).toHaveAccessibleDescription('Compare the 3 selected groups');
    await expect(canvas.getByRole('button', {
      name: 'Export'
    })).toHaveAccessibleDescription('Export the 3 selected groups');
    await userEvent.click(compare);
    await expect(args.onCompare).toHaveBeenCalledTimes(1);
  }
}`,...c.parameters?.docs?.source},description:{story:`Three selected — *Compare* is the register's one row control, and it names what it
would act on in its accessible description rather than in its label; *Export* sits
in the tier.`,...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    selectedCount: 12
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the groups list'
    });
    await expect(canvas.queryByRole('button', {
      name: /^Compare/
    })).not.toBeInTheDocument();
    await expect(within(register).queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.getByRole('button', {
      name: 'Export'
    })).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:`Twelve selected — past Compare's 2–5 window, so Compare is gone and the register
is an empty row again, while *Export*, which has no upper bound, stays in the tier.`,...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selectedCount: 3
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const exportList = canvas.getByRole('button', {
      name: 'Export list'
    });
    // Present with a selection too — a page verb does not come and go with rows.
    await expect(exportList).toBeEnabled();

    // And it is a page verb, so it is never in the selection register.
    const register = canvas.getByRole('group', {
      name: 'Selection actions for the groups list'
    });
    await expect(within(register).queryByRole('button', {
      name: 'Export list'
    })).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"*Export list* is this rung's `primary`: present in every state, pinned out of the\noverflow, and never in the selection register. Every other export in the app is `tier`.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    filteredCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const exportList = canvas.getByRole('button', {
      name: 'Export list'
    });
    await expect(exportList).toBeDisabled();
    await expect(exportList).toHaveAccessibleDescription('No groups match the current filter, so there is nothing to export');
  }
}`,...u.parameters?.docs?.source},description:{story:`Nothing matches the filter — *Export list* stays, disabled, with the reason in its
accessible description. It acts on the filter, so at zero rows it is a wired verb
with an empty result rather than a control with no path to firing.`,...u.parameters?.docs?.description}}};const B=["Default","FirstRegisterControlNeverLeavesTheRung","WithSelection","LargeSelection","ExportListIsTheRungsPrimary","NoFilteredGroups"];export{r as Default,p as ExportListIsTheRungsPrimary,i as FirstRegisterControlNeverLeavesTheRung,l as LargeSelection,u as NoFilteredGroups,c as WithSelection,B as __namedExportsOrder,b as default};
