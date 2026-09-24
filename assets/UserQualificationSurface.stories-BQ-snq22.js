import{j as i,a4 as l}from"./iframe-mmN7AxbW.js";import{U as g}from"./UserQualificationSurface-D7WBRWn6.js";import{a as v}from"./qualification-cO_gjK9U.js";import{E as T,u as y,c as f,S as m,b as d,d as x,a as B,s as w}from"./storyFixtures-D5ilZVaO.js";import"./preload-helper-PPVm8Dsz.js";import"./GroupUserReport-Dksj59Lj.js";import"./RuleUserReport-Dw4FGkEi.js";import"./MissingGroupChip-BPaj6mVy.js";import"./groupContext-D0LcfWax.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:t,fn:p,within:c}=__STORYBOOK_MODULE_TEST__,b=[{group:{id:T,type:"OKTA_GROUP",profile:{name:"Engineering"}},membershipType:"DIRECT",rules:[],attribution:"exact"}],h=(e={})=>({...d(),groupIds:[m],condition:'user.department == "Engineering"',userAttributes:["department"],created:"2024-01-01T00:00:00.000Z",lastUpdated:"2025-01-01T00:00:00.000Z",...e}),u={id:m,name:"SecOps",description:"",type:"OKTA_GROUP"},G={title:"Users/UserQualificationSurface",component:g,tags:["autodocs"],parameters:{docs:{description:{component:"The user rung's answer to *Check rule* / *Check membership*: a `DetailSection` between the strip and the panes over the rung's own user, with its own Clear. `pending` states the input still loading and never a verdict."}}},decorators:[e=>i.jsx(l,{handlers:{group:p()},children:i.jsx("div",{className:"max-w-md p-4",children:i.jsx(e,{})})})],args:{user:y,memberships:b,onClear:p()}},a={args:{check:{kind:"rule",rule:h(),verdict:f}},play:async({canvasElement:e})=>{const n=c(e);await t(n.getByText("Against rule: Engineers into SecOps")).toBeInTheDocument(),await t(n.getByText("Qualifies")).toBeInTheDocument()}},r={args:{check:{kind:"rule",rule:h(),verdict:x}}},o={args:{check:{kind:"group",group:u,verdict:v({group:u,feedingRules:[d()],subject:w,groupNames:B})}},play:async({canvasElement:e})=>{const n=c(e);await t(n.getByText("Membership of SecOps")).toBeInTheDocument(),await t(n.getByText(/An active rule qualifies this user/)).toBeInTheDocument()}},s={args:{check:{kind:"pending",reason:"memberships"},memberships:void 0},play:async({canvasElement:e})=>{const n=c(e);await t(n.getByText(/Waiting for the user's memberships/)).toBeInTheDocument(),await t(n.queryByText("Qualifies")).not.toBeInTheDocument()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    check: {
      kind: 'rule',
      rule: formatted(),
      verdict: grantsVerdict
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Against rule: Engineers into SecOps')).toBeInTheDocument();
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    check: {
      kind: 'rule',
      rule: formatted(),
      verdict: doesNotMatchVerdict
    }
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    check: {
      kind: 'group',
      group: secops,
      verdict: assessGroupForUser({
        group: secops,
        feedingRules: [rule()],
        subject,
        groupNames
      })
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Membership of SecOps')).toBeInTheDocument();
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    check: {
      kind: 'pending',
      reason: 'memberships'
    },
    memberships: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Waiting for the user's memberships/)).toBeInTheDocument();
    await expect(canvas.queryByText('Qualifies')).not.toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"Asked before the memberships landed: the wait is stated, no verdict is shown.",...s.parameters?.docs?.description}}};const j=["AgainstARule","RuleDoesNotMatch","WhyNotInAGroup","PendingMemberships"];export{a as AgainstARule,s as PendingMemberships,r as RuleDoesNotMatch,o as WhyNotInAGroup,j as __namedExportsOrder,G as default};
