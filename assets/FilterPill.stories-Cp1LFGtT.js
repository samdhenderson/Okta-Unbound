import{F as g,j as b,r as k}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,fn:A,userEvent:y,within:f}=__STORYBOOK_MODULE_TEST__,H={title:"Shared/FilterPill",component:g,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"Small two-state toggle pill for filter panels — solid primary when active, neutral outline when inactive.\n\nReflects its state as `aria-pressed`. Two ways to stand a pill down: `disabled` (native — dimmed, click-proof, skipped by Tab) for a pill whose own label says why, and `unavailableReason` (`aria-disabled` — dimmed, activation suppressed, **still focusable**) for a pill that has to state a reason a keyboard user can reach. For icon-only buttons use `IconButton`; for text CTAs use `Button`."}}},argTypes:{active:{description:"Toggle state; when true the pill is filled and `aria-pressed` is set."},onClick:{description:"Called when the pill is toggled."},children:{description:"Pill label content."},title:{description:"Native tooltip text for the pill."},disabled:{description:"When true the pill is dimmed and natively disabled — click-proof and skipped by Tab. Only for a pill that explains itself."},unavailableReason:{description:"Why the pill cannot be used. Present stands the pill down as `aria-disabled` — focusable, with this sentence as its accessible description."},inactiveClassName:{description:"Optional custom classes for the inactive state (e.g. semantic colors)."}},args:{children:"Filter label",onClick:A()}},r={args:{active:!1}},i={args:{active:!0}},n={args:{active:!1,disabled:!0}},o={args:{active:!0,disabled:!0}},c={args:{active:!1,children:"Used by rules",unavailableReason:"The group rules have not been read, so which attributes they use is unknown."},play:async({args:e,canvasElement:h})=>{const t=f(h).getByRole("button",{name:"Used by rules"});await y.tab(),await s(t).toHaveFocus(),await s(t).toHaveAttribute("aria-disabled","true"),await s(t).toHaveAccessibleDescription("The group rules have not been read, so which attributes they use is unknown."),await y.click(t),await s(e.onClick).not.toHaveBeenCalled()}},l={args:{active:!1,title:"Click to toggle filter"}},d={args:{active:!1},parameters:{pseudo:{focusVisible:!0}}},p={args:{active:!0},parameters:{pseudo:{active:!0}}},u={args:{active:!1},render:e=>b.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[b.jsx(g,{...e,active:!1,children:"Inactive"}),b.jsx(g,{...e,active:!0,children:"Active"})]})},v={args:{active:!1},parameters:{pseudo:{hover:!0}}},m={args:{active:!1},render:e=>{const h=()=>{const[a,t]=k.useState(!1);return b.jsx(g,{...e,active:a,onClick:()=>t(w=>!w),children:"Active rules only"})};return b.jsx(h,{})},play:async({canvasElement:e})=>{const a=f(e).getByRole("button",{name:"Active rules only"});await s(a).toHaveAttribute("aria-pressed","false"),await y.click(a),await s(a).toHaveAttribute("aria-pressed","true")}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  }
}`,...r.parameters?.docs?.source},description:{story:"Inactive state — outlined.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    active: true
  }
}`,...i.parameters?.docs?.source},description:{story:"Active state — solid primary fill.",...i.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    active: false,
    disabled: true
  }
}`,...n.parameters?.docs?.source},description:{story:"Disabled inactive.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    active: true,
    disabled: true
  }
}`,...o.parameters?.docs?.source},description:{story:"Disabled active.",...o.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    active: false,
    children: 'Used by rules',
    unavailableReason: 'The group rules have not been read, so which attributes they use is unknown.'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByRole('button', {
      name: 'Used by rules'
    });

    // Reachable by Tab — the whole point of \`aria-disabled\` over \`disabled\`.
    await userEvent.tab();
    await expect(pill).toHaveFocus();

    // And it says why, to assistive tech, not just to a hovering pointer.
    await expect(pill).toHaveAttribute('aria-disabled', 'true');
    await expect(pill).toHaveAccessibleDescription('The group rules have not been read, so which attributes they use is unknown.');

    // Focusable, but not operable: the click is suppressed.
    await userEvent.click(pill);
    await expect(args.onClick).not.toHaveBeenCalled();
  }
}`,...c.parameters?.docs?.source},description:{story:"Stood down with a reason. Unlike `disabled`, the pill keeps its place in the tab\norder, so a keyboard user lands on it and hears why it cannot be used.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    active: false,
    title: 'Click to toggle filter'
  }
}`,...l.parameters?.docs?.source},description:{story:"With optional title tooltip.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  },
  parameters: {
    pseudo: {
      focusVisible: true
    }
  }
}`,...d.parameters?.docs?.source},description:{story:"Focus-visible state (forced via the pseudo-states addon).",...d.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    active: true
  },
  parameters: {
    pseudo: {
      active: true
    }
  }
}`,...p.parameters?.docs?.source},description:{story:"Pressed state (forced via the pseudo-states addon).",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  },
  render: args => <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>
      <FilterPill {...args} active={false}>
        Inactive
      </FilterPill>
      <FilterPill {...args} active={true}>
        Active
      </FilterPill>
    </div>
}`,...u.parameters?.docs?.source},description:{story:"Two pills side by side showing active/inactive pair.",...u.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  },
  parameters: {
    pseudo: {
      hover: true
    }
  }
}`,...v.parameters?.docs?.source},description:{story:"Hover state (forced via the pseudo-states addon).",...v.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    active: false
  },
  render: args => {
    const Harness = () => {
      const [active, setActive] = useState(false);
      return <FilterPill {...args} active={active} onClick={() => setActive(prev => !prev)}>
          Active rules only
        </FilterPill>;
    };
    return <Harness />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByRole('button', {
      name: 'Active rules only'
    });
    await expect(pill).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(pill);
    await expect(pill).toHaveAttribute('aria-pressed', 'true');
  }
}`,...m.parameters?.docs?.source},description:{story:"Wired to real state: clicking the pill flips its fill and its `aria-pressed`.",...m.parameters?.docs?.description}}};const S=["Default","Active","Disabled","DisabledActive","Unavailable","WithTitle","Focus","Pressed","ActiveInactivePair","Hover","Toggling"];export{i as Active,u as ActiveInactivePair,r as Default,n as Disabled,o as DisabledActive,d as Focus,v as Hover,p as Pressed,m as Toggling,c as Unavailable,l as WithTitle,S as __namedExportsOrder,H as default};
