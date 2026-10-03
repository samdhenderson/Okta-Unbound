import{j as w,a4 as R}from"./iframe-Pee757m_.js";import{u as x,R as I}from"./useRuleTargetEdit-DadjPkB0.js";import"./preload-helper-PPVm8Dsz.js";import"./MissingGroupChip-Bjj4npQI.js";import"./RuleTargetRow-UTy4fshw.js";import"./ruleTargetFacts-DKSE0DP8.js";import"./RuleTargetPicker-Ddrs_JwX.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./ruleTargets-hCG7hfyY.js";const{expect:n,fn:r,userEvent:i,within:o}=__STORYBOOK_MODULE_TEST__,B="00gFAKE00000000ENG01",T="00gFAKE00000000CON01",E="00gFAKE00000000MGR01",D="00gFAKE0000000PLAT01",M="00gFAKE00000000SEC01",b={rule:r(),group:r(),user:r(),app:r(),policy:r()},f=(t={})=>({id:"00rFAKE0000000000002",name:"Engineering by department",status:"ACTIVE",condition:'user.department == "Engineering"',conditionExpression:'user.department == "Engineering"',groupIds:[B,T],groupNames:["Engineering - All","Contractors"],userAttributes:["department"],created:"2024-01-15T09:00:00.000Z",lastUpdated:"2026-06-01T14:30:00.000Z",...t}),A=Array.from({length:99},(t,e)=>`00gFAKE${String(e).padStart(13,"0")}`),N=({seed:t,...e})=>{const a=x(e.rule,t);return w.jsx(I,{...e,edit:a})},U={title:"Rules/RuleTargetsEditor",tags:["autodocs"],render:t=>w.jsx(N,{...t}),parameters:{layout:"padded",docs:{description:{component:"Target groups are edited inside the card that lists them. **Edit groups** sits in the card’s header — the verb’s object is this section, not the page — and becomes **Done editing**. It is omitted for a Broken rule or with no tab to write through.\n\nIn edit mode each group is a `ListRow`: kept rows plain, staged additions in the `added` tone, staged removals in the `removed` tone with the name struck through and **Undo**. Added and removed rows say what the change does to people. The footer states the net change and offers **Review change**, or says why there is nothing to review and offers nothing."}}},decorators:[t=>w.jsx(R,{handlers:b,children:w.jsx(t,{})})],args:{rule:f(),canEdit:!0,onReview:r(),searchGroups:r(async()=>[{id:E,name:"Engineering Managers",type:"OKTA_GROUP"},{id:"00gFAKE00000000ECN01",name:"Engineering Contractors",type:"OKTA_GROUP"}])},argTypes:{rule:{description:"The rule on screen."},canEdit:{description:"Whether **Edit groups** is offered. `false` omits it."},onReview:{description:"Open the confirm on the staged change."},searchGroups:{description:"Search the org’s groups by name, for the picker."},onMove:{description:"Move a group to another rule. Omitted, the rows offer no move."},seed:{description:"Story-only: the draft as if already staged."}}},c={play:async({canvasElement:t})=>{const e=o(t);await i.click(e.getByRole("button",{name:"Edit groups"})),await n(e.getByRole("button",{name:"Done editing"})).toBeInTheDocument(),await n(e.getByRole("button",{name:"Remove Contractors from this rule"})).toBeInTheDocument()}},d={args:{canEdit:!1},play:async({canvasElement:t})=>{await n(o(t).queryByRole("button",{name:"Edit groups"})).not.toBeInTheDocument()}},u={args:{seed:{editMode:!0}},play:async({canvasElement:t})=>{const e=o(t);await n(e.getByText("Nothing changed. These groups match what Okta has.")).toBeInTheDocument(),await n(e.queryByRole("button",{name:"Review change"})).not.toBeInTheDocument()}},s={args:{seed:{editMode:!0,added:[{id:E,name:"Engineering Managers"}],removedIds:[T]}},play:async({canvasElement:t,args:e})=>{const a=o(t);await n(a.getByText("Added")).toBeInTheDocument(),await n(a.getByText("Removed")).toBeInTheDocument(),await n(a.getByText("People this rule added to Contractors are removed from Contractors.")).toBeInTheDocument(),await n(a.getByText("Groups after this change: 2 · 1 added, 1 removed")).toBeInTheDocument(),await i.click(a.getByRole("button",{name:"Review change"})),await n(e.onReview).toHaveBeenCalledTimes(1)}},g={args:{seed:{editMode:!0,removedIds:[T]}},play:async({canvasElement:t})=>{const e=o(t);await i.click(e.getByRole("button",{name:"Undo removing Contractors"})),await n(e.queryByText("Removed")).not.toBeInTheDocument(),await n(e.queryByRole("button",{name:"Review change"})).not.toBeInTheDocument()}},m={args:{rule:f({groupIds:[B],groupNames:["Engineering - All"]}),seed:{editMode:!0,removedIds:[B]}},play:async({canvasElement:t})=>{const e=o(t);await n(e.getByText("A rule needs at least one target group.")).toBeInTheDocument(),await n(e.getByRole("button",{name:"Discard"})).toBeInTheDocument(),await n(e.queryByRole("button",{name:"Review change"})).not.toBeInTheDocument()}},p={args:{rule:f({groupIds:A,groupNames:void 0}),seed:{editMode:!0,added:[{id:E,name:"Engineering Managers"},{id:D,name:"Platform Engineers"},{id:M,name:"Security Reviewers"}]}},play:async({canvasElement:t})=>{const e=o(t);await n(e.getByText("99 unchanged groups")).toBeInTheDocument(),await n(e.getByText("This change would leave 102 target groups. A rule holds at most 100.")).toBeInTheDocument()}},l={args:{seed:{editMode:!0}},play:async({canvasElement:t})=>{const e=o(t);await i.type(e.getByPlaceholderText("Search groups by name…"),"eng"),await i.click(await e.findByText("Engineering Managers")),await n(e.getByText("Added")).toBeInTheDocument(),await n(e.getByText("Everyone this rule matches will be added to Engineering Managers.")).toBeInTheDocument()}},h={args:{seed:{editMode:!0},onMove:r()},play:async({canvasElement:t,args:e})=>{const a=o(t);await i.click(a.getByRole("button",{name:"Move Contractors to another rule…"})),await n(e.onMove).toHaveBeenCalledWith({id:T,name:"Contractors"})}},v={args:s.args,parameters:{viewport:{value:"sidepanelCompact"}}},y={args:s.args,parameters:{viewport:{value:"sidepanelDefault"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Edit groups'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Done editing'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Remove Contractors from this rule'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Read-only, with the entry in the card's header.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    canEdit: false
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('button', {
      name: 'Edit groups'
    })).not.toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"No tab to write through (or a Broken rule): the card is read-only and offers no edit.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    seed: {
      editMode: true
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Nothing changed. These groups match what Okta has.')).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Review change'
    })).not.toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:"Edit mode with nothing staged: the footer says so, and offers no review.",...u.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    seed: {
      editMode: true,
      added: [{
        id: MGR,
        name: 'Engineering Managers'
      }],
      removedIds: [CON]
    }
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Added')).toBeInTheDocument();
    await expect(canvas.getByText('Removed')).toBeInTheDocument();
    await expect(canvas.getByText('People this rule added to Contractors are removed from Contractors.')).toBeInTheDocument();
    await expect(canvas.getByText('Groups after this change: 2 · 1 added, 1 removed')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Review change'
    }));
    await expect(args.onReview).toHaveBeenCalledTimes(1);
  }
}`,...s.parameters?.docs?.source},description:{story:"One addition and one removal staged: tones, badges, consequences, the net count.",...s.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    seed: {
      editMode: true,
      removedIds: [CON]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Undo removing Contractors'
    }));
    await expect(canvas.queryByText('Removed')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Review change'
    })).not.toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"Undo puts a removal back; the draft is unchanged again, so review is withdrawn.",...g.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupIds: [ENG],
      groupNames: ['Engineering - All']
    }),
    seed: {
      editMode: true,
      removedIds: [ENG]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('A rule needs at least one target group.')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Discard'
    })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Review change'
    })).not.toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"Removing the last group: the footer says a rule needs one, and offers only Discard.",...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupIds: NINETY_NINE,
      groupNames: undefined
    }),
    seed: {
      editMode: true,
      added: [{
        id: MGR,
        name: 'Engineering Managers'
      }, {
        id: PLAT,
        name: 'Platform Engineers'
      }, {
        id: SEC,
        name: 'Security Reviewers'
      }]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('99 unchanged groups')).toBeInTheDocument();
    await expect(canvas.getByText('This change would leave 102 target groups. A rule holds at most 100.')).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Past Okta's 100: kept rows collapse to a count, and the footer states the limit.",...p.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    seed: {
      editMode: true
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Search groups by name…'), 'eng');
    await userEvent.click(await canvas.findByText('Engineering Managers'));
    await expect(canvas.getByText('Added')).toBeInTheDocument();
    await expect(canvas.getByText('Everyone this rule matches will be added to Engineering Managers.')).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"The picker: results push the footer down, and picking one stages it as Added.",...l.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    seed: {
      editMode: true
    },
    onMove: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Move Contractors to another rule…'
    }));
    await expect(args.onMove).toHaveBeenCalledWith({
      id: CON,
      name: 'Contractors'
    });
  }
}`,...h.parameters?.docs?.source},description:{story:"With a move handler, each kept row also offers to move its group to another rule.",...h.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: StagedDiff.args,
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...v.parameters?.docs?.source},description:{story:"The 360px floor, with a staged diff.",...v.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: StagedDiff.args,
  parameters: {
    viewport: {
      value: 'sidepanelDefault'
    }
  }
}`,...y.parameters?.docs?.source},description:{story:"The 480px default panel, with a staged diff.",...y.parameters?.docs?.description}}};const W=["ReadOnly","WithoutEdit","EditingNothingStaged","StagedDiff","UndoARemoval","WouldLeaveZero","OverTheLimit","PickAGroup","WithMove","Narrow","Default480"];export{y as Default480,u as EditingNothingStaged,v as Narrow,p as OverTheLimit,l as PickAGroup,c as ReadOnly,s as StagedDiff,g as UndoARemoval,h as WithMove,d as WithoutEdit,m as WouldLeaveZero,W as __namedExportsOrder,U as default};
