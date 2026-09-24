import{P as f}from"./ProfileDisplayEditor-D9BmSd7W.js";import{a as p,b as w}from"./profileDisplayStoryFixture-BrnmFX7A.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./profileAttributeBlocks-X1_mS098.js";import"./ProfileDisplayAttributeEditRow-CRL5G64O.js";import"./ProfileDisplayGrip-CrJmpxg9.js";import"./ProfileDisplayDragGhost-LB7EaBFd.js";import"./ProfileDisplayOptions-DvVqqkvJ.js";import"./ProfileDisplaySectionEditor-CUSNcjq3.js";import"./profileDisplayStore-CPLgka_Y.js";import"./index-Dob3nYDb.js";const{expect:n,fn:g,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,N={title:"Users/ProfileDisplayEditor",component:f,tags:["autodocs"],parameters:{a11y:{config:{rules:[{id:"heading-order",enabled:!1}]}},docs:{description:{component:"The Profile pane while an admin is arranging it: display options, every section with its attributes, the add-section form, and Reset / Cancel / Done. Nothing is written until Done — `Reset to default` acts on the draft too, so Cancel still undoes it.\n\nReordering works from the same handles with a pointer or the keyboard. A non-empty `filter` disables the grips: a drop into a partly-rendered list would compute its position against rows that are not all there."}}},argTypes:{attributes:{description:"Every attribute on this profile, empty ones included."},config:{description:"The reconciled configuration the draft starts from."},onCommit:{description:"Done — receives the whole edited configuration."},onCancel:{description:"Cancel — the draft is discarded and nothing is written."},ruleReads:{description:"Attribute Okta name → the rules that read it. Absent means no rule was consulted, and then no row carries a mark."},filter:{description:"The pane's live free-text filter; non-empty disables reordering."}},args:{attributes:w,config:p,onCommit:g(),onCancel:g(),ruleReads:{department:["Engineering auto-join"]}}},o={},r={args:{config:{...p,hidden:{...p.hidden,lastName:!0}}}},s={args:{ruleReads:void 0},play:async({canvasElement:e})=>{const a=u(e);await n(a.queryByText("rules")).toBeNull()}},i={args:{filter:"name"}},c={args:{config:{...p,categories:[],assign:{},attrOrder:[]}}},d={play:async({args:e,canvasElement:a})=>{const t=u(a);await l.type(t.getByLabelText("New section name"),"Employment"),await l.click(t.getByRole("button",{name:"Add section"})),await n(t.getByRole("button",{name:"Rename Employment"})).toBeInTheDocument(),await l.click(t.getByRole("button",{name:"Done"})),await n(e.onCommit).toHaveBeenCalledTimes(1);const y=e.onCommit.mock.calls[0][0];await n(y.categories.map(h=>h.name)).toContain("Employment")}},m={play:async({args:e,canvasElement:a})=>{const t=u(a);await l.click(t.getByRole("button",{name:"Cancel"})),await n(e.onCancel).toHaveBeenCalledTimes(1),await n(e.onCommit).not.toHaveBeenCalled()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:"{}",...o.parameters?.docs?.source},description:{story:"Two admin sections plus Uncategorized, with the rule mark on `department`.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    config: {
      ...fixtureConfig,
      hidden: {
        ...fixtureConfig.hidden,
        lastName: true
      }
    }
  }
}`,...r.parameters?.docs?.source},description:{story:"A hidden attribute keeps its row, struck through, so it can be restored where it lives.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ruleReads: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('rules')).toBeNull();
  }
}`,...s.parameters?.docs?.source},description:{story:"Nobody read the rules: `ruleReads` is absent rather than empty, so no row carries\na `rules` mark. The editor files attributes either way — the mark is an aid, and\nan aid may not assert something nothing established.",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    filter: 'name'
  }
}`,...i.parameters?.docs?.source},description:{story:"A live filter: the list narrows to a find, and the grips state why they are off.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    config: {
      ...fixtureConfig,
      categories: [],
      assign: {},
      attrOrder: []
    }
  }
}`,...c.parameters?.docs?.source},description:{story:"An org with no sections yet — everything lands in Uncategorized.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('New section name'), 'Employment');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Add section'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Rename Employment'
    })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Done'
    }));
    await expect(args.onCommit).toHaveBeenCalledTimes(1);
    const committed = (args.onCommit as ReturnType<typeof fn>).mock.calls[0][0];
    await expect(committed.categories.map((c: {
      name: string;
    }) => c.name)).toContain('Employment');
  }
}`,...d.parameters?.docs?.source},description:{story:"Adding a section, then committing: the new section reaches `onCommit`.",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(args.onCancel).toHaveBeenCalledTimes(1);
    await expect(args.onCommit).not.toHaveBeenCalled();
  }
}`,...m.parameters?.docs?.source},description:{story:"Cancel discards the draft: `onCancel` fires and nothing is committed.",...m.parameters?.docs?.description}}};const H=["Default","WithHiddenAttribute","RuleReadsNotLoaded","Filtered","Empty","AddingASection","Cancelling"];export{d as AddingASection,m as Cancelling,o as Default,c as Empty,i as Filtered,s as RuleReadsNotLoaded,r as WithHiddenAttribute,H as __namedExportsOrder,N as default};
