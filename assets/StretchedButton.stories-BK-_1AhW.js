import{s as g,j as e,g as x,a as w,I as y}from"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,fn:u,userEvent:i,waitFor:k,within:v}=__STORYBOOK_MODULE_TEST__,E={title:"Shared/StretchedButton",component:g,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'The "stretched link" pattern as a real `<button>`: an empty, absolutely-positioned button covering its positioned ancestor, so clicking anywhere on a card activates it without a `role="button"` div or a card wrapped in a button.\n\n**Layout contract:** the click target must be `relative`, and the card’s own controls `relative z-10` or they sit under the overlay. Every card in a list shares one label, so pass `describedBy` pointing at the element that names this card.'}}},argTypes:{label:{description:"Accessible name — required, since the button has no visible content."},onClick:{description:"Activation handler."},describedBy:{description:"`id` of the element that names this specific card (usually its title)."},title:{description:"Tooltip text; defaults to `label`."},disabled:{description:"Disables activation."},checked:{description:'Makes the overlay one choice in a set: `role="radio"` with this as `aria-checked`. Omit for a card that navigates.'},className:{description:"Extra classes merged after the base positioning classes."},onIntent:{description:"Called once when a pointer rests on the card, or focus lands on it, for the intent dwell; leaving first cancels it. For prefetching what `onClick` opens."}},args:{label:"View group details",onClick:u()}},t={render:n=>e.jsxs("div",{className:"relative w-80 rounded-md border border-neutral-200 bg-white px-3 py-2",children:[e.jsx(g,{...n,describedBy:"stretched-demo-name"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"relative z-10",children:e.jsx(x,{checked:!1,onChange:u(),"aria-label":"Select Engineering"})}),e.jsx("h3",{id:"stretched-demo-name",className:"text-sm font-semibold text-neutral-900",children:"Engineering"}),e.jsx("span",{className:"relative z-10 ml-auto",children:e.jsx(w,{label:"Expand",size:"sm",children:e.jsx(y,{type:"chevron-right",size:"sm"})})})]}),e.jsx("p",{className:"mt-0.5 text-xs text-neutral-600",children:"Click anywhere on the card — except the two controls — to activate."})]})},c={...t,parameters:{pseudo:{focusVisible:!0}}},d={...t,args:{disabled:!0}},l={...t,parameters:{pseudo:{active:!0}}},p={...t,play:async({canvasElement:n,args:a})=>{const r=v(n);await i.click(r.getByRole("checkbox",{name:"Select Engineering"})),await s(a.onClick).not.toHaveBeenCalled(),await i.click(r.getByRole("button",{name:"View group details"})),await s(a.onClick).toHaveBeenCalledTimes(1)}},h={args:{label:"Keep",onClick:u()},render:n=>e.jsx("div",{role:"radiogroup","aria-label":"Rule to keep",className:"w-80 space-y-2",children:[{id:"a",name:"Engineering - US",checked:!0},{id:"b",name:"Engineering - EU",checked:!1}].map(a=>e.jsxs("div",{className:`relative flex items-center justify-between rounded-md border px-3 py-2 ${a.checked?"border-primary bg-primary-light":"border-neutral-200 bg-white"}`,children:[e.jsx(g,{...n,label:`Keep ${a.name}`,checked:a.checked,describedBy:`choice-${a.id}`}),e.jsx("span",{id:`choice-${a.id}`,className:"text-sm text-neutral-900",children:a.name}),e.jsx("div",{className:"relative z-10",children:e.jsx(w,{label:`View ${a.name}`,variant:"ghost",size:"sm",children:e.jsx(y,{type:"chevron-right",size:"sm"})})})]},a.id))}),play:async({canvasElement:n,args:a})=>{const r=v(n),o=r.getByRole("radio",{name:"Keep Engineering - US"}),b=r.getByRole("radio",{name:"Keep Engineering - EU"});await s(o).toBeChecked(),await s(b).not.toBeChecked(),await i.click(b),await s(a.onClick).toHaveBeenCalledTimes(1)}},m={...t,args:{onIntent:u()},play:async({canvasElement:n,args:a})=>{const o=v(n).getByRole("button",{name:"View group details"});await i.hover(o),await i.unhover(o),await s(a.onIntent).not.toHaveBeenCalled(),await i.hover(o),await k(()=>s(a.onIntent).toHaveBeenCalledTimes(1))}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: args => <div className="relative w-80 rounded-md border border-neutral-200 bg-white px-3 py-2">
      <StretchedButton {...args} describedBy="stretched-demo-name" />
      <div className="flex items-center gap-2">
        <span className="relative z-10">
          <Checkbox checked={false} onChange={fn()} aria-label="Select Engineering" />
        </span>
        <h3 id="stretched-demo-name" className="text-sm font-semibold text-neutral-900">
          Engineering
        </h3>
        <span className="relative z-10 ml-auto">
          <IconButton label="Expand" size="sm">
            <Icon type="chevron-right" size="sm" />
          </IconButton>
        </span>
      </div>
      <p className="mt-0.5 text-xs text-neutral-600">
        Click anywhere on the card — except the two controls — to activate.
      </p>
    </div>
}`,...t.parameters?.docs?.source},description:{story:`On its own the button is invisible, so it is only meaningful in context: this
is the group-row shape it was built for — a checkbox and an icon button lifted
above the overlay, with everything else plain content.`,...t.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  ...Default,
  parameters: {
    pseudo: {
      focusVisible: true
    }
  }
}`,...c.parameters?.docs?.source},description:{story:`Focus-visible state (forced via the pseudo-states addon): the overlay draws its
focus ring around the whole card, so a keyboard user can see what they are on.`,...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    disabled: true
  }
}`,...d.parameters?.docs?.source},description:{story:"Disabled — the card is inert, but its own controls still work.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  ...Default,
  parameters: {
    pseudo: {
      active: true
    }
  }
}`,...l.parameters?.docs?.source},description:{story:"Pressed state (forced via the pseudo-states addon): the overlay paints nothing at rest,\nso `:active` washes the whole card rather than using the `.press` transform, which on an\ninvisible box would be a no-op.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  ...Default,
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', {
      name: 'Select Engineering'
    }));
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', {
      name: 'View group details'
    }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  }
}`,...p.parameters?.docs?.source},description:{story:`The overlay takes the click for the card, and the controls lifted above it keep their
own: ticking the checkbox never activates the row.`,...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Keep',
    onClick: fn()
  },
  render: args => <div role="radiogroup" aria-label="Rule to keep" className="w-80 space-y-2">
      {[{
      id: 'a',
      name: 'Engineering - US',
      checked: true
    }, {
      id: 'b',
      name: 'Engineering - EU',
      checked: false
    }].map(rule => <div key={rule.id} className={\`relative flex items-center justify-between rounded-md border px-3 py-2 \${rule.checked ? 'border-primary bg-primary-light' : 'border-neutral-200 bg-white'}\`}>
          <StretchedButton {...args} label={\`Keep \${rule.name}\`} checked={rule.checked} describedBy={\`choice-\${rule.id}\`} />
          <span id={\`choice-\${rule.id}\`} className="text-sm text-neutral-900">
            {rule.name}
          </span>
          <div className="relative z-10">
            <IconButton label={\`View \${rule.name}\`} variant="ghost" size="sm">
              <Icon type="chevron-right" size="sm" />
            </IconButton>
          </div>
        </div>)}
    </div>,
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    // A name per choice, not one shared label: a description is not a name.
    const first = canvas.getByRole('radio', {
      name: 'Keep Engineering - US'
    });
    const second = canvas.getByRole('radio', {
      name: 'Keep Engineering - EU'
    });
    await expect(first).toBeChecked();
    await expect(second).not.toBeChecked();
    await userEvent.click(second);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  }
}`,...h.parameters?.docs?.source},description:{story:"The card as one **choice** in a set — the shape the Duplicates rung uses to\npick the kept rule. The overlay is a `radio` inside a `radiogroup`, and the\ncard's own **View** stays a separate control above it.",...h.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  ...Default,
  args: {
    onIntent: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('button', {
      name: 'View group details'
    });

    // Passing over: in and straight out again, inside the dwell.
    await userEvent.hover(card);
    await userEvent.unhover(card);
    await expect(args.onIntent).not.toHaveBeenCalled();

    // Resting: the dwell elapses and intent is read, once.
    await userEvent.hover(card);
    await waitFor(() => expect(args.onIntent).toHaveBeenCalledTimes(1));
  }
}`,...m.parameters?.docs?.source},description:{story:"Reading intent: a pointer resting on the card — or focus landing on it — calls\n`onIntent` once after a short dwell, so what the click opens can already be\nloading. A pointer that only passes over the card asks for nothing.",...m.parameters?.docs?.description}}};const C=["Default","Focus","Disabled","Pressed","ActivatingTheCard","AsAChoice","ReadingIntent"];export{p as ActivatingTheCard,h as AsAChoice,t as Default,d as Disabled,c as Focus,l as Pressed,m as ReadingIntent,C as __namedExportsOrder,E as default};
