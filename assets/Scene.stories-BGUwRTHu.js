import{j as e,L as n,B as o}from"./iframe-mmN7AxbW.js";import{S as m,M as r}from"./Scene-D2nzHScN.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./Stage-BOcHwKLL.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./sceneRegistry-BbOWuDWO.js";const{expect:l,within:d}=__STORYBOOK_MODULE_TEST__,j={title:"Guide/Shell/Scene",component:m,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"A heading, a sentence, the 440px stage, and the numbered legend beside it. Markers on the stage carry the numbers; the legend carries the sentences. Below the `lg` breakpoint the legend drops under the stage."}}},args:{title:"Search a person",stageLabel:"Users",intro:"Type a name, a login or an email.",legend:[{text:"A status badge on every row."},{text:"The count says how many matched."}],children:e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(r,{n:1,children:e.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:e.jsxs(n,{density:"compact",children:[e.jsx("span",{className:"text-sm",children:"Amara Okonkwo"}),e.jsx(o,{variant:"success",children:"Active"})]})})}),e.jsx(r,{n:2,children:e.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:e.jsxs(n,{density:"compact",children:[e.jsx("span",{className:"text-sm",children:"Priya Natarajan"}),e.jsx(o,{variant:"warning",children:"Suspended"})]})})})]})}},t={play:async({canvasElement:i})=>{const c=d(i).getByTestId("guide-legend");await l(d(c).getAllByRole("listitem")).toHaveLength(2)}},a={parameters:{motion:"on"},args:{legend:[{text:"A status badge on every row."},{text:"The count says how many matched."},{text:"Rows arrive after the stage they point at."}],children:e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(r,{n:1,children:e.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:e.jsxs(n,{density:"compact",children:[e.jsx("span",{className:"text-sm",children:"Amara Okonkwo"}),e.jsx(o,{variant:"success",children:"Active"})]})})}),e.jsx(r,{n:2,children:e.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:e.jsxs(n,{density:"compact",children:[e.jsx("span",{className:"text-sm",children:"Priya Natarajan"}),e.jsx(o,{variant:"warning",children:"Suspended"})]})})}),e.jsx(r,{n:3,children:e.jsx("div",{className:"overflow-hidden rounded-md border border-neutral-200 bg-white",children:e.jsx(n,{density:"compact",children:e.jsx("span",{className:"text-sm",children:"2 people"})})})})]})},play:async({canvasElement:i})=>{const c=d(i).getByTestId("guide-legend");await l(d(c).getAllByRole("listitem")).toHaveLength(3)}},s={args:{minHeight:240,legend:[{text:"The frame holds 240px even when its content is short."}]}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByTestId('guide-legend');
    await expect(within(legend).getAllByRole('listitem')).toHaveLength(2);
  }
}`,...t.parameters?.docs?.source},description:{story:"The default: two markers, two legend rows, in step.",...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    legend: [{
      text: 'A status badge on every row.'
    }, {
      text: 'The count says how many matched.'
    }, {
      text: 'Rows arrive after the stage they point at.'
    }],
    children: <div className="flex flex-col gap-2">
        <Marker n={1}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Amara Okonkwo</span>
              <Badge variant="success">Active</Badge>
            </ListRow>
          </div>
        </Marker>
        <Marker n={2}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">Priya Natarajan</span>
              <Badge variant="warning">Suspended</Badge>
            </ListRow>
          </div>
        </Marker>
        <Marker n={3}>
          <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
            <ListRow density="compact">
              <span className="text-sm">2 people</span>
            </ListRow>
          </div>
        </Marker>
      </div>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByTestId('guide-legend');
    await expect(within(legend).getAllByRole('listitem')).toHaveLength(3);
  }
}`,...a.parameters?.docs?.source},description:{story:`The arrival, with motion on: heading first, the stage a beat later, then the
legend rows one by one. Stories run motion-off by default, so this is the one
place the choreography plays; the assertion is the same, the order is the
subject.`,...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 240,
    legend: [{
      text: 'The frame holds 240px even when its content is short.'
    }]
  }
}`,...s.parameters?.docs?.source},description:{story:"A frame with a floor, for content that opens into it.",...s.parameters?.docs?.description}}};const f=["Default","Choreographed","WithMinHeight"];export{a as Choreographed,t as Default,s as WithMinHeight,f as __namedExportsOrder,j as default};
