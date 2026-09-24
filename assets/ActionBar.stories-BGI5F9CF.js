import{x as l,j as a,$ as M,aa as T,D as j,i as d,e as I}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:o,fn:e,userEvent:R,waitFor:N,within:i}=__STORYBOOK_MODULE_TEST__,O={title:"Shared/ActionBar",component:l,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The page-level action strip of a detail view: the verbs whose object is the whole page, taken as `ActionDescriptor[]` data so the strip can measure them and re-split the row as the panel narrows — icons drop first, then the tail moves behind **More**.\n\nA verb scoped to one section's data belongs in that section's `DetailSection.actions` slot, not here. The tier behind **More** is a disclosure region rather than a menu, so `expansion` may hold arbitrary UI."}}},argTypes:{actions:{description:"The page's verbs as data, ordered by weight; the tail is what overflows first."},ariaLabel:{description:'Accessible name for the group, e.g. `"Actions for Jane Doe"`.'},subRow:{description:"Always-visible caller UI inside the band, under the verbs and above the tier — a list rung's search field. Never measured, so unlike a descriptor it may carry JSX."},register:{description:"The selection register: a second measured row of selection-scoped verbs, whose leading control must be one whose worst outcome is another click. Selection furniture lives on the rung’s `ListCountRow`, not here."},sticky:{description:"Pin below the page header while the page scrolls under it, merging into it as it docks. Defaults to `true`."},expansion:{description:"Arbitrary caller UI for the tier, appended below anything that overflowed there."},tierOpen:{description:"Whether the tier is open. Omit to let the strip own the state — the tier can become non-empty without the caller knowing, so a caller that never passed `expansion` should not have to own state for it."},defaultTierOpen:{description:"Initial open state when uncontrolled. Defaults to `false`."},onTierOpenChange:{description:"Called with the next open state whenever the disclosure is toggled."},className:{description:"Extra classes merged after the layout classes."},testId:{description:"Optional test handle."}},args:{ariaLabel:"Actions for Jane Doe",sticky:!1,actions:[{id:"add-group",label:"Add group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()},{id:"export",label:"Export",icon:"download",onClick:e()}]}},L=async()=>{await document.fonts.ready,await new Promise(window.requestAnimationFrame),await new Promise(window.requestAnimationFrame)},E=t=>{const n=i(t),r=n.queryByRole("button",{name:"More"})?.getAttribute("aria-controls"),c=r?t.ownerDocument.getElementById(r):null;return n.getAllByRole("button").filter(D=>c===null||!c.contains(D)).map(D=>(D.textContent??"").trim())},S=t=>a.jsx("div",{className:"bg-canvas p-3",style:{inlineSize:"360px"},children:t}),p={},h={args:{ariaLabel:"Actions for Sales — West",actions:[{id:"export-members",label:"Export members",icon:"download",onClick:e()}]}},u={parameters:{viewport:{value:"sidepanelCompact"}},render:t=>S(a.jsx(l,{...t}))},m={parameters:{motion:"on"},args:{sticky:!0,actions:[{id:"add-group",label:"Add group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()}],expansion:a.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[a.jsx(d,{variant:"secondary",size:"sm",icon:"pause",onClick:e(),children:"Suspend user"}),a.jsx(d,{variant:"secondary",size:"sm",icon:"key",onClick:e(),children:"Reset password"})]})},render:t=>a.jsxs("div",{"data-header-scope":!0,className:"h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas",children:[a.jsx(M,{sticky:!0,title:"Jane Doe",badge:{text:"Active",variant:"success"},identityKey:"00uFAKE1a2b3c4d5e6",identity:a.jsx(T,{rows:[[{kind:"text",text:"jane.doe@example.com"}],[{kind:"id",value:"00uFAKE1a2b3c4d5e6",copyLabel:"Copy user id"}],[{kind:"metric",icon:"users",value:"14",label:"groups"}]]})}),a.jsxs("div",{className:"space-y-6 px-6 py-6",children:[a.jsx(l,{...t}),["Membership source","Rules","Grants access to","App push","Metadata"].map(n=>a.jsx(j,{title:n,children:a.jsx("p",{className:"text-sm text-neutral-600",children:"Body content, tall enough that the strip above has something to hold against."})},n))]})]})},b={parameters:{motion:"on"},args:{sticky:!0,actions:[{id:"export-members",label:"Export members",icon:"download",variant:"primary",onClick:e()},{id:"add-member",label:"Add",icon:"plus",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()}]},render:t=>a.jsxs("div",{"data-header-scope":!0,className:"h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas",children:[a.jsx(M,{sticky:!0,title:"Engineering - All",badge:{text:"Okta Group",variant:"primary"},identityKey:"00gFAKE1a2b3c4d5e6",identity:a.jsx(T,{rows:[[{kind:"id",value:"00gFAKE1a2b3c4d5e6",copyLabel:"Copy group id"}],[{kind:"metric",icon:"users",value:"128",label:"members"}]]})}),a.jsx("div",{className:"animate-push-in",children:a.jsxs("div",{className:"space-y-6 px-6 py-6",children:[a.jsx(l,{...t}),["Membership source","Rules","Grants access to","App push","Metadata"].map(n=>a.jsx(j,{title:n,children:a.jsx("p",{className:"text-sm text-neutral-600",children:"Body content, tall enough that the strip above has something to hold against."})},n))]})})]})},g={parameters:{motion:"on"},args:{actions:[{id:"add-group",label:"Add group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()}],expansion:a.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[a.jsx(d,{variant:"secondary",size:"sm",icon:"pause",onClick:e(),children:"Suspend user"}),a.jsx(d,{variant:"secondary",size:"sm",icon:"key",onClick:e(),children:"Reset password"})]})},play:async({canvasElement:t})=>{const n=i(t),s=n.getByRole("button",{name:"More"});await o(s).toHaveAttribute("aria-expanded","false"),await R.click(s),await o(s).toHaveAttribute("aria-expanded","true"),await o(n.getByRole("button",{name:"Suspend user"})).toBeVisible()}},v={args:{ariaLabel:"Actions for the groups list",actions:[{id:"export-list",label:"Export list",icon:"download",variant:"primary",onClick:e()},{id:"cross-search",label:"Cross-search",icon:"search",onClick:e()},{id:"cleanup",label:"Cleanup",icon:"sparkles",onClick:e(),priority:"tier"}],subRow:a.jsxs("div",{className:"flex gap-2",children:[a.jsx(I,{size:"sm",type:"search",value:"",onChange:e(),ariaLabel:"Filter groups",placeholder:"Search by name, description…"}),a.jsx(d,{variant:"secondary",size:"sm",icon:"settings",onClick:e(),children:"Filters"})]})},play:async({canvasElement:t})=>{const n=i(t),s=t.querySelector(".dock-band");await o(s).toContainElement(n.getByRole("searchbox",{name:"Filter groups"}));const r=n.getByRole("button",{name:"More"});await R.click(r),await o(n.getByRole("button",{name:"Cleanup"})).toBeVisible()}},w={parameters:{viewport:{value:"sidepanelCompact"}},args:{ariaLabel:"Actions for Jane Doe",actions:[{id:"add-group",label:"Add to group",icon:"plus",onClick:e()},{id:"compare",label:"Compare users",icon:"users",onClick:e()},{id:"export",label:"Export members",icon:"download",onClick:e()},{id:"refresh",label:"Refresh access",icon:"refresh",onClick:e()},{id:"deactivate",label:"Deactivate user",icon:"pause",onClick:e()},{id:"clear-sessions",label:"Clear sessions",icon:"key",onClick:e()}]},render:t=>S(a.jsx(l,{...t})),play:async({canvasElement:t})=>{const n=i(t);await L();const s=await n.findByRole("button",{name:"More"});await o(s).toHaveAttribute("aria-expanded","false"),await N(()=>o(E(t)).not.toContain("Clear sessions"));const r=n.getByRole("button",{name:"Clear sessions"});r.focus(),await o(r).not.toHaveFocus(),await R.click(s),await o(s).toHaveAttribute("aria-expanded","true");const c=n.getByRole("button",{name:"Clear sessions"});c.focus(),await o(c).toHaveFocus()}},y={args:{ariaLabel:"Actions for Jane Doe",actions:[{id:"add-group",label:"Add group",icon:"plus",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()},{id:"export",label:"Export",icon:"download",onClick:e()},{id:"refresh",label:"Refresh",icon:"refresh",onClick:e()}]},render:t=>a.jsx("div",{className:"w-[370px] bg-canvas p-3",children:a.jsx(l,{...t})})},x={parameters:{viewport:{value:"sidepanelCompact"}},args:{ariaLabel:"Actions for Jane Doe",actions:[{id:"add-group",label:"Add to group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare users",icon:"users",onClick:e()},{id:"export",label:"Export members",icon:"download",onClick:e()},{id:"refresh",label:"Refresh access",icon:"refresh",onClick:e()},{id:"deactivate",label:"Deactivate user",icon:"pause",onClick:e()}]},render:t=>S(a.jsx(l,{...t})),play:async({canvasElement:t})=>{const n=i(t);await L();const s=await n.findByRole("button",{name:"More"});await N(()=>o(E(t)).not.toContain("Deactivate user")),await o(E(t)).toContain("Add to group"),await o(s).toHaveAttribute("aria-expanded","false")}},f={parameters:{viewport:{value:"sidepanelCompact"}},args:{ariaLabel:"Actions for Jane Doe",actions:[{id:"add-group",label:"Add to group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare users",icon:"users",onClick:e()},{id:"export",label:"Export members",icon:"download",onClick:e()},{id:"refresh",label:"Refresh access",icon:"refresh",onClick:e()},{id:"clear-sessions",label:"Clear sessions",icon:"key",priority:"tier",onClick:e()}],expansion:a.jsxs("div",{className:"space-y-2",children:[a.jsx("p",{className:"text-xs text-neutral-600",children:"Password last changed 12 Mar 2026 · jane.doe@example.com"}),a.jsx(d,{variant:"secondary",size:"sm",icon:"key",onClick:e(),children:"Reset password"})]})},render:t=>S(a.jsx(l,{...t})),play:async({canvasElement:t})=>{const s=i(t).getByRole("button",{name:"More"});await o(s).toHaveAttribute("aria-expanded","false"),await o(E(t)).not.toContain("Clear sessions"),await R.click(s),await o(s).toHaveAttribute("aria-expanded","true");const r=s.getAttribute("aria-controls")??"",c=i(t.ownerDocument.getElementById(r));await o(c.getByRole("button",{name:"Clear sessions"})).toBeVisible(),await o(c.getByRole("button",{name:"Reset password"})).toBeVisible()}},C={args:{actions:[{id:"add-group",label:"Add group",icon:"plus",variant:"primary",onClick:e()},{id:"compare",label:"Compare",icon:"users",onClick:e()}],expansion:a.jsx("div",{className:"flex flex-wrap items-center gap-2",children:a.jsx(d,{variant:"secondary",size:"sm",icon:"pause",onClick:e(),children:"Suspend user"})})},render:t=>a.jsxs("div",{className:"w-[480px] space-y-6 bg-canvas p-6",children:[a.jsx(l,{...t}),a.jsx(j,{title:"Membership source",children:a.jsx("p",{className:"text-sm text-neutral-600",children:"A section fills the column edge to edge, and so does the strip above it. They are the same kind of box until the strip docks and grows past the column into the panel."})})]})},k={args:{ariaLabel:"Actions for the groups list",actions:[{id:"export-list",label:"Export list",icon:"download",variant:"primary",onClick:e()},{id:"cross-search",label:"Cross-search",icon:"search",onClick:e()}],register:{ariaLabel:"Actions for the selected groups",actions:[{id:"compare",label:"Compare",icon:"chart",onClick:e(),title:"Compare the 3 selected groups",priority:"pinned"},{id:"export-selection",label:"Export",icon:"download",onClick:e(),title:"Export the 3 selected groups"},{id:"merge",label:"Merge",icon:"link",onClick:e(),title:"Copy the 3 selected groups’ members into one survivor",priority:"tier"}]}},play:async({canvasElement:t})=>{const n=i(t),s=n.getByRole("group",{name:"Actions for the selected groups"}),r=i(s).getAllByRole("button")[0];await o(r).toHaveAccessibleName("Compare"),await o(i(s).queryByRole("button",{name:"Export list"})).not.toBeInTheDocument();for(const c of["Select all","Deselect all"])await o(n.queryByRole("button",{name:c})).not.toBeInTheDocument();for(const c of i(s).getAllByRole("button"))await o(c.textContent??"").not.toMatch(/\d/);await o(i(s).getByRole("button",{name:"Compare"})).toHaveAccessibleDescription("Compare the 3 selected groups"),await o(n.getAllByRole("button",{name:"More"})).toHaveLength(1),await R.click(n.getByRole("button",{name:"More"})),await o(n.getByRole("button",{name:"Merge"})).toBeVisible()}},A={args:{ariaLabel:"Actions for the groups list",actions:[{id:"export-list",label:"Export list",icon:"download",variant:"primary",onClick:e()}],register:{ariaLabel:"Actions for the selected groups",actions:[]}},play:async({canvasElement:t})=>{const n=i(t),s=n.getByRole("group",{name:"Actions for the selected groups"});await o(s).toBeInTheDocument(),await o(i(s).queryAllByRole("button")).toHaveLength(0),await o(n.getByRole("button",{name:"Export list"})).toBeVisible()}},B={args:{ariaLabel:"Actions for the groups list",actions:[{id:"export-list",label:"Export list",icon:"download",variant:"primary",onClick:e()}],testId:"empty-tier-bar"},play:async({canvasElement:t})=>{const n=i(t);await o(n.queryByRole("button",{name:"More"})).not.toBeInTheDocument();const r=n.getByTestId("empty-tier-bar").querySelector(".disclose");await o(r).not.toBeNull(),await o(r).toHaveAttribute("data-open","false"),await o(r).toHaveAttribute("inert")}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:"{}",...p.parameters?.docs?.source},description:{story:"The user-detail set: add to a group, compare, export.",...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for Sales — West',
    actions: [{
      id: 'export-members',
      label: 'Export members',
      icon: 'download',
      onClick: fn()
    }]
  }
}`,...h.parameters?.docs?.source},description:{story:`A single verb — the group-detail case, and the one shape with no **More** control
at all: an empty tier gets no disclosure button.`,...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  render: args => narrowFrame(<ActionBar {...args} />)
}`,...u.parameters?.docs?.source},description:{story:`At 360px the strip walks the cramped ladder instead of wrapping: the glyphs go
first, all at once, and only then does the tail move behind **More**.`,...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    sticky: true,
    // A tier, because the rung this mirrors has one: \`UserActionBar\` keeps the
    // account-state verbs behind **More**. Without it there is no More control in
    // the DOM at all, and this story could not show the trailing edge the docstring
    // below describes.
    actions: [{
      id: 'add-group',
      label: 'Add group',
      icon: 'plus',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: fn()
    }],
    expansion: <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
  },
  render: args =>
  // \`[overflow-anchor:none]\` mirrors the app's scroll root (\`App.tsx\`): without it,
  // Chrome's scroll anchoring drags \`scrollTop\` back to 0 on every small scroll.
  <div data-header-scope className="h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas">
      <PageHeader sticky title="Jane Doe" badge={{
      text: 'Active',
      variant: 'success'
    }} identityKey="00uFAKE1a2b3c4d5e6" identity={<EntityIdentity rows={[[{
      kind: 'text',
      text: 'jane.doe@example.com'
    }], [{
      kind: 'id',
      value: '00uFAKE1a2b3c4d5e6',
      copyLabel: 'Copy user id'
    }], [{
      kind: 'metric',
      icon: 'users',
      value: '14',
      label: 'groups'
    }]]} />} />
      <div className="space-y-6 px-6 py-6">
        <ActionBar {...args} />
        {['Membership source', 'Rules', 'Grants access to', 'App push', 'Metadata'].map(title => <DetailSection key={title} title={title}>
            <p className="text-sm text-neutral-600">
              Body content, tall enough that the strip above has something to hold against.
            </p>
          </DetailSection>)}
      </div>
    </div>
}`,...m.parameters?.docs?.source},description:{story:`The real detail-rung composition. Scroll the frame to watch the strip merge into the
header over the last 16px of travel: it grows to the panel edges, drops its radius and
its top/side borders and covers the header's seam, while the verbs themselves hold still.`,...m.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    sticky: true,
    actions: [{
      id: 'export-members',
      label: 'Export members',
      icon: 'download',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'add-member',
      label: 'Add',
      icon: 'plus',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: fn()
    }]
  },
  render: args => <div data-header-scope className="h-96 w-[360px] overflow-y-auto [overflow-anchor:none] bg-canvas">
      <PageHeader sticky title="Engineering - All" badge={{
      text: 'Okta Group',
      variant: 'primary'
    }} identityKey="00gFAKE1a2b3c4d5e6" identity={<EntityIdentity rows={[[{
      kind: 'id',
      value: '00gFAKE1a2b3c4d5e6',
      copyLabel: 'Copy group id'
    }], [{
      kind: 'metric',
      icon: 'users',
      value: '128',
      label: 'members'
    }]]} />} />
      {/*
        The wrapper under test: \`GroupsTab\` puts exactly this between the scroller and the rung
        so a pushed detail view travels in from the right.
       */}
      <div className="animate-push-in">
        <div className="space-y-6 px-6 py-6">
          <ActionBar {...args} />
          {['Membership source', 'Rules', 'Grants access to', 'App push', 'Metadata'].map(title => <DetailSection key={title} title={title}>
                <p className="text-sm text-neutral-600">
                  Body content, tall enough that the strip above has something to hold against.
                </p>
              </DetailSection>)}
        </div>
      </div>
    </div>
}`,...b.parameters?.docs?.source},description:{story:`The docked strip one wrapper deeper — the shape \`GroupsTab\` renders, where the rung
arrives under an entrance animation. The invariant it holds: nothing between the band
and the header may establish a stacking context, or the header repaints over the seam
the merge just covered. Checked by eye — the headless suite loads no CSS.`,...b.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    actions: [{
      id: 'add-group',
      label: 'Add group',
      icon: 'plus',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: fn()
    }],
    expansion: <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', {
      name: 'Suspend user'
    })).toBeVisible();
  }
}`,...g.parameters?.docs?.source},description:{story:"The tiered strip: everyday verbs above, a disclosure below them. Toggling **More**\nstretches the band rather than dropping a card underneath it, and the tier stays\nmounted (`inert`) while closed so nothing inside resets on collapse.",...g.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [{
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'cross-search',
      label: 'Cross-search',
      icon: 'search',
      onClick: fn()
    }, {
      id: 'cleanup',
      label: 'Cleanup',
      icon: 'sparkles',
      onClick: fn(),
      priority: 'tier'
    }],
    subRow: <div className="flex gap-2">
        <Input size="sm" type="search" value="" onChange={fn()} ariaLabel="Filter groups" placeholder="Search by name, description…" />
        <Button variant="secondary" size="sm" icon="settings" onClick={fn()}>
          Filters
        </Button>
      </div>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The field is inside the band, so it docks with it.
    const band = canvasElement.querySelector('.dock-band') as HTMLElement;
    await expect(band).toContainElement(canvas.getByRole('searchbox', {
      name: 'Filter groups'
    }));

    // And the tier opens below it, not between the verbs and the field.
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await userEvent.click(more);
    await expect(canvas.getByRole('button', {
      name: 'Cleanup'
    })).toBeVisible();
  }
}`,...v.parameters?.docs?.source},description:{story:"`subRow` — always-visible caller UI inside the band, under the verbs and above the\ntier. It is where a list rung's search field lives, so the field docks with the verbs\nthat filter what it searches. It may carry JSX because it is never measured.",...v.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [{
      id: 'add-group',
      label: 'Add to group',
      icon: 'plus',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare users',
      icon: 'users',
      onClick: fn()
    }, {
      id: 'export',
      label: 'Export members',
      icon: 'download',
      onClick: fn()
    }, {
      id: 'refresh',
      label: 'Refresh access',
      icon: 'refresh',
      onClick: fn()
    }, {
      id: 'deactivate',
      label: 'Deactivate user',
      icon: 'pause',
      onClick: fn()
    }, {
      id: 'clear-sessions',
      label: 'Clear sessions',
      icon: 'key',
      onClick: fn()
    }]
  },
  render: args => narrowFrame(<ActionBar {...args} />),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await settle();
    const more = await canvas.findByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(barButtonLabels(canvasElement)).not.toContain('Clear sessions'));

    // Closed, the tier is held out of the tab order with \`inert\`, so what
    // overflowed cannot be reached at all — not merely not seen.
    const overflowed = canvas.getByRole('button', {
      name: 'Clear sessions'
    });
    overflowed.focus();
    await expect(overflowed).not.toHaveFocus();
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    const reachable = canvas.getByRole('button', {
      name: 'Clear sessions'
    });
    reachable.focus();
    await expect(reachable).toHaveFocus();
  }
}`,...w.parameters?.docs?.source},description:{story:`Six verbs in a panel too narrow to hold them: dropping the glyphs is not enough, so the
tail moves behind **More**, last-declared first.`,...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [{
      id: 'add-group',
      label: 'Add group',
      icon: 'plus',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: fn()
    }, {
      id: 'export',
      label: 'Export',
      icon: 'download',
      onClick: fn()
    }, {
      id: 'refresh',
      label: 'Refresh',
      icon: 'refresh',
      onClick: fn()
    }]
  },
  render: args => <div className="w-[370px] bg-canvas p-3">
      <ActionBar {...args} />
    </div>
}`,...y.parameters?.docs?.source},description:{story:"The rung below overflow: at 370px these four verbs fit without their glyphs, so every\nicon drops rather than one action leaving. Visual only — the icon rung's assertions\nlive in `actionBarFit.test.ts`, since a missing glyph is only checkable in CSS.",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [{
      id: 'add-group',
      label: 'Add to group',
      icon: 'plus',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare users',
      icon: 'users',
      onClick: fn()
    }, {
      id: 'export',
      label: 'Export members',
      icon: 'download',
      onClick: fn()
    }, {
      id: 'refresh',
      label: 'Refresh access',
      icon: 'refresh',
      onClick: fn()
    }, {
      id: 'deactivate',
      label: 'Deactivate user',
      icon: 'pause',
      onClick: fn()
    }]
  },
  render: args => narrowFrame(<ActionBar {...args} />),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await settle();
    const more = await canvas.findByRole('button', {
      name: 'More'
    });
    // Something has to have left, or "the primary stayed" says nothing at all.
    await waitFor(() => expect(barButtonLabels(canvasElement)).not.toContain('Deactivate user'));
    await expect(barButtonLabels(canvasElement)).toContain('Add to group');
    await expect(more).toHaveAttribute('aria-expanded', 'false');
  }
}`,...x.parameters?.docs?.source},description:{story:"`pinned` is the floor the ladder stops at: the primary verb stays in the bar at the same\nwidth that pushes `Deactivate user` behind **More**.",...x.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  args: {
    ariaLabel: 'Actions for Jane Doe',
    actions: [{
      id: 'add-group',
      label: 'Add to group',
      icon: 'plus',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare users',
      icon: 'users',
      onClick: fn()
    }, {
      id: 'export',
      label: 'Export members',
      icon: 'download',
      onClick: fn()
    }, {
      id: 'refresh',
      label: 'Refresh access',
      icon: 'refresh',
      onClick: fn()
    }, {
      id: 'clear-sessions',
      label: 'Clear sessions',
      icon: 'key',
      priority: 'tier',
      onClick: fn()
    }],
    expansion: <div className="space-y-2">
        <p className="text-xs text-neutral-600">
          Password last changed 12 Mar 2026 · jane.doe@example.com
        </p>
        <Button variant="secondary" size="sm" icon="key" onClick={fn()}>
          Reset password
        </Button>
      </div>
  },
  render: args => narrowFrame(<ActionBar {...args} />),
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const more = canvas.getByRole('button', {
      name: 'More'
    });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(barButtonLabels(canvasElement)).not.toContain('Clear sessions');
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');

    // Both halves live in the one region the disclosure names.
    const tierId = more.getAttribute('aria-controls') ?? '';
    const tier = within(canvasElement.ownerDocument.getElementById(tierId) as HTMLElement);
    await expect(tier.getByRole('button', {
      name: 'Clear sessions'
    })).toBeVisible();
    await expect(tier.getByRole('button', {
      name: 'Reset password'
    })).toBeVisible();
  }
}`,...f.parameters?.docs?.source},description:{story:"The tier's two halves: the verbs the strip put there, then the caller's `expansion`\nverbatim. `Clear sessions` declares `priority: 'tier'`, so the composition is the same\nat any width.",...f.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    actions: [{
      id: 'add-group',
      label: 'Add group',
      icon: 'plus',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'compare',
      label: 'Compare',
      icon: 'users',
      onClick: fn()
    }],
    expansion: <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" icon="pause" onClick={fn()}>
          Suspend user
        </Button>
      </div>
  },
  render: args => <div className="w-[480px] space-y-6 bg-canvas p-6">
      <ActionBar {...args} />
      <DetailSection title="Membership source">
        <p className="text-sm text-neutral-600">
          A section fills the column edge to edge, and so does the strip above it. They are the same
          kind of box until the strip docks and grows past the column into the panel.
        </p>
      </DetailSection>
    </div>
}`,...C.parameters?.docs?.source},description:{story:"The resting shape next to a `DetailSection`: both span the rung to the same two margins,\nso **More** sits at that shared right edge. Only the merge takes the strip past them.",...C.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [{
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: fn()
    }, {
      id: 'cross-search',
      label: 'Cross-search',
      icon: 'search',
      onClick: fn()
    }],
    register: {
      ariaLabel: 'Actions for the selected groups',
      actions: [{
        id: 'compare',
        label: 'Compare',
        icon: 'chart',
        onClick: fn(),
        title: 'Compare the 3 selected groups',
        priority: 'pinned'
      }, {
        id: 'export-selection',
        label: 'Export',
        icon: 'download',
        onClick: fn(),
        title: 'Export the 3 selected groups'
      }, {
        id: 'merge',
        label: 'Merge',
        icon: 'link',
        onClick: fn(),
        title: 'Copy the 3 selected groups’ members into one survivor',
        priority: 'tier'
      }]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Actions for the selected groups'
    });
    const first = within(register).getAllByRole('button')[0];
    await expect(first).toHaveAccessibleName('Compare');

    // A page verb never lands in the register.
    await expect(within(register).queryByRole('button', {
      name: 'Export list'
    })).not.toBeInTheDocument();

    // Selection furniture is not the register's any more: it lives on the rung's
    // count row, beside the figures it moves.
    for (const name of ['Select all', 'Deselect all']) {
      await expect(canvas.queryByRole('button', {
        name
      })).not.toBeInTheDocument();
    }

    // No label here carries a count — the count row states the numbers once, so
    // the verb's object travels in its accessible description instead.
    for (const button of within(register).getAllByRole('button')) {
      await expect(button.textContent ?? '').not.toMatch(/\\d/);
    }
    await expect(within(register).getByRole('button', {
      name: 'Compare'
    })).toHaveAccessibleDescription('Compare the 3 selected groups');

    // \`Merge\` starts behind **More**, in the one shared tier — the register grows
    // no second disclosure of its own.
    await expect(canvas.getAllByRole('button', {
      name: 'More'
    })).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', {
      name: 'More'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Merge'
    })).toBeVisible();
  }
}`,...k.parameters?.docs?.source},description:{story:"The selection register: the strip's second row, holding the verbs whose object is what\nthe reader has ticked rather than the page. Selection furniture is **not** here — it sits\non the rung's `ListCountRow`, beside the numbers it moves — so what this row holds is\nverbs at `xs` against the page verbs' `sm`. Position one must be a verb whose worst\noutcome is another click: `Merge` empties the groups it copies from, so it starts behind\n**More** rather than under the pixel `Compare` occupied a tick earlier. No label here\ncarries a count; each verb's object travels in its `title`.",...k.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [{
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: fn()
    }],
    // At rest the register is genuinely empty: every verb whose object is the
    // ticked rows is absent until something is ticked, and the furniture that
    // used to hold this row open now lives on the rung's count row.
    register: {
      ariaLabel: 'Actions for the selected groups',
      actions: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const register = canvas.getByRole('group', {
      name: 'Actions for the selected groups'
    });

    // The row is present with nothing in it — that is the whole property. A
    // register rendered only once it had a verb would push the list down under
    // the pointer that ticked the first row.
    await expect(register).toBeInTheDocument();
    await expect(within(register).queryAllByRole('button')).toHaveLength(0);

    // Non-vacuity: the band itself does have a verb, so an empty register is not
    // just an empty band.
    await expect(canvas.getByRole('button', {
      name: 'Export list'
    })).toBeVisible();
  }
}`,...A.parameters?.docs?.source},description:{story:`The register shares a row rather than stacking one: at rest it still renders, so the
first tick adds controls instead of pushing the list down under the reader's pointer.`,...A.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Actions for the groups list',
    actions: [{
      id: 'export-list',
      label: 'Export list',
      icon: 'download',
      variant: 'primary',
      onClick: fn()
    }],
    testId: 'empty-tier-bar'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Nothing to disclose, so no More — a control that opens onto nothing is
    // worse than no control.
    await expect(canvas.queryByRole('button', {
      name: 'More'
    })).not.toBeInTheDocument();

    // But the region it would open is already in the band, closed and inert, so
    // the band's row count does not change when a tier verb later arrives.
    const band = canvas.getByTestId('empty-tier-bar');
    const tier = band.querySelector('.disclose');
    await expect(tier).not.toBeNull();
    await expect(tier).toHaveAttribute('data-open', 'false');
    await expect(tier).toHaveAttribute('inert');
  }
}`,...B.parameters?.docs?.source},description:{story:`The tier region holds its space even with nothing to disclose.

A region that appeared only once it had content would pop into the band the
moment a tier verb did — and on a rung whose tier fills with the selection,
that is a row materialising under the pointer that just ticked a checkbox, so
the reader's next click lands one row off. It is the same defect the
register's always-present row prevents, and the register alone cannot prevent
it, because the register overflows *into* this region.

Closed it is \`grid-template-rows: 0fr\`, so holding the space costs no height.
Asserted as structure rather than pixels: the story runner loads no CSS, so a
height assertion here would be a number that is always zero.`,...B.parameters?.docs?.description}}};const z=["Default","SingleAction","AtPanelWidth","StickyInAScroller","DockedInsideAnAnimatedRung","WithExpansion","WithSubRow","Overflows","IconsDropBeforeOverflow","PinnedNeverOverflows","TierHoldsOverflowAndCustomContent","AlignsWithTheRung","WithSelectionRegister","TheRegisterHoldsItsRowWhenEmpty","TheTierHoldsItsSpaceWhenEmpty"];export{C as AlignsWithTheRung,u as AtPanelWidth,p as Default,b as DockedInsideAnAnimatedRung,y as IconsDropBeforeOverflow,w as Overflows,x as PinnedNeverOverflows,h as SingleAction,m as StickyInAScroller,A as TheRegisterHoldsItsRowWhenEmpty,B as TheTierHoldsItsSpaceWhenEmpty,f as TierHoldsOverflowAndCustomContent,g as WithExpansion,k as WithSelectionRegister,v as WithSubRow,z as __namedExportsOrder,O as default};
