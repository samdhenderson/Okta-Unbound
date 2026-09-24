import{X as u,j as n,r as m,e as w}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:t,fn:y,userEvent:h,within:i}=__STORYBOOK_MODULE_TEST__,S={title:"Shared/FilterToggle",component:u,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:'Opens and closes a filter panel and carries a count badge of the currently active filters. It takes the active wash both when the panel is expanded and when any filter is applied with the panel closed, so a hidden filter shortening the list below stays visible. The badge is hidden at zero.\n\nIt is icon-only: the funnel says "filters", so the word beside it said it twice and spent width the `flex-1` search field next to it needs at 360px. The name reaches assistive tech through `aria-label` (`Filters`, `Filters, 2 applied`), and because a wash alone may not carry state, the native `title` says which way the press goes — `Show filters` or `Hide filters`. The box is a fixed square sized from that field (38px beside an `Input size="md"`, 46px beside `lg`) and the badge sits in its corner, out of flow — so applying a filter can neither widen the button into the field beside it nor pull the glyph off centre.'}}},argTypes:{open:{description:"Whether the filter panel is expanded."},activeCount:{description:"Number of filters applied. The badge is hidden at 0."},onToggle:{description:"Toggles the filter panel open/closed."},size:{description:"Vertical scale, matching the `Input` it stands beside."},label:{description:"Accessible name; not rendered as text. Defaults to `Filters`."},title:{description:"Native tooltip. Defaults to `Show filters` / `Hide filters` from `open`."},controls:{description:"Id of the disclosed region; supplying it swaps `aria-pressed` for `aria-expanded`."}},args:{open:!1,activeCount:0,onToggle:y()}},o={play:async({canvasElement:a})=>{const s=i(a),e=s.getByRole("button",{name:"Filters"});await t(e).toHaveAttribute("title","Show filters"),await t(e).toHaveAttribute("aria-pressed","false"),await t(s.queryByText("Filters")).not.toBeInTheDocument(),await t(s.queryByText("1")).not.toBeInTheDocument(),await t(e.children).toHaveLength(1),await t(e.firstElementChild?.tagName.toLowerCase()).toBe("svg")}},r={args:{open:!0},play:async({canvasElement:a})=>{const e=i(a).getByRole("button",{name:"Filters"});await t(e).toHaveAttribute("title","Hide filters"),await t(e).toHaveAttribute("aria-pressed","true")}},l={args:{activeCount:4},play:async({canvasElement:a})=>{const e=i(a).getByRole("button",{name:"Filters, 4 applied"});await t(e).toHaveAttribute("title","Show filters")}},c={args:{open:!0,activeCount:2},play:async({canvasElement:a})=>{const e=i(a).getByRole("button",{name:"Filters, 2 applied"});await t(e).toHaveAttribute("title","Hide filters")}},d={render:a=>n.jsxs("div",{className:"flex items-start gap-4",children:[n.jsx(u,{...a,size:"md",label:"Filters (md)"}),n.jsx(u,{...a,size:"lg",label:"Filters (lg)"})]}),args:{activeCount:2}},p={render:a=>{const s=()=>{const[e,v]=m.useState("");return n.jsxs("div",{className:"flex w-[420px] items-start gap-2",children:[n.jsx(w,{type:"search",size:"lg",value:e,onChange:v,ariaLabel:"Search groups",placeholder:"Search…"}),n.jsx(u,{...a,size:"lg"})]})};return n.jsx(s,{})},args:{activeCount:1},play:async({canvasElement:a})=>{const s=i(a);await t(s.getByRole("searchbox",{name:"Search groups"})).toBeInTheDocument();const e=s.getByRole("button",{name:"Filters, 1 applied"});await t(e).toHaveAttribute("title","Show filters")}},b=()=>{const[a,s]=m.useState(!1);return n.jsxs("div",{className:"w-[320px]",children:[n.jsx(u,{open:a,activeCount:2,onToggle:()=>s(e=>!e),controls:"filter-panel"}),a&&n.jsx("div",{id:"filter-panel",className:"mt-2 rounded-md border border-neutral-200 p-3 text-sm",children:"Status: Active · Type: Okta group"})]})},g={render:()=>n.jsx(b,{}),play:async({canvasElement:a})=>{const s=i(a),e=s.getByRole("button",{name:"Filters, 2 applied"});await t(e).toHaveAttribute("aria-expanded","false"),await t(e).toHaveAttribute("title","Show filters"),await h.click(e),await t(e).toHaveAttribute("aria-expanded","true"),await t(e).toHaveAttribute("title","Hide filters"),await t(s.getByText(/Status: Active/)).toBeInTheDocument(),await h.click(e),await t(e).toHaveAttribute("aria-expanded","false"),await t(e).toHaveAttribute("title","Show filters"),await t(s.queryByText(/Status: Active/)).not.toBeInTheDocument()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Filters'
    });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    // No visible word, and no badge digit a reader could query at zero.
    await expect(canvas.queryByText('Filters')).not.toBeInTheDocument();
    await expect(canvas.queryByText('1')).not.toBeInTheDocument();

    /*
      D-053f — an applied filter must not widen this control and shrink the \`flex-1\`
      field beside it — used to be guarded by a reserved badge-width node, and that
      node was what this story asserted. The guard is now the box itself: one fixed
      square class in both states, with the badge absolutely positioned. So the
      assertion is the absence of any in-flow sibling of the glyph. The width itself
      cannot be asserted here — the story runner loads no Tailwind, so every measured
      box is zero; the square is pinned by \`Sizes\` for the eye instead.
    */
    await expect(toggle.children).toHaveLength(1);
    await expect(toggle.firstElementChild?.tagName.toLowerCase()).toBe('svg');
  }
}`,...o.parameters?.docs?.source},description:{story:`Collapsed, nothing applied — the resting state. The glyph carries the name and the
tooltip carries the direction of the press. Nothing but the glyph is in the box: the
badge is out of flow when it exists and absent when it does not, so there is no
reserved column at zero and the glyph is centred.`,...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Filters'
    });
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  }
}`,...r.parameters?.docs?.source},description:{story:"Active wash even at zero filters, because the panel itself is showing.",...r.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    activeCount: 4
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Filters, 4 applied'
    });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
  }
}`,...l.parameters?.docs?.source},description:{story:"The count badge, and the wash that says the list is shortened.",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    activeCount: 2
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Filters, 2 applied'
    });
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
  }
}`,...c.parameters?.docs?.source},description:{story:"Open and filtered: the accessible name spells the count out rather than trailing a digit.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex items-start gap-4">
      <FilterToggle {...args} size="md" label="Filters (md)" />
      <FilterToggle {...args} size="lg" label="Filters (lg)" />
    </div>,
  args: {
    activeCount: 2
  }
}`,...d.parameters?.docs?.source},description:{story:'`lg` beside an `Input size="lg"`, `md` beside anything shorter.',...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => {
    const SearchRow = () => {
      const [query, setQuery] = useState('');
      return <div className="flex w-[420px] items-start gap-2">
          <Input type="search" size="lg" value={query} onChange={setQuery} ariaLabel="Search groups" placeholder="Search…" />
          <FilterToggle {...args} size="lg" />
        </div>;
    };
    return <SearchRow />;
  },
  args: {
    activeCount: 1
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The field keeps its own name; the toggle beside it is found by its own.
    await expect(canvas.getByRole('searchbox', {
      name: 'Search groups'
    })).toBeInTheDocument();
    const toggle = canvas.getByRole('button', {
      name: 'Filters, 1 applied'
    });
    await expect(toggle).toHaveAttribute('title', 'Show filters');
  }
}`,...p.parameters?.docs?.source},description:{story:"The search row shape every consumer builds — field, then toggle.",...p.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <FilterDisclosure />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Filters, 2 applied'
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('title', 'Show filters');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('title', 'Hide filters');
    await expect(canvas.getByText(/Status: Active/)).toBeInTheDocument();
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('title', 'Show filters');
    await expect(canvas.queryByText(/Status: Active/)).not.toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:"Click the toggle and the panel it controls appears; click again and it is gone.",...g.parameters?.docs?.description}}};const T=["Default","Open","WithActiveCount","OpenWithActiveCount","Sizes","BesideASearchField","DisclosesAPanel"];export{p as BesideASearchField,o as Default,g as DisclosesAPanel,r as Open,c as OpenWithActiveCount,d as Sizes,l as WithActiveCount,T as __namedExportsOrder,S as default};
