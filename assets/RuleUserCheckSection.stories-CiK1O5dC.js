import{j as i,a4 as p}from"./iframe-mmN7AxbW.js";import{R as g}from"./RuleUserCheckSection-CNDKWHgc.js";import{r as v,u as o,c as x,g as h,e as y}from"./storyFixtures-D5ilZVaO.js";import"./preload-helper-PPVm8Dsz.js";import"./QualificationSubjectStatus-C8GNQ5uy.js";import"./RuleUserReport-Dw4FGkEi.js";import"./MissingGroupChip-BPaj6mVy.js";import"./userDisplay-xpx41Abi.js";import"./qualification-cO_gjK9U.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:c,fn:u,userEvent:B,within:l}=__STORYBOOK_MODULE_TEST__,m={status:"loaded",userId:o.id,user:o,groups:[],groupContext:h},U={title:"Rules/RuleUserCheckSection",component:g,tags:["autodocs"],parameters:{docs:{description:{component:'The rule rung\'s answer to "does this user qualify?": a `DetailSection` naming the subject, holding the load status or the `RuleUserReport`, with its own Clear. Mounted only while a subject is in scope.'}}},decorators:[e=>i.jsx(p,{handlers:{group:u()},children:i.jsx("div",{className:"max-w-md p-4",children:i.jsx(e,{})})})],args:{onClear:u(),resolveGroupName:v}},t={args:{subject:{status:"loading",userId:o.id},verdict:null},play:async({canvasElement:e})=>{const a=l(e);await c(a.getByText(/Reading the user/)).toBeInTheDocument(),await c(a.queryByText("Qualifies")).not.toBeInTheDocument()}},s={args:{subject:{status:"failed",userId:o.id,reason:"groups-failed"},verdict:null}},n={args:{subject:m,verdict:x},play:async({canvasElement:e,args:a})=>{const d=l(e);await c(d.getByText("Ada Lovelace · ada@example.com")).toBeInTheDocument(),await B.click(d.getByRole("button",{name:"Clear"})),await c(a.onClear).toHaveBeenCalledTimes(1)}},r={args:{subject:m,verdict:y}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    subject: {
      status: 'loading',
      userId: user.id
    },
    verdict: null
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Reading the user/)).toBeInTheDocument();
    await expect(canvas.queryByText('Qualifies')).not.toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    subject: {
      status: 'failed',
      userId: user.id,
      reason: 'groups-failed'
    },
    verdict: null
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    subject: loaded,
    verdict: grantsVerdict
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ada Lovelace · ada@example.com')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear'
    }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    subject: loaded,
    verdict: excludedByUserVerdict
  }
}`,...r.parameters?.docs?.source}}};const L=["Loading","Failed","Qualifies","Excluded"];export{r as Excluded,s as Failed,t as Loading,n as Qualifies,L as __namedExportsOrder,U as default};
