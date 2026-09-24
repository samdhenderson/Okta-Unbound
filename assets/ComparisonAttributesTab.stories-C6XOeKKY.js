import{C as S}from"./ComparisonAttributesTab-Cncv58YJ.js";import{D as k}from"./profileDisplayStore-CPLgka_Y.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./ComparisonAttributeRow-1DjhHiGK.js";import"./ProfileEditCell-77Em6DmJ.js";import"./ComparisonAttributesToolbar-C3ZIN5Ta.js";import"./profileAttributeBlocks-X1_mS098.js";import"./index-Dob3nYDb.js";const{expect:n,fn:B,userEvent:D,waitFor:o,within:a}=__STORYBOOK_MODULE_TEST__,s=(t,e,r,I,R,A={})=>({key:`profile.${t}`,name:t,label:e,kind:"base",contextValue:r,comparedValue:I,verdict:R,categoryKey:"organization",hiddenByConfig:!1,...A}),N=[s("department","Department","Engineering","Design","differs"),s("manager","Manager","dana@example.com","","onlyContext"),s("costCenter","Cost center","","CC-42","onlyCompared"),s("userType","User type","Employee","Employee","same",{categoryKey:"identity"}),s("nickName","Nickname","","","bothEmpty",{categoryKey:""})],L=[s("employeeNumber","Employee number","E-0001","E-0002","differs",{hiddenByConfig:!0})],C={...k,categories:[{key:"identity",name:"Identity"},{key:"organization",name:"Organization"},{key:"contact-locale",name:"Contact & locale"}],assign:{userType:"identity",department:"organization",manager:"organization",costCenter:"organization",employeeNumber:"organization",nickName:""},attrOrder:["userType","department","manager","costCenter","employeeNumber","nickName"],hidden:{employeeNumber:!0}},O=(t,e={})=>({name:t,editability:{editable:!0,control:"text",required:!1},dirty:!1,onChange:B(),...e}),x=(t,e={})=>Object.fromEntries(t.map(r=>[r,O(r,e[r])])),i=(t,e,r={})=>({key:t,userName:e,cells:{},isEditing:!1,isSaving:!1,hasChanges:!1,hasInvalid:!1,canEdit:!0,begin:B(),cancel:B(),requestSave:B(),...r}),b=["department","manager","costCenter","userType","nickName","employeeNumber"],V={title:"Users/Comparison/ComparisonAttributesTab",component:S,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The comparison's fourth dimension: what is different about these two people, attribute by attribute, in the admin's own categories and order. The cells carry **values**, not checkmarks, and the rows arrive differences-first from `attributeParityRows` and are never re-sorted here.\n\nTwo rules govern it. A **hidden difference is disclosed, never dropped** — the attribute the config hides may be the one explaining an access gap — and the counts and markers describe what Okta holds, not what has been typed, so a dirty side takes an `Edited` badge instead. Either column is editable, one editor per side."}}},args:{contextName:"Ada Context",comparedName:"Bo Compared",rows:N,hiddenRows:L,hiddenDifferences:1,config:C,ruleReads:{department:["Engineering → VPN Access"]}},argTypes:{contextName:{description:"Display name of the context user — the LEFT cell of every row."},comparedName:{description:"Display name of the compared user — the RIGHT cell of every row."},rows:{description:"The config-visible rows from `attributeParityRows`, ordered differences-first."},hiddenRows:{description:"Rows the config hides, kept whole so this surface can reveal them on demand."},hiddenDifferences:{description:"How many of `hiddenRows` actually differ."},config:{description:"The admin's reconciled display configuration."},ruleReads:{description:"Okta attribute name → the rules that read it and grant either user access. Absent means no rule was consulted for this pair, and then no row carries a chip."},contextEdit:{description:"The context user's editor. Absent leaves the left column read-only."},comparedEdit:{description:"The compared user's editor. Same contract as `contextEdit`."}}},c={},d={args:{ruleReads:void 0},play:async({canvasElement:t})=>{const e=a(t);await n(e.queryByText("1 rule")).toBeNull(),await n(e.getByText("Department")).toBeInTheDocument()}},p={play:async({canvasElement:t})=>{const e=a(t);await D.click(e.getByRole("button",{name:/^All/})),await o(()=>n(e.getByText("User type")).toBeInTheDocument()),n(e.getByText("Uncategorized")).toBeInTheDocument(),n(e.queryByText("Contact & locale")).not.toBeInTheDocument()}},m={play:async({canvasElement:t})=>{const e=a(t);n(e.queryByText("Employee number")).not.toBeInTheDocument(),await D.click(e.getByRole("button",{name:"Show"})),await o(()=>n(e.getByText("Employee number")).toBeInTheDocument()),n(e.getByText("Hidden")).toBeInTheDocument()}},l={args:{hiddenRows:[],hiddenDifferences:0}},u={args:{config:{...C,showApiNames:!0}},play:async({canvasElement:t})=>{const e=a(t);await o(()=>n(e.getByText("department")).toBeInTheDocument()),n(e.queryByText("Department")).not.toBeInTheDocument()}},h={args:{config:{...C,showRuleChips:!1}}},y={play:async({canvasElement:t})=>{const e=a(t);await D.type(e.getByLabelText("Filter attributes by name or value"),"zzzz"),await o(()=>n(e.getByText("No attributes match")).toBeInTheDocument())}},g={args:{rows:[],hiddenRows:[],hiddenDifferences:0}},f={args:{rows:[s("streetAddress","Street address","1 Example Street, Exampleton, EX1 2AB","2 Example Street, Exampleton, EX1 2AC","differs"),...N]},parameters:{viewport:{value:"sidepanelCompact"}}},w={args:{contextEdit:i("context","Ada Context"),comparedEdit:i("compared","Bo Compared",{isEditing:!0,cells:x(b)})},play:async({canvasElement:t})=>{const e=a(t);await o(()=>n(e.getByLabelText("Department")).toHaveValue("Design")),n(e.getByRole("button",{name:"Differences 3"})).toBeInTheDocument()}},E={args:{comparedEdit:i("compared","Bo Compared",{isEditing:!0,hasChanges:!0,cells:x(b,{department:{draft:"Engineering",dirty:!0}})})},play:async({canvasElement:t})=>{const e=a(t);await o(()=>n(e.getByText("Edited")).toBeInTheDocument()),n(e.getByRole("button",{name:"Differences 3"})).toBeInTheDocument()}},v={args:{comparedEdit:i("compared","Bo Compared",{isEditing:!0,hasChanges:!0,cells:x(b,{employeeNumber:{draft:"E-0003",dirty:!0}})})},play:async({canvasElement:t})=>{const e=a(t);await o(()=>n(e.getByText("Employee number")).toBeInTheDocument()),n(e.getByRole("button",{name:"Show"})).toBeInTheDocument(),n(e.getByText("Hidden")).toBeInTheDocument()}},T={args:{contextEdit:i("context","Ada Context",{isEditing:!0,hasChanges:!0,cells:x(b,{department:{draft:"Design",dirty:!0}})}),comparedEdit:i("compared","Bo Compared")},parameters:{viewport:{value:"sidepanelCompact"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source},description:{story:"The default view: differences only, with the `1 rule` chip that makes the diff an access explanation.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ruleReads: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('1 rule')).toBeNull();
    // The diff itself is unaffected.
    await expect(canvas.getByText('Department')).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:`No rule was consulted for this pair — the org inventory never resolved, or one of
the two users' group lists is unread. The chip is withheld everywhere rather
than the tab claiming that no rule reads these attributes.`,...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: /^All/
    }));
    await waitFor(() => expect(canvas.getByText('User type')).toBeInTheDocument());
    expect(canvas.getByText('Uncategorized')).toBeInTheDocument();
    expect(canvas.queryByText('Contact & locale')).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Every verdict at once. It also pins two grouping decisions: `Uncategorized` collects\nwhat the config has not placed, and a configured-but-empty category is dropped.",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByText('Employee number')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Show'
    }));
    await waitFor(() => expect(canvas.getByText('Employee number')).toBeInTheDocument());
    expect(canvas.getByText('Hidden')).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"An attribute the config hides, which the two users differ on, is counted and disclosed rather than dropped.",...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    hiddenRows: [],
    hiddenDifferences: 0
  }
}`,...l.parameters?.docs?.source},description:{story:"Nothing is hidden, so the disclosure line is absent entirely.",...l.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    config: {
      ...CONFIG,
      showApiNames: true
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('department')).toBeInTheDocument());
    expect(canvas.queryByText('Department')).not.toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:"`showApiNames` renders the Okta name in mono instead of the human label.",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    config: {
      ...CONFIG,
      showRuleChips: false
    }
  }
}`,...h.parameters?.docs?.source},description:{story:"`showRuleChips` off — the admin's configuration governs the chips too.",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Filter attributes by name or value'), 'zzzz');
    await waitFor(() => expect(canvas.getByText('No attributes match')).toBeInTheDocument());
  }
}`,...y.parameters?.docs?.source},description:{story:'Filtered to nothing — distinct from "there are no attributes to compare".',...y.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    rows: [],
    hiddenRows: [],
    hiddenDifferences: 0
  }
}`,...g.parameters?.docs?.source},description:{story:'No attributes at all — a different statement from "nothing matches the filter".',...g.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    rows: [row('streetAddress', 'Street address', '1 Example Street, Exampleton, EX1 2AB', '2 Example Street, Exampleton, EX1 2AC', 'differs'), ...ROWS]
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...f.parameters?.docs?.source},description:{story:"The compact side panel: values wrap rather than truncate, so two values differing only in their tails cannot render identically.",...f.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    contextEdit: side('context', 'Ada Context'),
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      cells: editCells(ALL_NAMES)
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByLabelText('Department')).toHaveValue('Design'));
    expect(canvas.getByRole('button', {
      name: 'Differences 3'
    })).toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:"The compared column is editing: its cells become controls, and every count is unchanged.",...w.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      hasChanges: true,
      cells: editCells(ALL_NAMES, {
        department: {
          draft: 'Engineering',
          dirty: true
        }
      })
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText('Edited')).toBeInTheDocument());
    expect(canvas.getByRole('button', {
      name: 'Differences 3'
    })).toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source},description:{story:"A drafted change: the row says which side holds it, and the pill's count still describes Okta.",...E.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    comparedEdit: side('compared', 'Bo Compared', {
      isEditing: true,
      hasChanges: true,
      cells: editCells(ALL_NAMES, {
        employeeNumber: {
          draft: 'E-0003',
          dirty: true
        }
      })
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The disclosure is collapsed — it still offers to "Show" — and the row is
    // listed anyway, still marked as one the config hides.
    await waitFor(() => expect(canvas.getByText('Employee number')).toBeInTheDocument());
    expect(canvas.getByRole('button', {
      name: 'Show'
    })).toBeInTheDocument();
    expect(canvas.getByText('Hidden')).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:`A config-hidden row that was revealed, edited, then re-collapsed stays on screen —
otherwise the edit would be off screen and still in the patch.`,...v.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    contextEdit: side('context', 'Ada Context', {
      isEditing: true,
      hasChanges: true,
      cells: editCells(ALL_NAMES, {
        department: {
          draft: 'Design',
          dirty: true
        }
      })
    }),
    comparedEdit: side('compared', 'Bo Compared')
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...T.parameters?.docs?.source},description:{story:"Editing at 360px: the value cells keep the same three-track grid the read-only rows use.",...T.parameters?.docs?.description}}};const K=["Default","RuleReadsNotLoaded","AllVerdicts","HiddenDifferencesRevealed","NothingHidden","ApiNames","RuleChipsOff","FilteredToNothing","Empty","CompactPanel","EditingComparedColumn","EditedDraft","DirtyHiddenRowStaysListed","EditingCompact"];export{p as AllVerdicts,u as ApiNames,f as CompactPanel,c as Default,v as DirtyHiddenRowStaysListed,E as EditedDraft,T as EditingCompact,w as EditingComparedColumn,g as Empty,y as FilteredToNothing,m as HiddenDifferencesRevealed,l as NothingHidden,h as RuleChipsOff,d as RuleReadsNotLoaded,K as __namedExportsOrder,V as default};
