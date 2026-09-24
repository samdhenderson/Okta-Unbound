import{ah as p,j as t,i as l}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:c,within:h}=__STORYBOOK_MODULE_TEST__,w={title:"Shared/ListCountLine",component:p,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"The line above a selectable list that says how much of it is on screen and how much is ticked — and the reason the controls below carry no counts of their own. A number stated twice is a number that can disagree with itself.\n\nTwo absences are deliberate and are not the same absence. **No `of`** means the list is a page and no honest total exists, so the line says `Showing 20` and stops — a page size rendered as a total is the confidently-wrong number `docs/claims.md` forbids. **No selection** omits the clause entirely rather than rendering `0 selected`, because an empty basket is an absence, not a figure the reader asked for."}}},argTypes:{shown:{description:"Rows on screen now — after filtering, and after paging where it pages."},of:{description:"The population `shown` was drawn from. Omit when no honest total exists, such as a server-side search holding one page."},selected:{description:"Ticked rows of this list’s kind. `0` renders no clause at all."},className:{description:"Extra classes — layout and spacing only, never type or colour."},testId:{description:"Optional test handle."}},args:{shown:47,of:250,selected:0,testId:"list-count-line"}},d=e=>h(e).getByTestId("list-count-line").textContent,s={play:async({canvasElement:e})=>{await c(d(e)).toBe("Showing 47 of 250")}},a={args:{selected:12},play:async({canvasElement:e})=>{await c(d(e)).toBe("Showing 47 of 250 · 12 selected")}},n={args:{shown:20,of:void 0,selected:3},play:async({canvasElement:e})=>{await c(d(e)).toBe("Showing 20 · 3 selected")}},r={args:{selected:0},play:async({canvasElement:e})=>{await c(d(e)).toBe("Showing 47 of 250")}},o={args:{shown:3,of:128,selected:2},render:e=>t.jsxs("div",{className:"w-96",children:[t.jsxs("div",{className:"flex items-center justify-end gap-2 rounded-t-md border border-neutral-200 bg-white px-3 py-2",children:[t.jsx(l,{variant:"link",size:"xs",children:"Deselect all"}),t.jsx(l,{variant:"link",size:"xs",children:"Select all"}),t.jsx(l,{variant:"secondary",size:"xs",children:"Compare"})]}),t.jsx("div",{className:"border-x border-neutral-200 px-3 py-2",children:t.jsx(p,{...e})}),t.jsx("ul",{className:"divide-y divide-neutral-200 rounded-b-md border border-neutral-200",children:["Engineering EMEA","Payments Team","Contractors — 2026"].map(m=>t.jsx("li",{className:"px-3 py-2 text-sm text-neutral-900",children:m},m))})]})},i={parameters:{viewport:{value:"sidepanelCompact"}},args:{shown:1284,of:12840,selected:1284},render:e=>t.jsx("div",{className:"w-full p-4",children:t.jsx(p,{...e})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250');
  }
}`,...s.parameters?.docs?.source},description:{story:"Nothing ticked: both numbers, no selection clause.",...s.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    selected: 12
  },
  play: async ({
    canvasElement
  }) => {
    // The filter denominator survives the selection — the two facts coexist.
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250 · 12 selected');
  }
}`,...a.parameters?.docs?.source},description:{story:"Ticking appends a clause; it never replaces the denominator, which is what *Select all* takes.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    shown: 20,
    of: undefined,
    selected: 3
  },
  play: async ({
    canvasElement
  }) => {
    // Non-vacuity: the string is pinned whole, so a stray \` of N\` cannot hide in it.
    await expect(lineText(canvasElement)).toBe('Showing 20 · 3 selected');
  }
}`,...n.parameters?.docs?.source},description:{story:`A server-side search holding one page. The denominator is **withheld**, not
guessed at: this list knows how many rows it fetched and nothing about how
many matched.`,...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    selected: 0
  },
  play: async ({
    canvasElement
  }) => {
    await expect(lineText(canvasElement)).toBe('Showing 47 of 250');
  }
}`,...r.parameters?.docs?.source},description:{story:"Zero ticked renders no clause — not `0 selected`.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    shown: 3,
    of: 128,
    selected: 2
  },
  render: args => <div className="w-96">
      <div className="flex items-center justify-end gap-2 rounded-t-md border border-neutral-200 bg-white px-3 py-2">
        <Button variant="link" size="xs">
          Deselect all
        </Button>
        <Button variant="link" size="xs">
          Select all
        </Button>
        <Button variant="secondary" size="xs">
          Compare
        </Button>
      </div>
      <div className="border-x border-neutral-200 px-3 py-2">
        <ListCountLine {...args} />
      </div>
      <ul className="divide-y divide-neutral-200 rounded-b-md border border-neutral-200">
        {['Engineering EMEA', 'Payments Team', 'Contractors — 2026'].map(name => <li key={name} className="px-3 py-2 text-sm text-neutral-900">
            {name}
          </li>)}
      </ul>
    </div>
}`,...o.parameters?.docs?.source},description:{story:`In its real job: the readout sits above the list, and the controls that act on
the selection sit in the band above it carrying no counts at all.`,...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  args: {
    shown: 1284,
    of: 12840,
    selected: 1284
  },
  render: args => <div className="w-full p-4">
      <ListCountLine {...args} />
    </div>
}`,...i.parameters?.docs?.source},description:{story:"At 360px, the narrowest side-panel width: the line wraps rather than truncating.",...i.parameters?.docs?.description}}};const y=["Default","WithSelection","NoHonestTotal","ZeroSelectedIsAbsent","AboveAList","Compact"];export{o as AboveAList,i as Compact,s as Default,n as NoHonestTotal,a as WithSelection,r as ZeroSelectedIsAbsent,y as __namedExportsOrder,w as default};
