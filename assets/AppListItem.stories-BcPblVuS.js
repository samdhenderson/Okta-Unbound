import{j as f}from"./iframe-mmN7AxbW.js";import{A as S}from"./AppListItem-B-91ahfe.js";import"./preload-helper-PPVm8Dsz.js";import"./revealOnHover-DU3PDCIu.js";import"./useEntityQuery-D7Ia1EpU.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./dateFormat-C9yVDsck.js";import"./appFilters-CTS9Q_fJ.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:a,fn:x,userEvent:o,waitFor:s,within:v}=__STORYBOOK_MODULE_TEST__,r={id:"0oaFAKE0001",name:"salesforce",label:"Salesforce",status:"ACTIVE",signOnMode:"SAML_2_0",created:"2026-01-15T09:00:00.000Z",lastUpdated:"2026-06-02T11:30:00.000Z"},L={title:"Apps/AppListItem",component:S,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`Collapsed it shows the display label, status badge, sign-on mode, app key and created date. Expanding reveals the ids and dates, an "Open in Okta" deep link built from the validated org origin, and the app's assignment counts — fetched only once the row is open, then cached by app id.`}}},argTypes:{app:{description:"The app to render."},oktaOrigin:{description:'Okta org origin, enabling the "Open in Okta" deep link when present.'},fetchAssignmentCounts:{description:"Loads this app's assignment counts; called only once the row is expanded. Must be stable."},selected:{description:"Whether this app is in the selection basket; a ticked row paints ListRow's selected state."},onToggleSelect:{description:"Tick or untick this app. Omitted ⇒ no checkbox renders at all."}},args:{app:r,oktaOrigin:"https://example.okta.com",fetchAssignmentCounts:x(async()=>({users:128,groups:4}))}},c={},i={play:async({canvasElement:t})=>{const e=v(t);await o.click(e.getByRole("button",{name:"Expand Salesforce"})),await s(()=>a(e.getByRole("button",{name:`Copy application id for Salesforce (${r.id})`})).toBeInTheDocument()),await s(()=>a(e.getByText("128 users")).toBeInTheDocument())}},l={render:t=>f.jsxs("div",{className:"space-y-2",children:[f.jsx(S,{...t,app:{...r,id:"0oaFAKE0001"}}),f.jsx(S,{...t,app:{...r,id:"0oaFAKE0099"}})]}),play:async({canvasElement:t})=>{const e=v(t),n=e.getAllByRole("button",{name:"Expand Salesforce"});a(n).toHaveLength(2),await o.click(n[0]),await o.click(n[1]),await s(()=>a(e.getByRole("button",{name:"Copy application id for Salesforce (0oaFAKE0001)"})).toBeInTheDocument()),await a(e.getByRole("button",{name:"Copy application id for Salesforce (0oaFAKE0099)"})).toBeInTheDocument()}},p={args:{app:{id:"0oaFAKE0002",name:"workday",label:"Workday HR",status:"INACTIVE",signOnMode:"SAML_2_0",created:"2026-03-01T09:00:00.000Z"}}},d={args:{app:{id:"0oaFAKE0009"}}},u={args:{oktaOrigin:void 0}},m={args:{app:{...r,id:"0oaFAKE0011"},fetchAssignmentCounts:x(async()=>null)}},g={play:async({canvasElement:t})=>{const e=v(t);await o.click(e.getByRole("button",{name:"Show details"})),await s(()=>a(e.getByRole("button",{name:"Collapse Salesforce"})).toHaveAttribute("aria-expanded","true")),await a(e.getByRole("button",{name:"Hide details"})).toBeInTheDocument()}},h={play:async({canvasElement:t})=>{const e=v(t),n=e.getByRole("button",{name:"Show details"});await a(n).not.toHaveAttribute("aria-expanded"),n.focus(),await a(n).toHaveFocus(),await o.keyboard("{Enter}"),await s(()=>a(e.getByRole("button",{name:"Collapse Salesforce"})).toHaveAttribute("aria-expanded","true")),await s(()=>a(e.getByText("128 users")).toBeInTheDocument())}},y={play:async({canvasElement:t})=>{const e=v(t);e.getByRole("button",{name:"Show details"}).focus(),await o.keyboard(" "),await s(()=>a(e.getByRole("button",{name:"Collapse Salesforce"})).toHaveAttribute("aria-expanded","true")),e.getByRole("button",{name:"Hide details"}).focus(),await o.keyboard(" "),await s(()=>a(e.getByRole("button",{name:"Expand Salesforce"})).toHaveAttribute("aria-expanded","false"))}},w={args:{onToggleSelect:x()},play:async({args:t,canvas:e})=>{const n=e.getByRole("checkbox",{name:"Select Salesforce"});await a(n).not.toBeChecked(),await o.click(n),await a(t.onToggleSelect).toHaveBeenCalledWith(r.id),await a(e.getByRole("button",{name:"Expand Salesforce"})).toHaveAttribute("aria-expanded","false")}},b={args:{onToggleSelect:x(),selected:!0},play:async({canvas:t})=>{await a(t.getByRole("checkbox",{name:"Select Salesforce"})).toBeChecked()}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source},description:{story:"An active SAML app with a full set of metadata.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Expand Salesforce'
    }));
    await waitFor(() => expect(canvas.getByRole('button', {
      name: \`Copy application id for Salesforce (\${salesforce.id})\`
    })).toBeInTheDocument());
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  }
}`,...i.parameters?.docs?.source},description:{story:"Expanded — the detail grid, the copyable id, and the lazily-fetched assignment counts.",...i.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="space-y-2">
      <AppListItem {...args} app={{
      ...salesforce,
      id: '0oaFAKE0001'
    }} />
      <AppListItem {...args} app={{
      ...salesforce,
      id: '0oaFAKE0099'
    }} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggles = canvas.getAllByRole('button', {
      name: 'Expand Salesforce'
    });
    expect(toggles).toHaveLength(2);
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);
    await waitFor(() => expect(canvas.getByRole('button', {
      name: 'Copy application id for Salesforce (0oaFAKE0001)'
    })).toBeInTheDocument());
    await expect(canvas.getByRole('button', {
      name: 'Copy application id for Salesforce (0oaFAKE0099)'
    })).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"Two app instances sharing a display label: the copy control folds the id into its accessible name, so they stay distinguishable.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      id: '0oaFAKE0002',
      name: 'workday',
      label: 'Workday HR',
      status: 'INACTIVE',
      signOnMode: 'SAML_2_0',
      created: '2026-03-01T09:00:00.000Z'
    } as OktaAppListItem
  }
}`,...p.parameters?.docs?.source},description:{story:"An inactive app — neutral status badge.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      id: '0oaFAKE0009'
    } as OktaAppListItem
  }
}`,...d.parameters?.docs?.source},description:{story:"A lenient row where Okta returned only the id — the label falls back to it.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    oktaOrigin: undefined
  }
}`,...u.parameters?.docs?.source},description:{story:'No org origin known yet — the "Open in Okta" link hides itself.',...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      ...salesforce,
      id: '0oaFAKE0011'
    } as OktaAppListItem,
    fetchAssignmentCounts: fn(async (): Promise<AppAssignmentCounts | null> => null)
  }
}`,...m.parameters?.docs?.source},description:{story:"Assignment counts are unavailable (the count walk failed).",...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Show details'
    }));
    await waitFor(() => expect(canvas.getByRole('button', {
      name: 'Collapse Salesforce'
    })).toHaveAttribute('aria-expanded', 'true'));
    await expect(canvas.getByRole('button', {
      name: 'Hide details'
    })).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"Clicking anywhere in the header toggles the row, not just the trailing\n`IconButton`. The overlay's accessible name is the shorter `Show details`, so\nthe two controls do not announce as one message doubled.",...g.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByRole('button', {
      name: 'Show details'
    });
    await expect(header).not.toHaveAttribute('aria-expanded');
    header.focus();
    await expect(header).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getByRole('button', {
      name: 'Collapse Salesforce'
    })).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(canvas.getByText('128 users')).toBeInTheDocument());
  }
}`,...h.parameters?.docs?.source},description:{story:"The keyboard path the header used to lack: tabbing reaches the header overlay\nand Enter expands the row. Only the trailing `IconButton` carries\n`aria-expanded`, so exactly one control announces the disclosure state.",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', {
      name: 'Show details'
    }).focus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(canvas.getByRole('button', {
      name: 'Collapse Salesforce'
    })).toHaveAttribute('aria-expanded', 'true'));
    canvas.getByRole('button', {
      name: 'Hide details'
    }).focus();
    await userEvent.keyboard(' ');
    await waitFor(() => expect(canvas.getByRole('button', {
      name: 'Expand Salesforce'
    })).toHaveAttribute('aria-expanded', 'false'));
  }
}`,...y.parameters?.docs?.source},description:{story:"Space activates the header overlay too, and a second press collapses it — the\ntrailing `IconButton` follows the same state back to `false`.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    onToggleSelect: fn()
  },
  play: async ({
    args,
    canvas
  }) => {
    const box = canvas.getByRole('checkbox', {
      name: 'Select Salesforce'
    });
    await expect(box).not.toBeChecked();
    await userEvent.click(box);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(salesforce.id);
    // Ticking is not expanding: the checkbox sits above the header overlay.
    await expect(canvas.getByRole('button', {
      name: 'Expand Salesforce'
    })).toHaveAttribute('aria-expanded', 'false');
  }
}`,...w.parameters?.docs?.source},description:{story:"The checkbox needs the overlay's `relative z-10` escape hatch, since the\nheader is a `StretchedButton`: without it the checkbox would sit under the\noverlay and clicking it would expand the row instead of ticking it. The name\nsays which app (`Select Salesforce`).",...w.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    onToggleSelect: fn(),
    selected: true
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByRole('checkbox', {
      name: 'Select Salesforce'
    })).toBeChecked();
  }
}`,...b.parameters?.docs?.source},description:{story:"Ticked. The checkbox is drawn unconditionally — `REVEAL_ON_HOVER` exempts an\nactive control, or a selection would vanish while scrolling — and the card\ntakes `ListRow`'s `selected` state.",...b.parameters?.docs?.description}}};const D=["Default","Expanded","DuplicateLabelsStayDistinguishable","Inactive","MinimalFields","NoOktaOrigin","AssignmentCountsUnavailable","HeaderClickToggles","KeyboardExpandsTheHeader","SpaceCollapsesAgain","Selectable","Selected"];export{m as AssignmentCountsUnavailable,c as Default,l as DuplicateLabelsStayDistinguishable,i as Expanded,g as HeaderClickToggles,p as Inactive,h as KeyboardExpandsTheHeader,d as MinimalFields,u as NoOktaOrigin,w as Selectable,b as Selected,y as SpaceCollapsesAgain,D as __namedExportsOrder,L as default};
