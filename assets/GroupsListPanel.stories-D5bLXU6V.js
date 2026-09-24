import{G as S}from"./GroupsListPanel-DJRVOplx.js";import{a as w}from"./fixtures-CsAiPaTu.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./useStaggerReveal-CSztixYY.js";import"./GroupListItem-BLpySr8O.js";import"./revealOnHover-DU3PDCIu.js";import"./groupSourceSummary-5IQQYabX.js";import"./memberSourceBuckets-DVHQYQgQ.js";import"./chartPalette-Byit8206.js";import"./GroupListItemDetails-Nq6Nmf-8.js";import"./MemberSourceMeter-piBJg5o1.js";import"./dateFormat-C9yVDsck.js";import"./memberSourceCache-C1Bgnwa1.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";const{expect:t,fn:n,userEvent:f,within:y}=__STORYBOOK_MODULE_TEST__,g=[{id:w.id,name:w.profile.name,description:w.profile.description,type:"OKTA_GROUP",memberCount:128,hasRules:!0,ruleCount:2},{id:"group456",name:"Push - Salesforce Admins",type:"APP_GROUP",memberCount:14,hasRules:!1,ruleCount:0,sourceAppId:"app1",sourceAppName:"Salesforce"},{id:"group789",name:"Everyone",type:"BUILT_IN",memberCount:5400,hasRules:!1,ruleCount:0}],F={title:"Groups/GroupsListPanel",component:S,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'The scrollable groups list plus its mode-specific empty states.\n\nRenders a `GroupListItem` per filtered group, forwarding selection, deep-link, and analyze-source handlers. Shows a spinner during the initial load, and distinct empty states for cached mode with excluding filters versus a live search that returned no matches — the live "no results" copy is suppressed while a search is still in flight.'}}},argTypes:{loading:{description:"Whether the initial group load is in progress."},searchMode:{description:"`live` queries Okta directly; `cached` filters the loaded list."},liveSearchQuery:{description:"Current live-search query (drives the live empty-state copy)."},isLiveSearching:{description:'Whether a live search is in flight (suppresses the "no results" state).'},hasGroups:{description:"Whether any groups are loaded — gates the cached-mode empty state."},activeFilterCount:{description:'Active-filter count — gates the "Clear Filters" empty-state action.'},filteredGroups:{description:"Groups to render after filtering/sorting."},selectedGroupIds:{description:"Ids of the currently selected groups."},selectedCount:{description:"How many groups are selected — the `· N selected` half of the count line above the list, omitted entirely when zero."},onToggleSelect:{description:"Toggles selection for a group id."},onSelectAll:{description:"Ticks every group the current filter matches — wired to `Select all` on the count row."},onDeselectAll:{description:"Clears the whole selection, including groups picked on another screen."},oktaOrigin:{description:"Okta origin passed to each row for deep-linking."},onLoadAllGroups:{description:"Switches to cached mode by loading all groups (live empty-state action)."},onClearFilters:{description:"Clears all filters (cached empty-state action)."},onOpenDetail:{description:"Drills into a group's read-only detail view (pushes onto the tab's view stack)."},highlightedGroupId:{description:"Group id to highlight (deep-link target from the Rules tab)."}},args:{loading:!1,searchMode:"cached",liveSearchQuery:"",isLiveSearching:!1,hasGroups:!0,activeFilterCount:0,filteredGroups:g,selectedGroupIds:new Set,selectedCount:0,onToggleSelect:n(),onSelectAll:n(),onDeselectAll:n(),oktaOrigin:"https://example.okta.com",onLoadAllGroups:n(),onClearFilters:n(),onOpenDetail:n()}},r={},o={args:{selectedGroupIds:new Set([g[0].id]),selectedCount:1},play:async({args:s,canvasElement:e})=>{const a=y(e);await t(a.getByTestId("groups-count-line")).toHaveTextContent("Showing 3 of 3 · 1 selected");const v=a.getByRole("button",{name:"Select all"});await t(v).toBeEnabled(),await t(v).toHaveAccessibleDescription("Select every group the current filter matches"),await t(a.getByRole("button",{name:"Deselect all"})).toHaveAccessibleDescription("Clear every selected group, including any picked on another screen"),await f.click(v),await t(s.onSelectAll).toHaveBeenCalledTimes(1),await f.click(a.getByRole("button",{name:"Deselect all"})),await t(s.onDeselectAll).toHaveBeenCalledTimes(1)}},i={args:{selectedGroupIds:new Set(g.map(s=>s.id)),selectedCount:g.length},play:async({canvasElement:s})=>{const e=y(s),a=e.getByRole("button",{name:"Select all"});await t(a).toBeDisabled(),await t(a).toHaveAccessibleDescription("All 3 groups matching the filter are already selected"),await t(e.getByRole("button",{name:"Deselect all"})).toBeEnabled()}},l={args:{searchMode:"live",liveSearchQuery:"team",hasGroups:!1},play:async({canvasElement:s})=>{const e=y(s);await t(e.getByTestId("groups-count-line")).toHaveTextContent("Showing 3 of 3"),await t(e.queryByRole("button",{name:"Select all"})).not.toBeInTheDocument(),await t(e.queryByRole("button",{name:"Deselect all"})).not.toBeInTheDocument()}},c={args:{highlightedGroupId:g[1].id}},p={args:{loading:!0,filteredGroups:[]}},d={args:{filteredGroups:[],hasGroups:!0,activeFilterCount:2}},u={args:{filteredGroups:[],searchMode:"live",liveSearchQuery:"nonexistent-group",isLiveSearching:!1,hasGroups:!1}},h={args:{filteredGroups:[],searchMode:"live",liveSearchQuery:"admins",isLiveSearching:!0,hasGroups:!1}},m={play:async({canvasElement:s})=>{const e=y(s);await t(e.getByText(/Showing 50 of 120/)).toBeInTheDocument(),await f.click(e.getByRole("button",{name:/Load more/})),await t(await e.findByText(/Showing 100 of 120/)).toBeInTheDocument(),await t(e.getByText("Team 100")).toBeInTheDocument()},args:{filteredGroups:Array.from({length:120},(s,e)=>({id:`00gFAKE${String(e).padStart(4,"0")}`,name:`Team ${e+1}`,description:"Generated sample group",type:"OKTA_GROUP",memberCount:e*7%400,hasRules:e%5===0,ruleCount:e%5===0?1:0}))}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source},description:{story:"Three groups spanning the OKTA/APP/BUILT-IN types.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedGroupIds: new Set([sampleGroups[0].id]),
    selectedCount: 1
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // By test id, not by text: the selected clause is a nested \`span\` carrying
    // its own colour, and \`getByText\` reads only an element's direct text nodes.
    await expect(canvas.getByTestId('groups-count-line')).toHaveTextContent('Showing 3 of 3 · 1 selected');

    // The pair's ordering is \`ListCountRow\`'s own property and is pinned in its
    // stories; what is this rung's is the copy each control carries.
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeEnabled();
    await expect(selectAll).toHaveAccessibleDescription('Select every group the current filter matches');
    await expect(canvas.getByRole('button', {
      name: 'Deselect all'
    })).toHaveAccessibleDescription('Clear every selected group, including any picked on another screen');
    await userEvent.click(selectAll);
    await expect(args.onSelectAll).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Deselect all'
    }));
    await expect(args.onDeselectAll).toHaveBeenCalledTimes(1);
  }
}`,...o.parameters?.docs?.source},description:{story:"One group is selected, and the count row above the list says so — the rung's one\nplain-prose statement of either number — with the two selection controls trailing\non the same row. `Deselect all` leads them: it appears the moment anything is\nticked, and a trailing cluster grows leftward, so `Select all` does not move under\nthe pointer that just ticked a row.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selectedGroupIds: new Set(sampleGroups.map(g => g.id)),
    selectedCount: sampleGroups.length
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('All 3 groups matching the filter are already selected');
    await expect(canvas.getByRole('button', {
      name: 'Deselect all'
    })).toBeEnabled();
  }
}`,...i.parameters?.docs?.source},description:{story:"Everything the filter matched is taken — `Select all` stays, disabled, and names\nthe boundary it is sitting on in its accessible description rather than in its\nlabel. It is furniture, not a verb: a control that vanished at its boundary would\nhand its position to whatever came next. The way out is the separate, still-live\n`Deselect all`, not this control under another name.",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    searchMode: 'live',
    liveSearchQuery: 'team',
    hasGroups: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('groups-count-line')).toHaveTextContent('Showing 3 of 3');
    await expect(canvas.queryByRole('button', {
      name: 'Select all'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Deselect all'
    })).not.toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:`Live mode with results: the count row states the numbers, and there are no
selection controls on it. A live result set is a page of server-side matches with
no filter behind it, so there is no "every row the filter matched" for
\`Select all\` to take — which is also why the rung's action strip is not rendered
in this mode.`,...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    highlightedGroupId: sampleGroups[1].id
  }
}`,...c.parameters?.docs?.source},description:{story:"One group is highlighted (deep-link target from the Rules tab).",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    filteredGroups: []
  }
}`,...p.parameters?.docs?.source},description:{story:"Initial group load in progress.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    filteredGroups: [],
    hasGroups: true,
    activeFilterCount: 2
  }
}`,...d.parameters?.docs?.source},description:{story:"Cached mode with active filters that exclude every group.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    filteredGroups: [],
    searchMode: 'live',
    liveSearchQuery: 'nonexistent-group',
    isLiveSearching: false,
    hasGroups: false
  }
}`,...u.parameters?.docs?.source},description:{story:"Live mode with a query that returned no matches.",...u.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    filteredGroups: [],
    searchMode: 'live',
    liveSearchQuery: 'admins',
    isLiveSearching: true,
    hasGroups: false
  }
}`,...h.parameters?.docs?.source},description:{story:"Live mode, a search is currently in flight (suppresses the empty state).",...h.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Showing 50 of 120/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: /Load more/
    }));
    await expect(await canvas.findByText(/Showing 100 of 120/)).toBeInTheDocument();
    await expect(canvas.getByText('Team 100')).toBeInTheDocument();
  },
  args: {
    filteredGroups: Array.from({
      length: 120
    }, (_, i) => ({
      id: \`00gFAKE\${String(i).padStart(4, '0')}\`,
      name: \`Team \${i + 1}\`,
      description: 'Generated sample group',
      type: 'OKTA_GROUP' as const,
      memberCount: i * 7 % 400,
      hasRules: i % 5 === 0,
      ruleCount: i % 5 === 0 ? 1 : 0
    }))
  }
}`,...m.parameters?.docs?.source},description:{story:`A large filtered list (120 groups): only the first 50 rows are mounted, and the
"Load more" footer reveals the rest a page at a time.`,...m.parameters?.docs?.description}}};const P=["Default","WithSelection","AllSelected","LiveResultsHaveNoSelectionControls","Highlighted","Loading","EmptyWithFilters","LiveNoResults","LiveSearching","LargeListWindowed"];export{i as AllSelected,r as Default,d as EmptyWithFilters,c as Highlighted,m as LargeListWindowed,u as LiveNoResults,l as LiveResultsHaveNoSelectionControls,h as LiveSearching,p as Loading,o as WithSelection,P as __namedExportsOrder,F as default};
