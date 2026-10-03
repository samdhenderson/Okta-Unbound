import{j as T}from"./iframe-Pee757m_.js";import{R as x}from"./RulesListActionBar-DVvv9Ar-.js";import{R as D}from"./RulesSearchRow-DTMIGnBl.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,fn:i,userEvent:R,within:a}=__STORYBOOK_MODULE_TEST__,V={title:"Rules/RulesListActionBar",component:x,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The verb strip for the rules-list rung: two analysis surfaces are panels this bar toggles, **View duplicates** pushes the Duplicates rung, and the search row rides beneath it as the `subRow`. **Export rules** holds `primary`; no verb here fetches, and a host that leaves the export unwired gets no `primary` at all.\n\nNo verb is ever shipped without an object — no duplicate sets means no *View duplicates*, no loaded rules means no *Stats*. *This group* is gated on a **detected group** rather than on the relation count, because “no loaded rule assigns users to this group” is itself a finding."}}},args:{hasRules:!0,duplicateSetCount:3,onViewDuplicates:i(),hasCurrentGroup:!0,currentGroupRelationCount:2,activePanel:"none",onTogglePanel:i(),onExportRules:i(),search:T.jsx(D,{searchQuery:"",onSearchChange:i(),filtersOpen:!1,onToggleFilters:i(),activeFilterCount:0})},argTypes:{hasRules:{description:"Whether any rules are loaded — gates Stats."},duplicateSetCount:{description:"Sets of rules sharing a condition, mergeable or not. 0 omits View duplicates."},onViewDuplicates:{description:"Pushes the Duplicates rung."},hasCurrentGroup:{description:"Whether a group is detected — what This group acts on."},currentGroupRelationCount:{description:"Distinct related rules. Rides the label above 0."},activePanel:{description:"Which panel is open; its trigger says Hide … and is pinned."},onTogglePanel:{description:"Toggles the given panel open/closed."},onExportRules:{description:"Opens the Export tab. This rung's `primary` when wired."},search:{description:"The rung's search row, rendered inside the band beneath the verbs."}}},o=async t=>{const e=t.queryByRole("button",{name:"More"});e&&e.getAttribute("aria-expanded")!=="true"&&await R.click(e)},E=t=>{const s=a(t).queryByRole("button",{name:"More"})?.getAttribute("aria-controls");return s?t.ownerDocument.getElementById(s):null},B=async t=>{await n(t.queryByRole("button",{name:/refresh/i})).not.toBeInTheDocument(),await n(t.queryByRole("button",{name:/^load/i})).not.toBeInTheDocument()},c={play:async({canvasElement:t})=>{const e=a(t);await n(e.getByRole("button",{name:"Export rules"})).toBeInTheDocument(),await B(e)}},u={play:async({canvasElement:t,args:e})=>{const s=a(t);await o(s);const r=s.getByRole("button",{name:"View duplicates"});await n(r).not.toHaveAttribute("aria-pressed"),await n(r).not.toHaveAttribute("aria-expanded"),await R.click(r),await n(e.onViewDuplicates).toHaveBeenCalledTimes(1),await n(e.onTogglePanel).not.toHaveBeenCalled()}},p={play:async({canvasElement:t})=>{const e=a(t);await o(e);const s=e.getByRole("button",{name:"Export rules"}),r=E(t);await n(r).not.toBeNull(),await n(r?.contains(e.getByRole("button",{name:/^Stats/}))).toBe(!0),await n(r?.contains(s)).toBe(!1),await B(e)}},l={args:{hasRules:!1,duplicateSetCount:0,hasCurrentGroup:!1,currentGroupRelationCount:0,search:void 0},play:async({canvasElement:t})=>{const e=a(t);await n(e.getByRole("button",{name:"Export rules"})).toBeInTheDocument(),await B(e),await n(e.queryByRole("button",{name:"More"})).not.toBeInTheDocument(),await n(e.queryByRole("button",{name:/^Stats/})).not.toBeInTheDocument(),await n(e.queryByRole("button",{name:"View duplicates"})).not.toBeInTheDocument()}},d={args:{hasRules:!1,duplicateSetCount:0,currentGroupRelationCount:0,search:void 0},play:async({canvasElement:t})=>{const e=a(t);await o(e),await n(e.getByRole("button",{name:"This group"})).toBeInTheDocument(),await n(e.queryByRole("button",{name:/^Stats/})).not.toBeInTheDocument()}},h={args:{activePanel:"stats"},play:async({canvasElement:t})=>{const e=a(t);await n(e.getByRole("button",{name:"Hide stats"})).toBeInTheDocument(),await o(e),await n(e.queryByRole("button",{name:/^Stats/})).not.toBeInTheDocument()}},m={args:{activePanel:"currentGroup"},play:async({canvasElement:t})=>{const e=a(t);await n(e.getByRole("button",{name:"Hide this group"})).toBeInTheDocument()}},g={args:{duplicateSetCount:0},play:async({canvasElement:t})=>{const e=a(t);await o(e),await n(e.queryByRole("button",{name:"View duplicates"})).not.toBeInTheDocument(),await n(e.getByRole("button",{name:/^This group/})).toBeInTheDocument()}},y={args:{currentGroupRelationCount:0},play:async({canvasElement:t})=>{const e=a(t);await o(e),await n(e.getByRole("button",{name:"This group"})).toBeInTheDocument()}},w={args:{hasCurrentGroup:!1,currentGroupRelationCount:0},play:async({canvasElement:t})=>{const e=a(t);await o(e),await n(e.queryByRole("button",{name:/This group/})).not.toBeInTheDocument(),await n(e.getByRole("button",{name:"View duplicates"})).toBeInTheDocument()}},v={args:{onExportRules:void 0},play:async({canvasElement:t})=>{const e=a(t);await n(e.queryByRole("button",{name:"Export rules"})).not.toBeInTheDocument(),await o(e),await B(e),await n(e.getByRole("button",{name:"View duplicates"})).toBeInTheDocument()}},b={parameters:{viewport:{value:"sidepanelCompact"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Export rules'
    })).toBeInTheDocument();
    await expectNoFetchVerb(canvas);
  }
}`,...c.parameters?.docs?.source},description:{story:"The loaded rung: **Export rules** holds `primary`, **View duplicates** sits beside it\nwhile it fits, and the two panel toggles rest behind **More**.",...c.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    const view = canvas.getByRole('button', {
      name: 'View duplicates'
    });
    // A navigation, not a toggle: it carries no pressed or expanded state.
    await expect(view).not.toHaveAttribute('aria-pressed');
    await expect(view).not.toHaveAttribute('aria-expanded');
    await userEvent.click(view);
    await expect(args.onViewDuplicates).toHaveBeenCalledTimes(1);
    await expect(args.onTogglePanel).not.toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source},description:{story:"**View duplicates** navigates: it pushes the Duplicates rung rather than opening a panel.",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    const exportVerb = canvas.getByRole('button', {
      name: 'Export rules'
    });
    const tier = tierRegion(canvasElement);
    await expect(tier).not.toBeNull();
    // The panel toggles really are in the tier, so the export's absence from it below
    // is a placement fact and not an empty-tier vacuity.
    await expect(tier?.contains(canvas.getByRole('button', {
      name: /^Stats/
    }))).toBe(true);
    await expect(tier?.contains(exportVerb)).toBe(false);
    await expectNoFetchVerb(canvas);
  }
}`,...p.parameters?.docs?.source},description:{story:`Two structural claims: the export is pinned to the row even with the tier open,
and no verb on this rung fetches in any state.`,...p.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    hasRules: false,
    duplicateSetCount: 0,
    hasCurrentGroup: false,
    currentGroupRelationCount: 0,
    search: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Export rules'
    })).toBeInTheDocument();
    await expectNoFetchVerb(canvas);
    // No tier at all: with every panel verb omitted there is nothing to disclose.
    await expect(canvas.queryByRole('button', {
      name: 'More'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: /^Stats/
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'View duplicates'
    })).not.toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"Nothing loaded and no group in context: every panel toggle is gone, so the strip is\nthe export and nothing else, with no tier at all. The initial load lives in\n`RulesListPanel`'s empty state, not here.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    hasRules: false,
    duplicateSetCount: 0,
    currentGroupRelationCount: 0,
    search: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.getByRole('button', {
      name: 'This group'
    })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: /^Stats/
    })).not.toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:`Nothing loaded, but a group is detected: *This group* is offered before a rule is
fetched, while *Stats* — whose object is the loaded rules — is omitted.`,...d.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    activePanel: 'stats'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Pinned into the row while open, so the control that closes the panel can never be
    // the thing hiding behind More.
    await expect(canvas.getByRole('button', {
      name: 'Hide stats'
    })).toBeInTheDocument();
    await openTier(canvas);
    await expect(canvas.queryByRole('button', {
      name: /^Stats/
    })).not.toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"Opening a panel changes what the control says, and pins the closer into the row.",...h.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    activePanel: 'currentGroup'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Hide this group'
    })).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"The current-group panel open, with its own label swap.",...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    duplicateSetCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.queryByRole('button', {
      name: 'View duplicates'
    })).not.toBeInTheDocument();
    // The sibling verbs are still there — proving the tier really did open, so the
    // absence above is an absence and not a closed disclosure.
    await expect(canvas.getByRole('button', {
      name: /^This group/
    })).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"No duplicate sets found: *View duplicates* is omitted, not disabled.",...g.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    currentGroupRelationCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.getByRole('button', {
      name: 'This group'
    })).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:"A group is in context but nothing relates to it: the verb stays, uncounted, because that is itself a finding.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    hasCurrentGroup: false,
    currentGroupRelationCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await openTier(canvas);
    await expect(canvas.queryByRole('button', {
      name: /This group/
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'View duplicates'
    })).toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:"No group detected — the question has no subject, so the verb is gone.",...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    onExportRules: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: 'Export rules'
    })).not.toBeInTheDocument();
    await openTier(canvas);
    await expectNoFetchVerb(canvas);
    await expect(canvas.getByRole('button', {
      name: 'View duplicates'
    })).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:"Export not wired by the host: the descriptor is omitted rather than shipped dead, and\nthe rung carries no `primary` at all rather than promoting something to fill the slot.",...v.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...b.parameters?.docs?.source},description:{story:"At the narrow end of the panel's drag range, where the fit ladder actually runs.",...b.parameters?.docs?.description}}};const G=["Default","ViewDuplicatesPushesTheRung","TheRungsPrimaryIsItsExport","NothingLoaded","NothingLoadedWithGroupInContext","TheOpenPanelSaysSo","CurrentGroupPanelOpen","NoDuplicates","CurrentGroupWithNoRelations","NoCurrentGroup","WithoutExport","AtPanelWidth"];export{b as AtPanelWidth,m as CurrentGroupPanelOpen,y as CurrentGroupWithNoRelations,c as Default,w as NoCurrentGroup,g as NoDuplicates,l as NothingLoaded,d as NothingLoadedWithGroupInContext,h as TheOpenPanelSaysSo,p as TheRungsPrimaryIsItsExport,u as ViewDuplicatesPushesTheRung,v as WithoutExport,G as __namedExportsOrder,V as default};
