import{j as T,a4 as f}from"./iframe-mmN7AxbW.js";import{R as E}from"./RuleDetailView-DgzHfJcF.js";import{u as x,m as O}from"./useOktaApi.mock-B7ApM7uM.js";import"./preload-helper-PPVm8Dsz.js";import"./RuleActionBar-DVgu6FNQ.js";import"./RuleLifecycleActions-Cg3q9suB.js";import"./MissingGroupChip-BPaj6mVy.js";import"./RuleUserCheckSection-CNDKWHgc.js";import"./QualificationSubjectStatus-C8GNQ5uy.js";import"./RuleUserReport-Dw4FGkEi.js";import"./userDisplay-xpx41Abi.js";import"./UserPickerModal-Bowp8-d3.js";import"./qualification-cO_gjK9U.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";import"./useUserPicker-tI0it3Ef.js";import"./groupContext-D0LcfWax.js";import"./useDebouncedUserSearch-BiN1eoTU.js";import"./oktaPagination-DzUnd2oi.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:a,fn:t,userEvent:A,within:o}=__STORYBOOK_MODULE_TEST__,r="00g1a2b3c4d5e6f7g8h9",w="00g9z8y7x6w5v4u3t2s1",G={rule:t(),group:t(),user:t(),app:t(),policy:t()},s=(n={})=>({id:"00rFAKE0000000000001",name:"Engineering – Auto-assign by department",status:"ACTIVE",condition:'user.department == "Engineering"',conditionExpression:'user.department == "Engineering"',groupIds:[r,w],groupNames:["Engineering – All","Slack – Eng Channel"],allGroupNamesMap:{[r]:"Engineering – All",[w]:"Slack – Eng Channel"},userAttributes:["department"],created:"2024-01-15T09:00:00.000Z",lastUpdated:"2026-06-01T14:30:00.000Z",...n}),z={title:"Rules/RuleDetailView",component:E,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"One rule's condition, targets, conflicts and provenance, as a stack of `DetailSection`s with a `RuleActionBar` above them. It fetches nothing — everything shown is already on the `FormattedRule` the list was rendering, which is what lets the tab push this rung straight from a row with no loading state.\n\nThere is no header here: `RulesTab` keeps one `PageHeader` and feeds it `ruleIdentity`, so this view never repeats the rule’s name, status, id or counts. In the explorer that header is absent and these stories start at the strip."}}},decorators:[n=>T.jsx(f,{handlers:G,children:T.jsx("div",{className:"p-(--sp-gutter)",children:T.jsx(n,{})})})],args:{rule:s(),oktaOrigin:"https://example.okta.com",onPreviewImpact:t(),tierOpen:!1,onTierOpenChange:t(),isLifecycleLoading:!1,isConfirmingActivate:!1,onRequestActivate:t(),onCancelActivate:t(),onConfirmActivate:t(),onRequestDeactivate:t(),onAddTargetGroup:t(),sticky:!1},argTypes:{rule:{description:"The rule being browsed."},oktaOrigin:{description:"Okta org origin, for the Admin Console rules-page link."},onPreviewImpact:{description:"Opens the impact preview. Omitted when the rule targets no groups."},tierOpen:{description:"Whether the strip’s disclosure tier is open."},sticky:{description:"Pin the strip below the header. `false` in stories — nothing scrolls."}}},i={},c={play:async({canvasElement:n})=>{const e=o(n);await a(e.getByRole("button",{name:"Open group Engineering – All"})).toBeInTheDocument(),await a(e.getByRole("button",{name:`Copy group id ${r}`})).toBeInTheDocument()}},p={args:{rule:s({groupNames:void 0,allGroupNamesMap:{}})},play:async({canvasElement:n})=>{const e=o(n);await a(e.getAllByText("Group name not loaded")).toHaveLength(2),await a(e.getAllByRole("button",{name:/^Group name not loaded — open group 00g/})).toHaveLength(2)}},u={args:{rule:s({groupNames:["Engineering – All",w],allGroupNamesMap:{[r]:"Engineering – All"},missingGroupIds:[w]})},play:async({canvasElement:n})=>{const e=o(n);await a(e.getByText("Group no longer exists")).toBeInTheDocument(),await a(e.getByText(/One target no longer exists/)).toBeInTheDocument(),await a(e.getByRole("button",{name:"Open group Engineering – All"})).toBeInTheDocument()}},l={args:{rule:s({condition:`isMemberOfAnyGroup("${r}")`,conditionExpression:`isMemberOfAnyGroup("${r}")`})}},d={args:{rule:s({groupIds:[],groupNames:[]}),onPreviewImpact:void 0},play:async({canvasElement:n})=>{const e=o(n);await a(e.getByText(/assigns to no groups/)).toBeInTheDocument(),await a(e.queryByRole("button",{name:"Preview impact"})).not.toBeInTheDocument()}},m={args:{rule:s({conflicts:[{rule1:{id:"00rFAKE0000000000001",name:"Engineering – Auto-assign by department"},rule2:{id:"00rFAKE0000000000002",name:"Contractors – Auto-assign by department"},reason:'Both rules assign users to "Engineering – All" based on overlapping conditions.',severity:"high",affectedGroups:[r]}]})}},g={args:{tierOpen:!0}},h={args:{oktaOrigin:null},play:async({canvasElement:n})=>{await a(o(n).queryByRole("link",{name:/Open the rules page/})).not.toBeInTheDocument()}},b={id:"00uFAKESUBJECT01",status:"ACTIVE",profile:{login:"ada@example.com",email:"ada@example.com",firstName:"Ada",lastName:"Lovelace",department:"Engineering"}},y={args:{targetTabId:1},beforeEach:()=>{x.mockReturnValue(O({makeApiRequest:t(async()=>({success:!0,data:[b],headers:{}})),loadQualificationSubject:t(async()=>({ok:!0,user:b,groups:[{id:r,type:"OKTA_GROUP",profile:{name:"Engineering – All"}}]}))}))},play:async({canvasElement:n})=>{const e=o(n),B=o(n.ownerDocument.body);await A.click(e.getByRole("button",{name:"Evaluate user"})),await A.type(B.getByPlaceholderText("Search users..."),"ada"),await A.click(await B.findByText("Ada Lovelace")),await a(await e.findByText("Qualifies")).toBeInTheDocument(),await a(e.getByText("For one user")).toBeInTheDocument(),await a(e.getByText("Member")).toBeInTheDocument(),await a(e.getByText("Not a member")).toBeInTheDocument()}},v={args:{rule:s({conditionExpression:'user.department == "Engineering" AND user.employeeType == "Full-Time" AND user.countryCode == "GB"'})},parameters:{viewport:{value:"sidepanelCompact"}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source},description:{story:"An active rule with two named target groups.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Open group Engineering – All'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: \`Copy group id \${GROUP_A}\`
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Every target resolved: an openable chip whose copy control names the id, not the group.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupNames: undefined,
      allGroupNamesMap: {}
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Group name not loaded')).toHaveLength(2);
    // No chip presents the id as a name; the "Group name not loaded" count pins that.
    await expect(canvas.getAllByRole('button', {
      name: /^Group name not loaded — open group 00g/
    })).toHaveLength(2);
  }
}`,...p.parameters?.docs?.source},description:{story:`The same rule with no names resolved: the gap is stated, the raw id sits in the
identifier register rather than where a name belongs, and the group still opens by id.`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupNames: ['Engineering – All', GROUP_B],
      allGroupNamesMap: {
        [GROUP_A]: 'Engineering – All'
      },
      missingGroupIds: [GROUP_B]
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Group no longer exists')).toBeInTheDocument();
    // Said once in the chip and once in the section's description, so the fact is
    // legible whether the reader is scanning the list or reading the sentence.
    await expect(canvas.getByText(/One target no longer exists/)).toBeInTheDocument();
    // The surviving target is unaffected and still openable.
    await expect(canvas.getByRole('button', {
      name: 'Open group Engineering – All'
    })).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:"A target group that no longer exists — *nothing left to name*, as against\n`UnresolvedTargetGroups`, where the name simply has not been learned. It carries a\nwarning's weight because `missingGroupIds` is only set off a complete group walk.",...u.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      condition: \`isMemberOfAnyGroup("\${GROUP_A}")\`,
      conditionExpression: \`isMemberOfAnyGroup("\${GROUP_A}")\`
    })
  }
}`,...l.parameters?.docs?.source},description:{story:"A condition naming a group by id: the literal is replaced by the chip it resolves to.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      groupIds: [],
      groupNames: []
    }),
    onPreviewImpact: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/assigns to no groups/)).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Preview impact'
    })).not.toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"A rule that assigns to no groups: the finding is stated, and *Preview impact* is absent.",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      conflicts: [{
        rule1: {
          id: '00rFAKE0000000000001',
          name: 'Engineering – Auto-assign by department'
        },
        rule2: {
          id: '00rFAKE0000000000002',
          name: 'Contractors – Auto-assign by department'
        },
        reason: 'Both rules assign users to "Engineering – All" based on overlapping conditions.',
        severity: 'high',
        affectedGroups: [GROUP_A]
      }]
    })
  }
}`,...m.parameters?.docs?.source},description:{story:"A detected conflict against another loaded rule, with its severity and reason.",...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    tierOpen: true
  }
}`,...g.parameters?.docs?.source},description:{story:"The strip's tier open, over the rule's content.",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    oktaOrigin: null
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('link', {
      name: /Open the rules page/
    })).not.toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:'No org origin, so the "In Okta" section is absent rather than rendering a dead link.',...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: 1
  },
  beforeEach: () => {
    useOktaApi.mockReturnValue(makeUseOktaApiValue({
      makeApiRequest: fn(async () => ({
        success: true,
        data: [subjectUser],
        headers: {}
      })),
      loadQualificationSubject: fn(async () => ({
        ok: true,
        user: subjectUser,
        groups: [{
          id: GROUP_A,
          type: 'OKTA_GROUP',
          profile: {
            name: 'Engineering – All'
          }
        }]
      }))
    }));
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Evaluate user'
    }));
    await userEvent.type(body.getByPlaceholderText('Search users...'), 'ada');
    await userEvent.click(await body.findByText('Ada Lovelace'));
    await expect(await canvas.findByText('Qualifies')).toBeInTheDocument();
    await expect(canvas.getByText('For one user')).toBeInTheDocument();
    await expect(canvas.getByText('Member')).toBeInTheDocument();
    await expect(canvas.getByText('Not a member')).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:`*Evaluate user* picked and loaded: the "For one user" section between "When"
and "Then add to groups", the headline over the ledger, one row per target,
and the raw well's footer now stating the condition's verdict.`,...y.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    rule: rule({
      conditionExpression: 'user.department == "Engineering" AND user.employeeType == "Full-Time" AND user.countryCode == "GB"'
    })
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...v.parameters?.docs?.source},description:{story:"The 360px floor: the condition scrolls inside its own box rather than widening the page.",...v.parameters?.docs?.description}}};const J=["Default","NamedTargetGroups","UnresolvedTargetGroups","MissingTargetGroup","ConditionNamesAGroup","NoTargetGroups","WithConflicts","TierOpen","WithoutOktaOrigin","CheckedUser","Narrow"];export{y as CheckedUser,l as ConditionNamesAGroup,i as Default,u as MissingTargetGroup,c as NamedTargetGroups,v as Narrow,d as NoTargetGroups,g as TierOpen,p as UnresolvedTargetGroups,m as WithConflicts,h as WithoutOktaOrigin,J as __namedExportsOrder,z as default};
