import{j as i,a4 as m}from"./iframe-mmN7AxbW.js";import{G as g}from"./GroupUserCheckSection-VdiqvWze.js";import{a as h}from"./qualification-cO_gjK9U.js";import{r as v,u as c,g as x,a as y,S as w,b as d,s as f}from"./storyFixtures-D5ilZVaO.js";import"./preload-helper-PPVm8Dsz.js";import"./GroupUserReport-Dksj59Lj.js";import"./RuleUserReport-Dw4FGkEi.js";import"./MissingGroupChip-BPaj6mVy.js";import"./QualificationSubjectStatus-C8GNQ5uy.js";import"./userDisplay-xpx41Abi.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:n,fn:u,within:p}=__STORYBOOK_MODULE_TEST__,l={status:"loaded",userId:c.id,user:c,groups:[],groupContext:x},B=h({group:{id:w,type:"OKTA_GROUP"},feedingRules:[d({id:"0prFAKEGRANT01",name:"Engineers into SecOps"}),d({id:"0prFAKEBLOCK01",name:"Directors into SecOps",conditionExpression:'user.title == "Director"'})],subject:f,groupNames:y}),L={title:"Groups/GroupUserCheckSection",component:g,tags:["autodocs"],parameters:{docs:{description:{component:"The group rung's answer to \"why isn't X a member?\": a `DetailSection` naming the subject, holding the load status, the wait for the feeding rules, or the `GroupUserReport`, with its own Clear. Mounted between the strip and the tabs so it survives a tab switch."}}},decorators:[t=>i.jsx(m,{handlers:{group:u()},children:i.jsx("div",{className:"max-w-md p-4",children:i.jsx(t,{})})})],args:{groupName:"SecOps",onClear:u(),resolveGroupName:v}},s={args:{subject:{status:"loading",userId:c.id},check:{kind:"none"}}},a={args:{subject:l,check:{kind:"pending"}},play:async({canvasElement:t})=>{const e=p(t);await n(e.getByText(/Waiting for the feeding rules/)).toBeInTheDocument(),await n(e.queryByRole("article")).not.toBeInTheDocument()}},r={args:{subject:l,check:{kind:"verdict",verdict:B}},play:async({canvasElement:t})=>{const e=p(t);await n(e.getByText("Ada Lovelace · ada@example.com")).toBeInTheDocument(),await n(e.getByText(/An active rule qualifies this user/)).toBeInTheDocument(),await n(e.getAllByRole("article")).toHaveLength(2)}},o={args:{subject:{status:"failed",userId:c.id,reason:"user-not-found"},check:{kind:"none"}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    subject: {
      status: 'loading',
      userId: user.id
    },
    check: {
      kind: 'none'
    }
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    subject: loaded,
    check: {
      kind: 'pending'
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Waiting for the feeding rules/)).toBeInTheDocument();
    await expect(canvas.queryByRole('article')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Subject loaded, feeding rules still loading: the wait is stated, no verdict.",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    subject: loaded,
    check: {
      kind: 'verdict',
      verdict
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ada Lovelace · ada@example.com')).toBeInTheDocument();
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
    await expect(canvas.getAllByRole('article')).toHaveLength(2);
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    subject: {
      status: 'failed',
      userId: user.id,
      reason: 'user-not-found'
    },
    check: {
      kind: 'none'
    }
  }
}`,...o.parameters?.docs?.source}}};const C=["Loading","WaitingForRules","Verdict","Failed"];export{o as Failed,s as Loading,r as Verdict,a as WaitingForRules,C as __namedExportsOrder,L as default};
