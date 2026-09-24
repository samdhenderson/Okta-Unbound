import{e as i,j as e,I as r,a as B,h as A,r as N}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:o,fn:L,userEvent:k,within:W}=__STORYBOOK_MODULE_TEST__,D={title:"Shared/Input",component:i,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"Controlled single-line text field with optional label, hint, size scale, leading/trailing adornments and error state. `onChange` receives the string value, not the event; when `error` is set the field turns red and the message replaces the hint. For multi-line use `Textarea`; for choices use `Select`.\n\nThree sizes (`sm` ≈ 30px, `md` ≈ 38px, `lg` ≈ 46px) and two in-field slots — `icon` and `trailing` — which reserve their padding automatically. A `trailing` node is inert by default; set `trailingInteractive` when it holds a control."}}},argTypes:{value:{description:"Controlled value."},onChange:{description:"Called with the new string value on each change."},placeholder:{description:"Placeholder text shown when empty."},type:{description:"Native input type. Defaults to `text`."},disabled:{description:"Disables the field."},error:{description:"Error message; when set, applies danger styling and hides `hint`."},label:{description:"Optional field label rendered above the input."},ariaLabel:{description:"Accessible name for a field that renders no visible `label`. A `label` is enough on its own — it renders a `<label htmlFor>` bound to the input — so reach for `ariaLabel` only in its absence; supplying both makes `aria-label` win and the spoken name can drift from the text on screen."},hint:{description:"Helper text below the input, shown only when there is no `error`."},fullWidth:{description:"Stretch to fill the container width. Defaults to `true`."},size:{description:"Field height/type scale (`sm` ≈ 30px, `md` ≈ 38px, `lg` ≈ 46px). Defaults to `md`."},icon:{description:"Optional leading icon rendered inside the field; left padding is reserved automatically."},trailing:{description:"Optional node rendered inside the field at its trailing edge (clear button, spinner). Right padding is reserved automatically and scales with `size`."},trailingInteractive:{description:"Set when `trailing` holds something the user clicks. By default the slot is `pointer-events-none` so a decorative adornment cannot swallow clicks aimed at the field."},className:{description:"Extra classes merged onto the outer container."},autoFocus:{description:"Focus the input on mount."},onKeyDown:{description:"Key handler on the input (e.g. Enter to submit, Escape to cancel)."}},args:{value:"",onChange:L(),placeholder:"Enter text…"}},n={},l={args:{value:"Sample text"}},c={args:{label:"Username"},play:async({canvasElement:a})=>{const s=W(a);await o(s.getByLabelText("Username")).toBe(s.getByRole("textbox",{name:"Username"}))}},d={args:{label:"Email address",hint:"Use your company email"}},p={args:{label:"Email address",value:"invalid",error:"Invalid email format"}},m={args:{label:"Locked field",value:"Cannot edit",disabled:!0}},h={args:{label:"Search groups",placeholder:"Type to search…",icon:e.jsx(r,{type:"search",size:"sm"})}},u={args:{type:"email",label:"Email",placeholder:"name@company.com",hint:"We will never share your email"}},g={args:{type:"password",label:"Password",placeholder:"••••••••"}},b={args:{type:"search",label:"Search",placeholder:"Find users…",icon:e.jsx(r,{type:"search",size:"sm"})}},y={args:{label:"City",placeholder:"Type…",fullWidth:!1}},x={render:a=>e.jsxs("div",{className:"flex w-80 flex-col gap-3",children:[e.jsx(i,{...a,size:"sm",ariaLabel:"Small field",placeholder:"sm — 30px"}),e.jsx(i,{...a,size:"md",ariaLabel:"Medium field",placeholder:"md — 38px (default)"}),e.jsx(i,{...a,size:"lg",ariaLabel:"Large field",placeholder:"lg — 46px"})]}),args:{icon:e.jsx(r,{type:"search",size:"sm"})}},v={args:{size:"lg",label:"Search users",placeholder:"Search by email, name, or login…",icon:e.jsx(r,{type:"search",size:"sm"})}},f={args:{size:"sm",label:"Filter",placeholder:"Filter rows…"}},w={args:{label:"Search groups",value:"engineering",trailingInteractive:!0,trailing:e.jsx(B,{label:"Clear search",variant:"ghost",size:"sm",onClick:L(),children:e.jsx(r,{type:"close",size:"sm"})})}},S={args:{size:"lg",label:"Search users",value:"a-very-long-query-that-would-otherwise-run-under-the-clear-button@example.com",icon:e.jsx(r,{type:"search",size:"sm"}),trailingInteractive:!0,trailing:e.jsx(B,{label:"Clear search",variant:"ghost",size:"sm",onClick:L(),children:e.jsx(r,{type:"close",size:"sm"})})}},I={args:{type:"search",label:"Search groups",value:"engineering",icon:e.jsx(r,{type:"search",size:"sm"}),trailingInteractive:!0,trailing:e.jsx(B,{label:"Clear search",variant:"ghost",size:"sm",onClick:L(),children:e.jsx(r,{type:"close",size:"sm"})})}},z={args:{size:"lg",label:"Search users",value:"ada",icon:e.jsx(r,{type:"search",size:"sm"}),trailing:e.jsx(A,{size:"sm"})}},H=()=>{const[a,s]=N.useState("");return e.jsx(i,{ariaLabel:"Search groups",value:a,onChange:s,placeholder:"Type to search…",icon:e.jsx(r,{type:"search",size:"sm"}),trailingInteractive:a!=="",trailing:a?e.jsx(B,{label:"Clear search",variant:"ghost",size:"sm",onClick:()=>s(""),children:e.jsx(r,{type:"close",size:"sm"})}):void 0})},C={render:()=>e.jsx(H,{}),play:async({canvasElement:a})=>{const s=W(a),t=s.getByRole("textbox",{name:"Search groups"});await k.type(t,"engineering"),await o(t).toHaveValue("engineering"),await k.click(s.getByRole("button",{name:"Clear search"})),await o(t).toHaveValue("")}},E={args:{size:"lg",label:"Email address",value:"invalid",error:"Invalid email format",icon:e.jsx(r,{type:"search",size:"sm"})}},T={render:()=>e.jsxs("div",{children:[e.jsx(i,{value:"/api/v1/gr",onChange:L(),ariaLabel:"API path",combobox:{expanded:!0,listboxId:"story-listbox",activeOptionId:"story-option-1"}}),e.jsxs("ul",{id:"story-listbox",role:"listbox","aria-label":"Endpoint suggestions",className:"mt-1 rounded-md border border-neutral-200 bg-white py-1 text-sm",children:[e.jsx("li",{role:"presentation",className:"px-3 py-1 text-xs tracking-wide text-neutral-500",children:"GROUPS"}),e.jsx("li",{id:"story-option-1",role:"option","aria-selected":"true",className:"bg-neutral-100 px-3 py-1.5 font-mono text-neutral-900",children:"/api/v1/groups"}),e.jsx("li",{id:"story-option-2",role:"option","aria-selected":"false",className:"px-3 py-1.5 font-mono text-neutral-900",children:"/api/v1/groups/{groupId}/users"})]})]}),play:async({canvasElement:a})=>{const s=W(a),t=s.getByRole("combobox",{name:"API path"});await o(t).toHaveAttribute("aria-expanded","true"),await o(t).toHaveAttribute("aria-controls","story-listbox"),await o(t).toHaveAttribute("aria-activedescendant","story-option-1"),await o(s.getByRole("listbox",{name:"Endpoint suggestions"})).toBeInTheDocument()}},j={args:{value:"/api/v1/groups",ariaLabel:"API path",combobox:{expanded:!1,listboxId:"closed-listbox"}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"{}",...n.parameters?.docs?.source},description:{story:"Empty input, no label.",...n.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Sample text'
  }
}`,...l.parameters?.docs?.source},description:{story:"With a text value.",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Username'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Username')).toBe(canvas.getByRole('textbox', {
      name: 'Username'
    }));
  }
}`,...c.parameters?.docs?.source},description:{story:"With label — and `label` alone is the whole naming contract.\n\nThe rendered `<label>` is `for`-associated with the input, so the visible text\n*is* the accessible name and `getByLabelText` finds the control. No\n`ariaLabel` here on purpose: an axe sweep passes on either route, so only a\nlabel-text query can tell a real association from a duplicated `aria-label`\npapering over a missing one.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    hint: 'Use your company email'
  }
}`,...d.parameters?.docs?.source},description:{story:"With label and hint text.",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    value: 'invalid',
    error: 'Invalid email format'
  }
}`,...p.parameters?.docs?.source},description:{story:"With error message (replaces hint).",...p.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Locked field',
    value: 'Cannot edit',
    disabled: true
  }
}`,...m.parameters?.docs?.source},description:{story:"Disabled state.",...m.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search groups',
    placeholder: 'Type to search…',
    icon: <Icon type="search" size="sm" />
  }
}`,...h.parameters?.docs?.source},description:{story:"With leading icon.",...h.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'email',
    label: 'Email',
    placeholder: 'name@company.com',
    hint: 'We will never share your email'
  }
}`,...u.parameters?.docs?.source},description:{story:"Email type with label and hint.",...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'password',
    label: 'Password',
    placeholder: '••••••••'
  }
}`,...g.parameters?.docs?.source},description:{story:"Password type with label.",...g.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'search',
    label: 'Search',
    placeholder: 'Find users…',
    icon: <Icon type="search" size="sm" />
  }
}`,...b.parameters?.docs?.source},description:{story:"Search type with icon.",...b.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'City',
    placeholder: 'Type…',
    fullWidth: false
  }
}`,...y.parameters?.docs?.source},description:{story:"Not full width.",...y.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex w-80 flex-col gap-3">
      <Input {...args} size="sm" ariaLabel="Small field" placeholder="sm — 30px" />
      <Input {...args} size="md" ariaLabel="Medium field" placeholder="md — 38px (default)" />
      <Input {...args} size="lg" ariaLabel="Large field" placeholder="lg — 46px" />
    </div>,
  args: {
    icon: <Icon type="search" size="sm" />
  }
}`,...x.parameters?.docs?.source},description:{story:"The three size steps stacked, each with the leading icon so the reserved padding is visible.",...x.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    label: 'Search users',
    placeholder: 'Search by email, name, or login…',
    icon: <Icon type="search" size="sm" />
  }
}`,...v.parameters?.docs?.source},description:{story:"The taller field a search bar uses as the primary control of a view.",...v.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm',
    label: 'Filter',
    placeholder: 'Filter rows…'
  }
}`,...f.parameters?.docs?.source},description:{story:'Compact field for a dense toolbar row; lines up with `Button size="sm"`.',...f.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Search groups',
    value: 'engineering',
    trailingInteractive: true,
    trailing: <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
  }
}`,...w.parameters?.docs?.source},description:{story:"Trailing slot holding a clear button — needs `trailingInteractive` to be clickable.",...w.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    label: 'Search users',
    value: 'a-very-long-query-that-would-otherwise-run-under-the-clear-button@example.com',
    icon: <Icon type="search" size="sm" />,
    trailingInteractive: true,
    trailing: <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
  }
}`,...S.parameters?.docs?.source},description:{story:"Both slots at once: leading glyph plus a trailing clear button.",...S.parameters?.docs?.description}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'search',
    label: 'Search groups',
    value: 'engineering',
    icon: <Icon type="search" size="sm" />,
    trailingInteractive: true,
    trailing: <IconButton label="Clear search" variant="ghost" size="sm" onClick={fn()}>
        <Icon type="close" size="sm" />
      </IconButton>
  }
}`,...I.parameters?.docs?.source},description:{story:'`type="search"` with a custom trailing clear button. The field suppresses\nthe browser\'s own WebKit cancel-button (`::-webkit-search-cancel-button`)\nso only this one clear affordance renders — without the suppression,\nChrome would paint its native × next to this one.',...I.parameters?.docs?.description}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    label: 'Search users',
    value: 'ada',
    icon: <Icon type="search" size="sm" />,
    trailing: <LoadingSpinner size="sm" />
  }
}`,...z.parameters?.docs?.source},description:{story:"Search in flight: a decorative trailing spinner, left inert so clicks reach the field.",...z.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <InputHarness />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', {
      name: 'Search groups'
    });
    await userEvent.type(field, 'engineering');
    await expect(field).toHaveValue('engineering');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear search'
    }));
    await expect(field).toHaveValue('');
  }
}`,...C.parameters?.docs?.source},description:{story:"Typing updates the controlled value, and the trailing clear button empties it.",...C.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg',
    label: 'Email address',
    value: 'invalid',
    error: 'Invalid email format',
    icon: <Icon type="search" size="sm" />
  }
}`,...E.parameters?.docs?.source},description:{story:"Error state at a non-default size.",...E.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <Input value="/api/v1/gr" onChange={fn()} ariaLabel="API path" combobox={{
      expanded: true,
      listboxId: 'story-listbox',
      activeOptionId: 'story-option-1'
    }} />
      <ul id="story-listbox" role="listbox" aria-label="Endpoint suggestions" className="mt-1 rounded-md border border-neutral-200 bg-white py-1 text-sm">
        <li role="presentation" className="px-3 py-1 text-xs tracking-wide text-neutral-500">
          GROUPS
        </li>
        <li id="story-option-1" role="option" aria-selected="true" className="bg-neutral-100 px-3 py-1.5 font-mono text-neutral-900">
          /api/v1/groups
        </li>
        <li id="story-option-2" role="option" aria-selected="false" className="px-3 py-1.5 font-mono text-neutral-900">
          /api/v1/groups/&#123;groupId&#125;/users
        </li>
      </ul>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    await expect(field).toHaveAttribute('aria-controls', 'story-listbox');
    await expect(field).toHaveAttribute('aria-activedescendant', 'story-option-1');
    // \`aria-controls\` must resolve, or the field expands into nothing.
    await expect(canvas.getByRole('listbox', {
      name: 'Endpoint suggestions'
    })).toBeInTheDocument();
  }
}`,...T.parameters?.docs?.source},description:{story:`Combobox mode: the field owns a listbox the consumer renders beneath it, and
points at the active option rather than focusing it — so the caret, and the
text selection the suggestions are derived from, survive every arrow press.

The listbox here is a stub. \`Input\` never renders one; its position, height
and contents are the consumer's call.`,...T.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    value: '/api/v1/groups',
    ariaLabel: 'API path',
    combobox: {
      expanded: false,
      listboxId: 'closed-listbox'
    }
  }
}`,...j.parameters?.docs?.source},description:{story:"Collapsed: the same field with nothing to show.",...j.parameters?.docs?.description}}};const F=["Default","WithValue","WithLabel","WithHint","ErrorState","Disabled","WithIcon","EmailType","PasswordType","SearchType","NotFullWidth","Sizes","Large","Small","WithTrailing","WithIconAndTrailing","SearchWithClear","Searching","Typing","ErrorStateLarge","Combobox","ComboboxClosed"];export{T as Combobox,j as ComboboxClosed,n as Default,m as Disabled,u as EmailType,p as ErrorState,E as ErrorStateLarge,v as Large,y as NotFullWidth,g as PasswordType,b as SearchType,I as SearchWithClear,z as Searching,x as Sizes,f as Small,C as Typing,d as WithHint,h as WithIcon,S as WithIconAndTrailing,c as WithLabel,w as WithTrailing,l as WithValue,F as __namedExportsOrder,D as default};
