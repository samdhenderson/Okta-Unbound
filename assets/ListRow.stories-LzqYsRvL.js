import{L as s,j as e,B as v}from"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,fn:f,userEvent:x,within:w}=__STORYBOOK_MODULE_TEST__,B={title:"Shared/ListRow",component:s,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:'The chrome every list row shares: radius, resting border, hover border and transition are fixed with no prop to change them, and only `density`, `state`, `tone`, `flash`, `body` and `as` are exposed. The interior belongs to the feature and follows the typography contract in `docs/design-system.md`.\n\nPrefer `StretchedButton` over `as="button"` when the row contains its own controls — a button cannot legally contain a checkbox or another button.'}}},argTypes:{children:{description:"The row's content, owned by the feature."},density:{description:"Content density: `compact` resolves the row spacing role, `comfortable` the card role."},state:{description:"Resting appearance: `default`, `selected`, or `highlighted`."},tone:{description:"A staged change: `added` (success fill) or `removed` (danger fill, the `data-row-primary` element struck through). Overrides `state`’s paint."},flash:{description:"One-shot success confirmation via `animate-affirm-flash`."},as:{description:"Element to render: `div`, `li`, `a`, or `button`."},onClick:{description:"Activation handler; supplying it makes the row interactive."},href:{description:'`href` for `as="a"`.'},target:{description:'Link target; `_blank` also sets `rel="noopener noreferrer"`.'},ariaLabel:{description:"Accessible name when the content does not supply one."},describedBy:{description:"`id` of the element describing this row."},dataAttributes:{description:"Row-identity attributes (`data-group-id`, …)."},className:{description:"Extra classes — layout only, never colour."},testId:{description:"Test id applied to the row element."}},args:{children:null}},a=({title:t="Engineering",meta:r="Okta group · 248 members"})=>e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{className:"truncate text-sm font-semibold text-neutral-900",children:t}),e.jsx("div",{className:"mt-0.5 truncate text-xs text-neutral-600",children:r})]}),e.jsx("span",{className:"shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600",children:"Active"})]}),o={args:{children:e.jsx(a,{})}},i={args:{children:null},render:()=>e.jsxs("div",{className:"space-y-3",children:[e.jsx(s,{density:"compact",children:e.jsx(a,{title:"compact — py-(--sp-row-y) px-(--sp-row-x)",meta:"Dense scanning list"})}),e.jsx(s,{density:"comfortable",children:e.jsx(a,{title:"comfortable — p-(--sp-card)",meta:"Rich card with badges and a meta line"})})]})},d={args:{children:null},render:()=>e.jsxs("div",{className:"space-y-3",children:[e.jsx(s,{state:"default",children:e.jsx(a,{title:"default",meta:"Resting"})}),e.jsx(s,{state:"selected",children:e.jsx(a,{title:"selected",meta:"A user choice — persists"})}),e.jsx(s,{state:"highlighted",children:e.jsx(a,{title:"highlighted",meta:"A deep-link target — transient"})})]})},c={args:{children:null,onClick:f()},render:t=>e.jsxs("div",{className:"space-y-3",children:[e.jsx(s,{as:"button",onClick:t.onClick,ariaLabel:"Open Engineering",children:e.jsx(a,{title:'as="button"',meta:"Whole row activates — keyboard reachable"})}),e.jsx(s,{as:"a",href:"#list-row-demo",target:"_blank",children:e.jsx(a,{title:'as="a"',meta:"Real navigation — rel is set automatically"})})]}),play:async({args:t,canvasElement:r})=>{const y=w(r).getByRole("button",{name:"Open Engineering"});await x.click(y),await n(t.onClick).toHaveBeenCalledTimes(1),y.focus(),await n(y).toHaveFocus(),await x.keyboard("{Enter}"),await n(t.onClick).toHaveBeenCalledTimes(2)}},l={args:{children:e.jsx(a,{title:"Pressed",meta:"scale(.995) — subtle, for a wide target"})},render:t=>e.jsx(s,{...t,as:"button",onClick:()=>{},ariaLabel:"Open Engineering"}),parameters:{pseudo:{active:!0}}},p={args:{children:e.jsx(a,{title:"Engineering",meta:"Pressed: a second press undoes it"})},render:t=>e.jsx(s,{...t,as:"button",onClick:()=>{},ariaPressed:!0,state:"selected"}),play:async({canvasElement:t})=>{await n(w(t).getByRole("button")).toHaveAttribute("aria-pressed","true")}},m={args:{children:null},render:()=>e.jsx("ul",{className:"space-y-3",children:["Engineering","Design","Support"].map(t=>e.jsx(s,{as:"li",density:"compact",children:e.jsx(a,{title:t,meta:"Okta group"})},t))})},h={args:{children:null},render:()=>e.jsx(s,{body:e.jsx("div",{className:"disclose","data-open":"true",children:e.jsx("div",{className:"border-t border-neutral-200 bg-neutral-50 px-4 py-3",children:e.jsx("p",{className:"text-xs text-neutral-600",children:"Body content sets its own padding and can carry its own background — the header above keeps the density padding."})})}),children:e.jsx(a,{title:"Expandable row",meta:"Header keeps p-4; body sets its own"})})},u={args:{flash:!0,children:e.jsx(a,{title:"Just added",meta:"animate-affirm-flash"})}},b=({name:t,change:r})=>e.jsxs("div",{className:"flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("div",{"data-row-primary":!0,className:"truncate text-sm font-semibold text-neutral-900",children:t}),e.jsx("div",{className:"mt-0.5 truncate text-xs text-neutral-700",children:r==="Added"?"Everyone this rule matches will be added to this group.":"People this rule added to this group are removed from it."})]}),e.jsx(v,{variant:r==="Added"?"success":"danger",children:r})]}),g={args:{children:null},render:()=>e.jsxs("ul",{className:"space-y-3",children:[e.jsxs(s,{as:"li",density:"compact",children:[e.jsx("div",{className:"text-sm font-semibold text-neutral-900",children:"Engineering"}),e.jsx("div",{className:"mt-0.5 text-xs text-neutral-600",children:"248 members"})]}),e.jsx(s,{as:"li",density:"compact",tone:"added",children:e.jsx(b,{name:"Engineering Managers",change:"Added"})}),e.jsx(s,{as:"li",density:"compact",tone:"removed",children:e.jsx(b,{name:"Contractors",change:"Removed"})})]}),play:async({canvasElement:t})=>{const r=w(t);await n(r.getByText("Added")).toBeInTheDocument(),await n(r.getByText("Removed")).toBeInTheDocument(),await n(r.getByText("Contractors")).toBeInTheDocument()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: <RowBody />
  }
}`,...o.parameters?.docs?.source},description:{story:"The default: comfortable padding, resting state.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <div className="space-y-3">
      <ListRow density="compact">
        <RowBody title="compact — py-(--sp-row-y) px-(--sp-row-x)" meta="Dense scanning list" />
      </ListRow>
      <ListRow density="comfortable">
        <RowBody title="comfortable — p-(--sp-card)" meta="Rich card with badges and a meta line" />
      </ListRow>
    </div>
}`,...i.parameters?.docs?.source},description:{story:"Both densities side by side; each resolves a `--sp-*` role, so the gap holds at every width.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <div className="space-y-3">
      <ListRow state="default">
        <RowBody title="default" meta="Resting" />
      </ListRow>
      <ListRow state="selected">
        <RowBody title="selected" meta="A user choice — persists" />
      </ListRow>
      <ListRow state="highlighted">
        <RowBody title="highlighted" meta="A deep-link target — transient" />
      </ListRow>
    </div>
}`,...d.parameters?.docs?.source},description:{story:"All three resting states: `selected` persists, `highlighted` is a transient deep-link target.",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: null,
    onClick: fn()
  },
  render: args => <div className="space-y-3">
      <ListRow as="button" onClick={args.onClick} ariaLabel="Open Engineering">
        <RowBody title='as="button"' meta="Whole row activates — keyboard reachable" />
      </ListRow>
      <ListRow as="a" href="#list-row-demo" target="_blank">
        <RowBody title='as="a"' meta="Real navigation — rel is set automatically" />
      </ListRow>
    </div>,
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', {
      name: 'Open Engineering'
    });
    await userEvent.click(row);
    await expect(args.onClick).toHaveBeenCalledTimes(1);

    // The keyboard path a bare \`<div onClick>\` never had.
    row.focus();
    await expect(row).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  }
}`,...c.parameters?.docs?.source},description:{story:"Interactive rows: a whole-row button and a real link, both keyboard reachable.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: <RowBody title="Pressed" meta="scale(.995) — subtle, for a wide target" />
  },
  render: args => <ListRow {...args} as="button" onClick={() => {}} ariaLabel="Open Engineering" />,
  parameters: {
    pseudo: {
      active: true
    }
  }
}`,...l.parameters?.docs?.source},description:{story:"Pressed state, forced via the pseudo-states addon: `.press-subtle`'s `scale(.995)` depress.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    children: <RowBody title="Engineering" meta="Pressed: a second press undoes it" />
  },
  render: args => <ListRow {...args} as="button" onClick={() => {}} ariaPressed state="selected" />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  }
}`,...p.parameters?.docs?.source},description:{story:'A toggle row: `ariaPressed` reports what `state="selected"` paints.',...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <ul className="space-y-3">
      {['Engineering', 'Design', 'Support'].map(name => <ListRow key={name} as="li" density="compact">
          <RowBody title={name} meta="Okta group" />
        </ListRow>)}
    </ul>
}`,...m.parameters?.docs?.source},description:{story:'Inside a `<ul>` as `as="li"`, using the `space-y-3` separator pattern.',...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <ListRow body={<div className="disclose" data-open="true">
          <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-600">
              Body content sets its own padding and can carry its own background — the header above
              keeps the density padding.
            </p>
          </div>
        </div>}>
      <RowBody title="Expandable row" meta="Header keeps p-4; body sets its own" />
    </ListRow>
}`,...h.parameters?.docs?.source},description:{story:"An expandable row via the `body` slot: the header keeps the density padding, the\nbody sets its own, and the card clips so a `.disclose` body cannot escape the radius.",...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    flash: true,
    children: <RowBody title="Just added" meta="animate-affirm-flash" />
  }
}`,...u.parameters?.docs?.source},description:{story:"A one-shot success confirmation on a row that was just added or changed.",...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    children: null
  },
  render: () => <ul className="space-y-3">
      <ListRow as="li" density="compact">
        <div className="text-sm font-semibold text-neutral-900">Engineering</div>
        <div className="mt-0.5 text-xs text-neutral-600">248 members</div>
      </ListRow>
      <ListRow as="li" density="compact" tone="added">
        <StagedBody name="Engineering Managers" change="Added" />
      </ListRow>
      <ListRow as="li" density="compact" tone="removed">
        <StagedBody name="Contractors" change="Removed" />
      </ListRow>
    </ul>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The change is spoken, not only painted.
    await expect(canvas.getByText('Added')).toBeInTheDocument();
    await expect(canvas.getByText('Removed')).toBeInTheDocument();
    await expect(canvas.getByText('Contractors')).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:`A staged change, as the target-groups editor, the merge confirm and the move
confirm draw it: a kept row at rest, an added row in success, a removed row in
danger with its name struck through. The strikethrough is paint, so each
changed row also says its change in a badge.`,...g.parameters?.docs?.description}}};const L=["Default","Densities","States","Interactive","Pressed","Toggle","InAList","Expandable","Flash","Tones"];export{o as Default,i as Densities,h as Expandable,u as Flash,m as InAList,c as Interactive,l as Pressed,d as States,p as Toggle,g as Tones,L as __namedExportsOrder,B as default};
