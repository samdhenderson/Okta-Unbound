import{G as A}from"./GroupActionBar-DkXV5tMw.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./undoManager-Db5dJWVO.js";const{expect:e,fn:c,userEvent:s,within:o}=__STORYBOOK_MODULE_TEST__,C={id:"00gFAKE000000000001",name:"Engineering",description:"All engineering staff across every team.",type:"OKTA_GROUP",memberCount:128,hasRules:!1,ruleCount:0,usedInRuleCount:0,created:new Date("2023-01-15"),lastUpdated:new Date("2026-06-01")},O={title:"Groups/GroupActionBar",component:A,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Every verb whose object is the whole group. `Add` is the `primary` and sits in the row beside `Compare`: one writes but is undone by a remove, the other only reads. `Export members` forwards to the Export tab rather than producing a file in place, so like every export descriptor in the app it starts behind **More**. `Check membership` is read-only too — it fetches one user whole and assesses every feeding rule against them — so it sits in the row, never `primary`, names its cost in its tooltip, and is omitted without a tab (ADR-0010).\n\nThe tier holds two verbs, one of each shape `ActionBar` offers: **Remove deprovisioned** as a descriptor behind a confirm `Modal`, and **Create feeding rule** in the `expansion` slot, where it can carry the line of prose stating what a rule leaves behind. A verb that cannot honestly run is absent, never disabled forever — no wire, an `APP_GROUP`, or an unknown deprovisioned count all omit it.\n\n**Set attribute on N members** is the rung’s one *filter-scoped* verb and the documented tier carve-out to the rule that a verb whose object is not the whole page belongs to a section. It names the count the Members pane measured, it is absent unless that pane is the one on screen, and `expansion` carries the sentence saying whose profiles it would write — because a descriptor carries no JSX and “members” alone would read as all of them."}}},args:{group:C,targetTabId:1,onExportGroup:c(),onAddMember:c(),onCompare:c(),onWhyNotMember:c(),onRemoveDeprovisioned:c(),deprovisionedCount:3,filteredMemberCount:47,onSetProfileAttribute:c(),onCreateFeedingRule:c(),sticky:!1},argTypes:{group:{description:"The group every verb in the strip acts on."},targetTabId:{description:"`Add` and `Compare` both disable without a connected tab."},onExportGroup:{description:"Opens the Export tab pre-scoped to this group's members. Omitted → no action."},onAddMember:{description:"Opens the Add-member modal."},onCompare:{description:"Opens the picker for the second group in a comparison."},onWhyNotMember:{description:"Opens the user picker for a qualification check. Omitted with no tab."},deprovisionedCount:{description:"How many loaded members are `DEPROVISIONED`. `undefined` and `0` both omit it."},onRemoveDeprovisioned:{description:"Runs the bulk removal once the confirm modal is accepted. Omitted → no action."},isRemoving:{description:"Holds the confirm button in its loading state while the run is in flight."},removeError:{description:"The last error the run reported, shown inside the confirm modal."},filteredMemberCount:{description:"Members surviving the Members pane’s search and filters. `undefined` — another pane on screen, or the roster unread — and `0` both omit the action."},onSetProfileAttribute:{description:"Opens the run surface for the bulk profile write. Omitted → no action."},onCreateFeedingRule:{description:"Opens the create-feeding-rule confirm dialog."},sticky:{description:"Pin the strip below the header."}}},m={},l={play:async({canvasElement:n})=>{const t=o(n),a=t.getByRole("button",{name:"More"});await e(a).toHaveAttribute("aria-expanded","false");const r=document.getElementById(a.getAttribute("aria-controls")??"");if(!r)throw new Error("the More control names no region");await e(o(r).getByRole("button",{name:/Export members/})).toBeInTheDocument(),await e(o(r).queryByRole("button",{name:"Add"})).not.toBeInTheDocument(),await e(t.getByRole("button",{name:"Add"})).toBeEnabled(),await s.click(a),await e(a).toHaveAttribute("aria-expanded","true")}},p={args:{onExportGroup:void 0},play:async({canvasElement:n})=>{const t=o(n);await e(t.queryByRole("button",{name:/Export members/})).not.toBeInTheDocument(),await e(t.getByRole("button",{name:"Add"})).toBeEnabled()}},u={args:{targetTabId:null,onWhyNotMember:void 0},play:async({canvasElement:n})=>{const t=o(n);await e(t.getByRole("button",{name:"Add"})).toBeDisabled(),await e(t.getByRole("button",{name:"Compare"})).toBeDisabled(),await e(t.queryByRole("button",{name:"Check membership"})).not.toBeInTheDocument(),await e(t.getByRole("button",{name:/Export members/})).toBeEnabled()}},h={play:async({canvasElement:n,args:t})=>{const r=o(n).getByRole("button",{name:"Check membership"});await e(r).toHaveAttribute("title",e.stringMatching(/two requests/)),await s.click(r),await e(t.onWhyNotMember).toHaveBeenCalledTimes(1)}},b={play:async({canvasElement:n,args:t})=>{const a=o(n),r=o(n.ownerDocument.body),i=a.getByRole("button",{name:"More"});await e(i).toHaveAttribute("aria-expanded","false"),await s.click(i),await e(i).toHaveAttribute("aria-expanded","true"),await s.click(a.getByRole("button",{name:/Remove 3 deprovisioned/}));const d=r.getByRole("dialog",{name:"Remove deprovisioned members"});await e(d).toHaveTextContent(/3 deprovisioned members from Engineering/),await e(t.onRemoveDeprovisioned).not.toHaveBeenCalled(),await s.click(o(d).getByRole("button",{name:"Remove 3"})),await e(t.onRemoveDeprovisioned).toHaveBeenCalledTimes(1)}},v={args:{removeError:"403 Forbidden: you lack permission to modify this group"},play:async({canvasElement:n})=>{const t=o(n),a=o(n.ownerDocument.body);await s.click(t.getByRole("button",{name:"More"})),await s.click(t.getByRole("button",{name:/Remove 3 deprovisioned/})),await e(a.getByRole("dialog")).toHaveTextContent(/403 Forbidden/)}},y={args:{deprovisionedCount:0},play:async({canvasElement:n})=>{const t=o(n);await e(t.queryByRole("button",{name:/deprovisioned/i})).not.toBeInTheDocument()}},g={args:{deprovisionedCount:void 0},play:async({canvasElement:n})=>{const t=o(n);await e(t.queryByRole("button",{name:/deprovisioned/i})).not.toBeInTheDocument()}},w={args:{group:{...C,type:"APP_GROUP",name:"Salesforce Users"},deprovisionedCount:12},play:async({canvasElement:n})=>{const t=o(n);await e(t.queryByRole("button",{name:/deprovisioned/i})).not.toBeInTheDocument()}},B={play:async({canvasElement:n,args:t})=>{const a=o(n),r=a.getByRole("button",{name:"More"});await e(r).toHaveAttribute("aria-expanded","false"),await s.click(r),await e(r).toHaveAttribute("aria-expanded","true"),await e(a.getByText("Memberships a rule grants outlive the rule")).toBeVisible();const i=a.getByRole("button",{name:"Create feeding rule"});await e(i).toBeVisible(),await s.click(i),await e(t.onCreateFeedingRule).toHaveBeenCalledTimes(1)}},R={args:{targetTabId:null},play:async({canvasElement:n})=>{const t=o(n);await s.click(t.getByRole("button",{name:"More"}));const a=t.getByRole("button",{name:"Create feeding rule"});await e(a).toBeDisabled(),await e(a).toHaveAttribute("title","Connect an Okta tab to create a rule")}},f={play:async({canvasElement:n,args:t})=>{const r=o(n).getByRole("button",{name:"More"}),i=document.getElementById(r.getAttribute("aria-controls")??"");if(!i)throw new Error("the More control names no region");const d=o(i).getByRole("button",{name:"Set attribute on 47 members"});await e(d).toBeInTheDocument(),await e(o(i).getByText(/not on the\s+selected users/)).toBeInTheDocument(),await e(o(i).getByText(/recorded for up to\s+100/)).toBeInTheDocument(),await s.click(r),await s.click(d),await e(t.onSetProfileAttribute).toHaveBeenCalledTimes(1)}},E={args:{filteredMemberCount:void 0},play:async({canvasElement:n})=>{const a=o(n).getByRole("button",{name:"More"}),r=document.getElementById(a.getAttribute("aria-controls")??"");if(!r)throw new Error("the More control names no region");await e(o(r).queryByRole("button",{name:/Set attribute/})).not.toBeInTheDocument(),await e(o(r).queryByText(/not on the\s+selected users/)).not.toBeInTheDocument(),await e(o(r).getByRole("button",{name:/Remove 3 deprovisioned/})).toBeVisible()}},x={args:{filteredMemberCount:1},play:async({canvasElement:n})=>{const t=o(n);await e(t.getByRole("button",{name:"Set attribute on 1 member"})).toBeInTheDocument()}},T={args:{filteredMemberCount:0},play:async({canvasElement:n})=>{const t=o(n);await e(t.queryByRole("button",{name:/Set attribute/})).not.toBeInTheDocument()}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:"{}",...m.parameters?.docs?.source},description:{story:"Every action wired: Add and Compare in the row, the other three behind **More**.",...m.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Asserted structurally, through the region the **More** control names —
    // the same shape \`GroupDetailView.test.tsx\` uses for the tier. "Is it
    // visible" would not do it: a closed tier is a \`0fr\` grid row, which is a
    // laid-out box either way.
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');
    await expect(within(tier).getByRole('button', {
      name: /Export members/
    })).toBeInTheDocument();
    await expect(within(tier).queryByRole('button', {
      name: 'Add'
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Add'
    })).toBeEnabled();

    // And it is reachable: pressing More discloses it.
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
  }
}`,...l.parameters?.docs?.source},description:{story:"The verb that acts is in the row and the export that leaves is behind the disclosure.\nOnly the arrangement is asserted: the headless runner loads no Tailwind, so `variant`\nhas no visible consequence to check.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    onExportGroup: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: /Export members/
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Add'
    })).toBeEnabled();
  }
}`,...p.parameters?.docs?.source},description:{story:"No `onExportGroup` — the strip renders only `Add`, never a disabled ghost button.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null,
    onWhyNotMember: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Add'
    })).toBeDisabled();
    await expect(canvas.getByRole('button', {
      name: 'Compare'
    })).toBeDisabled();
    // A check that fetches is omitted without a tab, never disabled.
    await expect(canvas.queryByRole('button', {
      name: 'Check membership'
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: /Export members/
    })).toBeEnabled();
  }
}`,...u.parameters?.docs?.source},description:{story:"No connected Okta tab — `Add` disables; `Export members` (a client-side navigation) does not.",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const check = canvas.getByRole('button', {
      name: 'Check membership'
    });
    await expect(check).toHaveAttribute('title', expect.stringMatching(/two requests/));
    await userEvent.click(check);
    await expect(args.onWhyNotMember).toHaveBeenCalledTimes(1);
  }
}`,...h.parameters?.docs?.source},description:{story:"*Check membership* in the row, stating its cost, wired to the picker.",...h.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', {
      name: /Remove 3 deprovisioned/
    }));
    const dialog = body.getByRole('dialog', {
      name: 'Remove deprovisioned members'
    });
    await expect(dialog).toHaveTextContent(/3 deprovisioned members from Engineering/);
    await expect(args.onRemoveDeprovisioned).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', {
      name: 'Remove 3'
    }));
    await expect(args.onRemoveDeprovisioned).toHaveBeenCalledTimes(1);
  }
}`,...b.parameters?.docs?.source},description:{story:"The tier's descriptor half: it is accepting the confirm that calls the handler, not the verb.",...b.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    removeError: '403 Forbidden: you lack permission to modify this group'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', {
      name: 'More'
    }));
    await userEvent.click(canvas.getByRole('button', {
      name: /Remove 3 deprovisioned/
    }));
    await expect(body.getByRole('dialog')).toHaveTextContent(/403 Forbidden/);
  }
}`,...v.parameters?.docs?.source},description:{story:"The confirm, mid-run and then failed — the error lands in the dialog, not a toast.",...v.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    deprovisionedCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: /deprovisioned/i
    })).not.toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:'Nobody is deprovisioned: the verb is gone, not a disabled "Remove 0" behind **More**.',...y.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    deprovisionedCount: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: /deprovisioned/i
    })).not.toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"Roster not analyzed: absent is not zero, so no verb whose label would state a count.",...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      ...group,
      type: 'APP_GROUP',
      name: 'Salesforce Users'
    },
    deprovisionedCount: 12
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: /deprovisioned/i
    })).not.toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:"An APP_GROUP: the operation refuses these, so the strip does not offer the verb.",...w.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText('Memberships a rule grants outlive the rule')).toBeVisible();
    const create = canvas.getByRole('button', {
      name: 'Create feeding rule'
    });
    await expect(create).toBeVisible();
    await userEvent.click(create);
    await expect(args.onCreateFeedingRule).toHaveBeenCalledTimes(1);
  }
}`,...B.parameters?.docs?.source},description:{story:"The tier's `expansion` half: *Create feeding rule*, with its consequence stated beside it.",...B.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    targetTabId: null
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'More'
    }));
    const create = canvas.getByRole('button', {
      name: 'Create feeding rule'
    });
    await expect(create).toBeDisabled();
    await expect(create).toHaveAttribute('title', 'Connect an Okta tab to create a rule');
  }
}`,...R.parameters?.docs?.source},description:{story:"No connected tab: the write verb disables with a reason, rather than disappearing.",...R.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');

    // A tier descriptor, never a row one: a profile overwrite has no symmetric undo.
    const verb = within(tier).getByRole('button', {
      name: 'Set attribute on 47 members'
    });
    await expect(verb).toBeInTheDocument();

    // The scope beside the control, and the bound that refuses a larger cohort.
    await expect(within(tier).getByText(/not on the\\s+selected users/)).toBeInTheDocument();
    await expect(within(tier).getByText(/recorded for up to\\s+100/)).toBeInTheDocument();
    await userEvent.click(more);
    await userEvent.click(verb);
    await expect(args.onSetProfileAttribute).toHaveBeenCalledTimes(1);
  }
}`,...f.parameters?.docs?.source},description:{story:`The filter-scoped verb: behind **More**, labelled with the count the Members pane
measured, and sitting above the sentence that says whose profiles it would write.`,...f.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    filteredMemberCount: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    const tier = document.getElementById(more.getAttribute('aria-controls') ?? '');
    if (!tier) throw new Error('the More control names no region');
    await expect(within(tier).queryByRole('button', {
      name: /Set attribute/
    })).not.toBeInTheDocument();
    // Both halves: a story asserting only the button would pass on a strip that
    // still explained a cohort it no longer offers to act on.
    await expect(within(tier).queryByText(/not on the\\s+selected users/)).not.toBeInTheDocument();

    // The rest of the tier is untouched.
    await expect(within(tier).getByRole('button', {
      name: /Remove 3 deprovisioned/
    })).toBeVisible();
  }
}`,...E.parameters?.docs?.source},description:{story:`Another pane is on screen, so there is no filter to scope to: the verb **and** its
scope sentence are both gone, rather than a count quoted for a filter nobody can see.`,...E.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    filteredMemberCount: 1
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Set attribute on 1 member'
    })).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source},description:{story:'One member matches: "1 member", never "1 members".',...x.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    filteredMemberCount: 0
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button', {
      name: /Set attribute/
    })).not.toBeInTheDocument();
  }
}`,...T.parameters?.docs?.source},description:{story:`Nothing survived the filters. Absent rather than a disabled "Set attribute on 0
members" — an empty cohort is not a cohort to act on.`,...T.parameters?.docs?.description}}};const S=["Default","AddIsThePrimaryAndExportIsBehindMore","ExportOmitted","NoConnectedTab","WhyNotAMemberInTheRow","RemoveDeprovisioned","RemoveFailed","NoDeprovisionedMembers","RosterNotLoaded","AppGroupHasNoRemove","TierOpen","TierWithoutConnectedTab","FilteredCohortVerb","NoFilteredCohort","FilteredCohortOfOne","FilteredCohortEmpty"];export{l as AddIsThePrimaryAndExportIsBehindMore,w as AppGroupHasNoRemove,m as Default,p as ExportOmitted,T as FilteredCohortEmpty,x as FilteredCohortOfOne,f as FilteredCohortVerb,u as NoConnectedTab,y as NoDeprovisionedMembers,E as NoFilteredCohort,b as RemoveDeprovisioned,v as RemoveFailed,g as RosterNotLoaded,B as TierOpen,R as TierWithoutConnectedTab,h as WhyNotAMemberInTheRow,S as __namedExportsOrder,O as default};
