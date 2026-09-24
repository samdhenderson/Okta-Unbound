import{j as t,L as p,B as d}from"./iframe-mmN7AxbW.js";import{S as m,A as l}from"./Assemble-BfsBqw6B.js";import{u}from"./useTyped-CRITGoQX.js";import{U as w}from"./UserSearchBar-D7NR_6ke.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./StatusChip-CSLqKHGq.js";import"./Stage-BOcHwKLL.js";import"./motion-BaDhWFVg.js";const{expect:s,waitFor:y,within:c}=__STORYBOOK_MODULE_TEST__,h=["Amara Okonkwo","Priya Natarajan","Tomas Lindqvist"],g=({beat:e})=>{const a=u("Ama",e>=1);return t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx(w,{searchQuery:a,onSearchChange:()=>{},onClear:()=>{},isSearching:e===1&&a.length<3,showClearButton:a.length>0}),e>=2?t.jsx(l,{className:"flex flex-col gap-1",children:h.map(i=>t.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:t.jsxs(p,{density:"compact",children:[t.jsx("span",{className:"text-sm",children:i}),t.jsx(d,{variant:"success",children:"Active"})]})},i))}):null]})},N={title:"Guide/Show/Show",component:m,parameters:{layout:"fullscreen",docs:{description:{component:'A show plays once, when its stage is half in view: each beat rests for `hold` tells, the last one holds forever. Under `data-motion="off"` or reduced motion it renders the last beat at once, so the still is also the fallback.'}}},args:{id:"users",stageLabel:"Users",minHeight:200,beats:[{caption:"An empty search.",hold:1},{caption:"Type a name.",hold:2},{caption:"Three people match."}],children:e=>t.jsx(g,{beat:e})},decorators:[e=>t.jsx("div",{className:"bg-canvas px-10 py-6",children:t.jsx(e,{})})]},o={play:async({canvasElement:e})=>{const a=c(e);await s(e.querySelector("[data-show-state]")).toHaveAttribute("data-show-state","done"),await s(a.getByText("Three people match.")).toBeInTheDocument(),await s(a.getByDisplayValue("Ama")).toBeInTheDocument()}},n={parameters:{motion:"on"},args:{beats:[{caption:"An empty search.",hold:4},{caption:"Type a name.",hold:4},{caption:"Three people match."}]},play:async({canvasElement:e})=>{const a=c(e);e.querySelector(".guide-stage")?.scrollIntoView({block:"center"}),await y(()=>s(e.querySelector("[data-show-state]")).toHaveAttribute("data-show-state","done"),{timeout:15e3}),await s(a.getByText("Three people match.")).toBeInTheDocument()}},r={args:{stageLabel:void 0,minHeight:void 0,beats:[{caption:"Three people match."}],children:()=>t.jsx(l,{as:"ul",className:"flex flex-wrap gap-2",children:h.map(e=>t.jsx("li",{className:"rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm",children:e},e))})},play:async({canvasElement:e})=>{const a=c(e);await s(e.querySelector(".guide-stage")).toBeNull(),await s(a.getByRole("list")).toBeInTheDocument(),await s(a.getByText("Three people match.")).toBeInTheDocument()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('[data-show-state]')).toHaveAttribute('data-show-state', 'done');
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
    await expect(canvas.getByDisplayValue('Ama')).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"Motion off: the last beat, at once.",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    beats: [{
      caption: 'An empty search.',
      hold: 4
    }, {
      caption: 'Type a name.',
      hold: 4
    }, {
      caption: 'Three people match.'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // A show starts when its stage is half in view; a narrow viewport stacks
    // the stage under the headline, so bring it up the way a reader would.
    canvasElement.querySelector('.guide-stage')?.scrollIntoView({
      block: 'center'
    });
    await waitFor(() => expect(canvasElement.querySelector('[data-show-state]')).toHaveAttribute('data-show-state', 'done'), {
      timeout: 15000
    });
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source},description:{story:`Motion on: the beats play from the first, and the caption follows them.
Long holds, so each pose can be looked at. Under the headless runner the
motion scale is not loaded, so the gate skips the play and the still is
what gets asserted; watch this one in the explorer.`,...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    stageLabel: undefined,
    minHeight: undefined,
    beats: [{
      caption: 'Three people match.'
    }],
    children: () => <Assemble as="ul" className="flex flex-wrap gap-2">
        {PEOPLE.map(name => <li key={name} className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
            {name}
          </li>)}
      </Assemble>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('.guide-stage')).toBeNull();
    await expect(canvas.getByRole('list')).toBeInTheDocument();
    await expect(canvas.getByText('Three people match.')).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"A show with no `stageLabel` has no frame: the pieces stand on the canvas in\none column under the headline. The welcome overture is this shape, where\nwhat is being shown is the guide's own contents rather than the product.",...r.parameters?.docs?.description}}};const D=["Still","Plays","NoFrame"];export{r as NoFrame,n as Plays,o as Still,D as __namedExportsOrder,N as default};
