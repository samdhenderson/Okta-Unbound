import{R as p}from"./RunSteps-B3-vvI0R.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:a,within:i}=__STORYBOOK_MODULE_TEST__,l={title:"Selection/run/RunSteps",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The `running` stage of a verb that reports its steps through `report(message, steps)`. A glyph per status, and the status spoken to a screen reader, because the glyph is paint. `unknown` is distinct from `rejected`: a write Okta did not confirm is not a write Okta refused."}}},argTypes:{steps:{description:"The steps as the verb last reported them, in run order."}},args:{steps:[]}},e={args:{steps:[{id:"pause",label:"Paused 0prFAKE0000000000002",status:"done"},{id:"save",label:"Saving 3 target groups…",status:"active"},{id:"resume",label:"Resume — starts after the save",status:"waiting"}]}},t={args:{steps:[{id:"pause",label:"Paused 0prFAKE0000000000002",status:"done"},{id:"save",label:"Saved 3 target groups",status:"done"},{id:"resume",label:"Resume 0prFAKE0000000000002",status:"unknown"},{id:"retire",label:"Retire 0prFAKE0000000000003",status:"rejected"},{id:"tidy",label:"Delete 0prFAKE0000000000003",status:"waiting"}]},play:async({canvasElement:n})=>{const r=i(n).getAllByRole("listitem");await a(r[2]).toHaveTextContent("Not confirmed: Resume 0prFAKE0000000000002"),await a(r[3]).toHaveTextContent("Rejected: Retire 0prFAKE0000000000003"),await a(r[4]).toHaveTextContent("Waiting: Delete 0prFAKE0000000000003")}},s={play:async({canvasElement:n})=>{const o=i(n);await a(o.queryByRole("list")).not.toBeInTheDocument()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    steps: [{
      id: 'pause',
      label: 'Paused 0prFAKE0000000000002',
      status: 'done'
    }, {
      id: 'save',
      label: 'Saving 3 target groups…',
      status: 'active'
    }, {
      id: 'resume',
      label: 'Resume — starts after the save',
      status: 'waiting'
    }]
  }
}`,...e.parameters?.docs?.source},description:{story:"Mid-run: one step done, one in progress, one waiting.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    steps: [{
      id: 'pause',
      label: 'Paused 0prFAKE0000000000002',
      status: 'done'
    }, {
      id: 'save',
      label: 'Saved 3 target groups',
      status: 'done'
    }, {
      id: 'resume',
      label: 'Resume 0prFAKE0000000000002',
      status: 'unknown'
    }, {
      id: 'retire',
      label: 'Retire 0prFAKE0000000000003',
      status: 'rejected'
    }, {
      id: 'tidy',
      label: 'Delete 0prFAKE0000000000003',
      status: 'waiting'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const steps = canvas.getAllByRole('listitem');
    await expect(steps[2]).toHaveTextContent('Not confirmed: Resume 0prFAKE0000000000002');
    await expect(steps[3]).toHaveTextContent('Rejected: Retire 0prFAKE0000000000003');
    await expect(steps[4]).toHaveTextContent('Waiting: Delete 0prFAKE0000000000003');
  }
}`,...t.parameters?.docs?.source},description:{story:"Every status, so each glyph and its spoken word are pinned together.",...t.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"No steps reported: nothing renders, and the run keeps its plain progress line.",...s.parameters?.docs?.description}}};const m=["InProgress","EveryStatus","Empty"];export{s as Empty,t as EveryStatus,e as InProgress,m as __namedExportsOrder,l as default};
