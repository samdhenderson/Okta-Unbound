import{S as B}from"./SelectionPane-DSEGeQnu.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./types-CedNKx8Z.js";import"./registry-l4mQzsmW.js";import"./userDisplay-xpx41Abi.js";import"./groupRuleIndex-CUdSMoPG.js";import"./fetchGroupRulesRequest-DgNCr2VU.js";import"./ruleUtils-Vt2BA8lQ.js";import"./oktaPagination-DzUnd2oi.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleOrphans-w7zgihHR.js";import"./selectionStore-CrmbAKHN.js";import"./memberRuleAttribution-DwskNnmH.js";import"./profile-Bul2VYbY.js";import"./undoManager-Db5dJWVO.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-qVcYAhdY.js";import"./membershipAnalysis-BZfvnwXl.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-DUrEZuW9.js";import"./sourceLine-6HOHdWfm.js";import"./profileAttributes-D7zGcuAf.js";import"./dateFormat-C9yVDsck.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-_apwJWix.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";const{expect:n,fn:w,userEvent:g,within:s}=__STORYBOOK_MODULE_TEST__,v=t=>({picked:t.map((e,a)=>({...e,pickedAt:17e11+a}))}),r=t=>t.picked.reduce((e,a)=>(e[a.kind]=(e[a.kind]??0)+1,e),{}),o=v([{kind:"user",id:"00uFAKE0001",name:"Dana Example"},{kind:"user",id:"00uFAKE0002",name:"Rowan Example"},{kind:"user",id:"00uFAKE0003",name:"Marlow Example"}]),h=v([{kind:"user",id:"00uFAKE0001",name:"Dana Example"},{kind:"group",id:"00gFAKE0001",name:"Payments Team"},{kind:"rule",id:"00rFAKE0001",name:"Contractors"},{kind:"policy",id:"00pFAKE0001",name:"MFA Enrollment"}]),Z={title:"Selection/panes/SelectionPane",component:B,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"One `DetailSection` per **non-empty** kind, in a stable declared order — a kind with nothing ticked never appears, since the basket’s `counts` already omits it and this pane does not reintroduce the zero (`docs/claims.md`).\n\nEach section names its kind and count as a real phrase (`12 users selected`), lists the entries with a per-row remove control, and carries its own `Clear` scoped to that partition behind a confirm — a section-scoped verb belongs to the section, not to the rung’s strip (`docs/action-bars.md`)."}}},args:{query:"",onRemove:w(),onClearKind:w()}},c={args:{basket:{picked:[]},counts:{}},play:async({canvasElement:t})=>{const e=s(t);await n(e.getByText("Nothing selected")).toBeInTheDocument()}},i={args:{basket:o,counts:r(o)},play:async({canvasElement:t})=>{const e=s(t);await n(e.getByText("3 users selected")).toBeInTheDocument(),await n(e.getByText("Dana Example")).toBeInTheDocument()}},l={args:{basket:h,counts:r(h)},play:async({canvasElement:t})=>{const e=s(t);await n(e.getByText("1 user selected")).toBeInTheDocument(),await n(e.getByText("1 group selected")).toBeInTheDocument(),await n(e.getByText("1 rule selected")).toBeInTheDocument(),await n(e.getByText("1 policy selected")).toBeInTheDocument()}},m={args:{basket:o,counts:r(o),query:"dana"},play:async({canvasElement:t})=>{const e=s(t);await n(e.getByText("3 users selected")).toBeInTheDocument(),await n(e.getByText("Showing 1 of 3.")).toBeInTheDocument(),await n(e.queryByText("Rowan Example")).not.toBeInTheDocument()}},d={args:{basket:o,counts:r(o),query:"zzz"},play:async({canvasElement:t})=>{const e=s(t);await n(e.getByText("3 users selected")).toBeInTheDocument(),await n(e.getByText('No users match "zzz".')).toBeInTheDocument()}},p={args:{basket:h,counts:r(h)},play:async({canvasElement:t,args:e})=>{const a=s(t);await g.click(a.getByRole("button",{name:"Clear users"})),await n(e.onClearKind).not.toHaveBeenCalled();const y=s(a.getByRole("dialog",{name:"Clear selected user?"}));await n(y.getByText("Clear 1 selected user? This cannot be undone.")).toBeInTheDocument(),await g.click(y.getByRole("button",{name:"Cancel"})),await n(e.onClearKind).not.toHaveBeenCalled(),await g.click(a.getByRole("button",{name:"Clear users"})),await g.click(a.getByRole("button",{name:"Clear"})),await n(e.onClearKind).toHaveBeenCalledWith("user")}},u={args:{basket:o,counts:r(o)},play:async({canvasElement:t,args:e})=>{const a=s(t);await g.click(a.getByRole("button",{name:"Remove Dana Example from the selection"})),await n(e.onRemove).toHaveBeenCalledWith({kind:"user",id:"00uFAKE0001"})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    basket: {
      picked: []
    },
    counts: {}
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing selected')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Nothing ticked — the pane names how selection works rather than showing empty sections.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    basket: USERS,
    counts: countsOf(USERS)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Dana Example')).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:"One kind ticked — a single section, stating the real count.",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    basket: MIXED,
    counts: countsOf(MIXED)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1 user selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 group selected')).toBeInTheDocument();
    await expect(canvas.getByText('1 rule selected')).toBeInTheDocument();
    // The irregular plural is spelled correctly at any count, singular included.
    await expect(canvas.getByText('1 policy selected')).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"Several kinds ticked — one section per kind, in the stable declared order.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    basket: USERS,
    counts: countsOf(USERS),
    query: 'dana'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('Showing 1 of 3.')).toBeInTheDocument();
    await expect(canvas.queryByText('Rowan Example')).not.toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"A filter narrows what is listed and never what is claimed: the title keeps\nstating the real partition count while `Showing N of M` reports the filtered\none. A title that quietly became the filtered count would be exactly the\nconfidently-wrong number `docs/claims.md` forbids.",...m.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    basket: USERS,
    counts: countsOf(USERS),
    query: 'zzz'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('3 users selected')).toBeInTheDocument();
    await expect(canvas.getByText('No users match "zzz".')).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"A filter matching nothing states the absence by name rather than emptying the section silently.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    basket: MIXED,
    counts: countsOf(MIXED)
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear users'
    }));
    await expect(args.onClearKind).not.toHaveBeenCalled();
    const dialog = within(canvas.getByRole('dialog', {
      name: 'Clear selected user?'
    }));
    await expect(dialog.getByText('Clear 1 selected user? This cannot be undone.')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(args.onClearKind).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear users'
    }));
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear'
    }));
    await expect(args.onClearKind).toHaveBeenCalledWith('user');
  }
}`,...p.parameters?.docs?.source},description:{story:"The partition's own `Clear` asks first: pressing it reports nothing to the\ncaller, and Cancel leaves it that way. Only confirming calls `onClearKind` —\nthe assertion that would catch a regression back to the ungated verb.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    basket: USERS,
    counts: countsOf(USERS)
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Remove Dana Example from the selection'
    }));
    await expect(args.onRemove).toHaveBeenCalledWith({
      kind: 'user',
      id: '00uFAKE0001'
    });
  }
}`,...u.parameters?.docs?.source},description:{story:"Removing one row reports that one entity, and nothing else.",...u.parameters?.docs?.description}}};const $=["Empty","OneKind","MixedKinds","FilterKeepsTheCountHonest","FilterMatchingNothingSaysSo","ConfirmClearPartition","RemoveOne"];export{p as ConfirmClearPartition,c as Empty,m as FilterKeepsTheCountHonest,d as FilterMatchingNothingSaysSo,l as MixedKinds,i as OneKind,u as RemoveOne,$ as __namedExportsOrder,Z as default};
