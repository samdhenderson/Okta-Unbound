import{Z as v,j as o}from"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:e,fn:S,userEvent:b,within:l}=__STORYBOOK_MODULE_TEST__,y={boundary:"available",onSelectAll:S(),onDeselectAll:S(),selectAllTitle:"Select every group matching the current filters",deselectAllTitle:"Clear every selected group, including any picked on another screen"},T={title:"Shared/ListCountRow",component:v,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The control line above a selectable list: `ListCountLine` writes the numbers, and *Select all* / *Deselect all* stand beside them. The controls live here rather than in `ActionBar`'s selection register so that each one sits next to the figure it acts on, and the verb strip is left for verbs.\n\nThe labels carry **no counts** — the line states each number once, and a number printed twice is a number that can disagree with itself. The boundary a control is standing on travels in its `title`, which on an element with text content is the accessible *description*, not the name.\n\n*Deselect all* is declared first, so it takes position one the moment it exists: where the set of controls varies with the selection size, the leading position must hold a control whose worst outcome is another click. Because the cluster is trailing, its arrival grows the cluster leftward and *Select all* does not move. *Select all* is disabled at its boundary rather than omitted — it is furniture, not a verb.\n\nWhich boundary it stands on is **stated** by the rung, as a three-valued `boundary`, and never inferred here from the two counts. `selected` is the whole basket partition for that kind — including rows ticked under another filter, on another screen — while what *Select all* would take is scoped to the current search. Those two numbers count different populations, so their equality is not evidence of set equality; the `SameSizeDifferentRows` story is the regression net for that.\n\nLayout is `flex-wrap-reverse`: the cluster sits beside the count when the row is wide enough and wraps to a line **above** it when it is not, measured from the content rather than guessed from a breakpoint. The three viewport stories pin that."}}},argTypes:{shown:{description:"Rows on screen now — after filtering, and after paging where it pages."},of:{description:"The population `shown` was drawn from. Omit when no honest total exists, such as a server-side search holding one page."},selected:{description:"Ticked rows of this list’s kind. `0` renders no clause at all."},selection:{description:"The selection controls, their caller-written titles, and the `boundary` *Select all* stands on. Omit for a count line with nothing ticked against it."},className:{description:"Extra classes for the row — layout and spacing only, never type or colour."},testId:{description:"Optional test handle, forwarded to the count line."}},args:{shown:42,of:1070,selected:0,selection:y,testId:"list-count-row-line"}},f=t=>l(t).getAllByRole("button").map(n=>n.textContent),r={play:async({args:t,canvasElement:n})=>{const a=l(n);await e(a.getByTestId("list-count-row-line")).toHaveTextContent("Showing 42 of 1,070"),await e(f(n)).toEqual(["Select all"]);const s=a.getByRole("button",{name:"Select all"});await e(s).toBeEnabled(),await e(s).toHaveAccessibleDescription("Select every group matching the current filters"),await e(s).toHaveAccessibleName("Select all"),await b.click(s),await e(t.selection?.onSelectAll).toHaveBeenCalledTimes(1)}},i={args:{selected:3},play:async({args:t,canvasElement:n})=>{const a=l(n);await e(a.getByTestId("list-count-row-line")).toHaveTextContent("Showing 42 of 1,070 · 3 selected"),await e(f(n)).toEqual(["Deselect all","Select all"]);const s=a.getByRole("button",{name:"Deselect all"});await e(s).toHaveAccessibleDescription("Clear every selected group, including any picked on another screen"),await e(a.getByRole("button",{name:"Select all"})).toBeEnabled(),await b.click(s),await e(t.selection?.onDeselectAll).toHaveBeenCalledTimes(1)}},c={args:{selected:42,selection:{...y,boundary:"all-taken",selectAllTitle:"All 42 groups matching the current filters are already selected"}},play:async({canvasElement:t})=>{const n=l(t);await e(f(t)).toEqual(["Deselect all","Select all"]);const a=n.getByRole("button",{name:"Select all"});await e(a).toBeDisabled(),await e(a).toHaveAccessibleDescription("All 42 groups matching the current filters are already selected"),await e(n.getByRole("button",{name:"Deselect all"})).toBeEnabled()}},d={args:{shown:0,of:1070,selected:0,selection:{...y,boundary:"none-selectable",selectAllTitle:"No groups match the current filters"}},play:async({canvasElement:t})=>{const n=l(t).getByRole("button",{name:"Select all"});await e(n).toBeDisabled(),await e(n).toHaveAccessibleDescription("No groups match the current filters")}},h={args:{shown:3,of:1070,selected:3},play:async({args:t,canvasElement:n})=>{const a=l(n);await e(a.getByTestId("list-count-row-line")).toHaveTextContent("Showing 3 of 1,070 · 3 selected");const s=a.getByRole("button",{name:"Select all"});await e(s).toBeEnabled(),await e(s).toHaveAccessibleDescription("Select every group matching the current filters"),await b.click(s),await e(t.selection?.onSelectAll).toHaveBeenCalledTimes(1)}},p={args:{selection:void 0},play:async({canvasElement:t})=>{const n=l(t);await e(n.getByTestId("list-count-row-line")).toHaveTextContent("Showing 42 of 1,070"),await e(n.queryAllByRole("button")).toHaveLength(0)}},u={parameters:{viewport:{value:"sidepanelCompact"}},args:{shown:1284e3,of:1284e4,selected:1284e3},render:t=>o.jsx(v,{...t})},m={parameters:{viewport:{value:"sidepanelDefault"}},args:{selected:3},render:t=>o.jsx(v,{...t})},w={parameters:{viewport:{value:"sidepanelWide"}},args:{selected:3},render:t=>o.jsx(v,{...t})},g={args:{shown:3,of:1070,selected:2,selection:y},render:t=>o.jsxs("div",{children:[o.jsx(v,{...t,className:"mb-2"}),o.jsx("ul",{className:"divide-y divide-neutral-200 rounded-md border border-neutral-200",children:["Engineering EMEA","Payments Team","Contractors — 2026"].map(n=>o.jsx("li",{className:"px-3 py-2 text-sm text-neutral-900",children:n},n))})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent('Showing 42 of 1,070');
    await expect(labels(canvasElement)).toEqual(['Select all']);
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeEnabled();
    // The boundary and the target travel in the description, never in the label.
    await expect(selectAll).toHaveAccessibleDescription('Select every group matching the current filters');
    await expect(selectAll).toHaveAccessibleName('Select all');
    await userEvent.click(selectAll);
    await expect(args.selection?.onSelectAll).toHaveBeenCalledTimes(1);
  }
}`,...r.parameters?.docs?.source},description:{story:`Nothing ticked. \`Select all\` is already there and already enabled — passing
\`selection\` buys the row its full height up front, so the first tick adds a
control to a row that already exists rather than growing one.

(The *height* is a CSS consequence and the story runner loads no stylesheet;
what is assertable here is the structural half — the cluster is in the
document before anything is selected.)`,...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    selected: 3
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent('Showing 42 of 1,070 · 3 selected');
    await expect(labels(canvasElement)).toEqual(['Deselect all', 'Select all']);
    const deselectAll = canvas.getByRole('button', {
      name: 'Deselect all'
    });
    await expect(deselectAll).toHaveAccessibleDescription('Clear every selected group, including any picked on another screen');
    await expect(canvas.getByRole('button', {
      name: 'Select all'
    })).toBeEnabled();
    await userEvent.click(deselectAll);
    await expect(args.selection?.onDeselectAll).toHaveBeenCalledTimes(1);
  }
}`,...i.parameters?.docs?.source},description:{story:"Some ticked. Two things are pinned: `Deselect all` takes position one, and\n`Select all` is still the **last** control — the cluster grew leftward, so the\npointer that just ticked a row is not now over a different button.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    selected: 42,
    selection: {
      ...selection,
      boundary: 'all-taken',
      selectAllTitle: 'All 42 groups matching the current filters are already selected'
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(labels(canvasElement)).toEqual(['Deselect all', 'Select all']);
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('All 42 groups matching the current filters are already selected');
    await expect(canvas.getByRole('button', {
      name: 'Deselect all'
    })).toBeEnabled();
  }
}`,...c.parameters?.docs?.source},description:{story:"Everything ticked. `Select all` is **disabled, not omitted**: a control that\nvanished at its boundary would hand position two to whatever came next. Its\ndescription says which boundary it is sitting on.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    shown: 0,
    of: 1070,
    selected: 0,
    selection: {
      ...selection,
      boundary: 'none-selectable',
      selectAllTitle: 'No groups match the current filters'
    }
  },
  play: async ({
    canvasElement
  }) => {
    const selectAll = within(canvasElement).getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeDisabled();
    await expect(selectAll).toHaveAccessibleDescription('No groups match the current filters');
  }
}`,...d.parameters?.docs?.source},description:{story:`The third boundary: nothing is selectable at all, so there is nothing to take.
Same treatment — disabled, in place, with the reason in its description. The
three rungs gate this row on having rows, so they never reach it; the
component still renders it, because the contract has three values and each one
is pinned here.`,...d.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    shown: 3,
    of: 1070,
    selected: 3
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent('Showing 3 of 1,070 · 3 selected');
    const selectAll = canvas.getByRole('button', {
      name: 'Select all'
    });
    await expect(selectAll).toBeEnabled();
    await expect(selectAll).toHaveAccessibleDescription('Select every group matching the current filters');
    await userEvent.click(selectAll);
    await expect(args.selection?.onSelectAll).toHaveBeenCalledTimes(1);
  }
}`,...h.parameters?.docs?.source},description:{story:`The regression net for the defect this contract replaced: **a basket the same
size as the filter result, holding different rows.**

Three rows are on screen and three rows are ticked, but they are not the same
three — two of the picks were made under another filter, on another screen. The
rung says so with \`boundary: 'available'\`, and *Select all* is **enabled**,
because the click would genuinely replace the partition.

Reintroduce the old \`selected === selectableCount\` arithmetic and this story
fails: the control would go dead while its own description promises a
replacement it refuses to perform.`,...h.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    selection: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('list-count-row-line')).toHaveTextContent('Showing 42 of 1,070');
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
  }
}`,...p.parameters?.docs?.source},description:{story:"No `selection` at all: the row is the count line alone. A list with nothing to\ntick renders no controls rather than dead ones.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  },
  args: {
    shown: 1284000,
    of: 12840000,
    selected: 1284000
  },
  render: args => <ListCountRow {...args} />
}`,...u.parameters?.docs?.source},description:{story:"360px, the narrowest side-panel width, with the longest numbers this row can\ncarry. The cluster no longer fits beside the count, so `flex-wrap-reverse`\nlifts it to the line **above** — and `ml-auto` keeps it trailing there.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelDefault'
    }
  },
  args: {
    selected: 3
  },
  render: args => <ListCountRow {...args} />
}`,...m.parameters?.docs?.source},description:{story:"480px, the common side-panel width: count and cluster share one line.",...m.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelWide'
    }
  },
  args: {
    selected: 3
  },
  render: args => <ListCountRow {...args} />
}`,...w.parameters?.docs?.source},description:{story:"720px, a dragged-wide panel: the same one line, with the cluster still hard against the trailing edge.",...w.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    shown: 3,
    of: 1070,
    selected: 2,
    selection
  },
  render: args => <div>
      <ListCountRow {...args} className="mb-2" />
      <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
        {['Engineering EMEA', 'Payments Team', 'Contractors — 2026'].map(name => <li key={name} className="px-3 py-2 text-sm text-neutral-900">
            {name}
          </li>)}
      </ul>
    </div>
}`,...g.parameters?.docs?.source},description:{story:`In its real job — above a list, under the rung's verb strip. Note what the
strip does *not* contain: no selection controls, and no counts.`,...g.parameters?.docs?.description}}};const B=["Default","SomeSelected","AllSelected","NoneSelectable","SameSizeDifferentRows","WithoutSelection","Compact","DefaultWidth","Wide","AboveAList"];export{g as AboveAList,c as AllSelected,u as Compact,r as Default,m as DefaultWidth,d as NoneSelectable,h as SameSizeDifferentRows,i as SomeSelected,w as Wide,p as WithoutSelection,B as __namedExportsOrder,T as default};
