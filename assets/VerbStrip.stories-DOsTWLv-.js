import{V as m}from"./VerbStrip-CFQur6FV.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./verbIcons-BnCRhW9A.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:a,fn:l,userEvent:c,within:d}=__STORYBOOK_MODULE_TEST__,h={title:"Home/Ask/VerbStrip",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"The Ask verbs as a radio group, with Run at the end of the row. Only the chosen verb shows its label. Run’s title quotes what running will spend (ADR-0007); it is disabled until every required slot is filled. Only verbs with an engine are offered."}}},args:{verbs:["compare","access"],active:"compare",onPick:l(),ready:!1,running:!1,cost:"Takes 2 user group-list walks and 2 app-assignment walks.",onRun:l()}},r={play:async({args:t,canvasElement:n})=>{const e=d(n);await a(e.getByRole("radio",{name:"Compare"})).toHaveAttribute("aria-checked","true"),await a(e.getByRole("button",{name:/Run/})).toBeDisabled(),await c.click(e.getByRole("radio",{name:"Access"})),await a(t.onPick).toHaveBeenCalledWith("access")}},s={args:{ready:!0},play:async({args:t,canvasElement:n})=>{const e=d(n).getByRole("button",{name:/Run/});await a(e).toHaveAttribute("title",`Compare · ${t.cost}`),await c.click(e),await a(t.onRun).toHaveBeenCalledTimes(1)}},o={args:{ready:!0,running:!0}},i={play:async({args:t,canvasElement:n})=>{const e=d(n),p=e.getByRole("radio",{name:"Compare"});await a(p).toHaveAttribute("tabindex","0"),await a(e.getByRole("radio",{name:"Access"})).toHaveAttribute("tabindex","-1"),p.focus(),await c.keyboard("{ArrowRight}"),await a(t.onPick).toHaveBeenCalledWith("access")}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radio', {
      name: 'Compare'
    })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('button', {
      name: /Run/
    })).toBeDisabled();
    await userEvent.click(canvas.getByRole('radio', {
      name: 'Access'
    }));
    await expect(args.onPick).toHaveBeenCalledWith('access');
  }
}`,...r.parameters?.docs?.source},description:{story:"The sentence is incomplete, so Run is disabled.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ready: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const run = within(canvasElement).getByRole('button', {
      name: /Run/
    });
    await expect(run).toHaveAttribute('title', \`Compare · \${args.cost}\`);
    await userEvent.click(run);
    await expect(args.onRun).toHaveBeenCalledTimes(1);
  }
}`,...s.parameters?.docs?.source},description:{story:"Every required slot is filled.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ready: true,
    running: true
  }
}`,...o.parameters?.docs?.source},description:{story:"A run is in flight: the verbs and Run are locked.",...o.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const compare = canvas.getByRole('radio', {
      name: 'Compare'
    });
    await expect(compare).toHaveAttribute('tabindex', '0');
    await expect(canvas.getByRole('radio', {
      name: 'Access'
    })).toHaveAttribute('tabindex', '-1');
    compare.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onPick).toHaveBeenCalledWith('access');
  }
}`,...i.parameters?.docs?.source},description:{story:"The verbs are one Tab stop; the arrow keys move the choice.",...i.parameters?.docs?.description}}};const B=["NotReady","Ready","Running","ArrowKeys"];export{i as ArrowKeys,r as NotReady,s as Ready,o as Running,B as __namedExportsOrder,h as default};
