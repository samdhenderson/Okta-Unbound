import{j as u,a4 as N}from"./iframe-mmN7AxbW.js";import{G as T}from"./GroupUserReport-Dksj59Lj.js";import{a as y}from"./qualification-cO_gjK9U.js";import{r as B,g as O,u as b,a as E,S,s as h,b as a,E as v,U as I}from"./storyFixtures-D5ilZVaO.js";import"./preload-helper-PPVm8Dsz.js";import"./RuleUserReport-Dw4FGkEi.js";import"./MissingGroupChip-BPaj6mVy.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:n,fn:R,within:r}=__STORYBOOK_MODULE_TEST__,w={id:S,type:"OKTA_GROUP"},A=a({id:"0prFAKEGRANT01",name:"Engineers into SecOps"}),l=a({id:"0prFAKEBLOCK01",name:"Directors into SecOps",conditionExpression:'user.title == "Director"'}),U=a({id:"0prFAKEUNDEC01",name:"Senior staff into SecOps",conditionExpression:"user.employeeNumber > 5"}),D=a({id:"0prFAKEEXCL01",name:"Everyone but Ada",excludedUserIds:[I]}),m=e=>y({group:w,feedingRules:e,subject:h,groupNames:E}),L={title:"Qualification/GroupUserReport",component:T,tags:["autodocs"],parameters:{docs:{description:{component:"One group × one user: the provenance-first verdict as a mark and a sentence, then every rule feeding the group as a compact `RuleUserReport`, granting rules first.\n\nThe kinds that carry no rules — app-managed, inventory unavailable, no feeding rule — render the sentence alone: the absence is the answer."}}},decorators:[e=>u.jsx(N,{handlers:{group:R()},children:u.jsx("div",{className:"max-w-md p-4",children:u.jsx(e,{})})})],args:{groupName:"SecOps",user:b,groupContext:O,resolveGroupName:B}},t={args:{verdict:m([l,A])},play:async({canvasElement:e})=>{const g=r(e);await n(g.getByText(/An active rule qualifies this user/)).toBeInTheDocument();const f=g.getAllByRole("article").map(x=>x.getAttribute("aria-label"));await n(f).toEqual(["Engineers into SecOps","Directors into SecOps"])}},s={args:{verdict:m([l,D])},play:async({canvasElement:e})=>{await n(r(e).getByText("Not qualified")).toBeInTheDocument()}},o={args:{verdict:m([U,l])},play:async({canvasElement:e})=>{await n(r(e).getByText(/at least one could not be determined/)).toBeInTheDocument()}},i={args:{verdict:y({group:{id:v,type:"OKTA_GROUP"},feedingRules:[a({groupIds:[v]})],subject:h,groupNames:E}),groupName:"Engineering"},play:async({canvasElement:e})=>{await n(r(e).getByText("This user is a member of Engineering today.")).toBeInTheDocument()}},c={args:{verdict:{kind:"app-managed"},groupName:"Salesforce Users"}},d={args:{verdict:{kind:"inventory-unavailable"}}},p={args:{verdict:{kind:"no-feeding-rule"}},play:async({canvasElement:e})=>{await n(r(e).queryByRole("article")).not.toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: verdictOf([blocks, grants])
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/An active rule qualifies this user/)).toBeInTheDocument();
    // Granting rule first, whatever order the inventory held them in.
    const names = canvas.getAllByRole('article').map(a => a.getAttribute('aria-label'));
    await expect(names).toEqual(['Engineers into SecOps', 'Directors into SecOps']);
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: verdictOf([blocks, excludes])
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('Not qualified')).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: verdictOf([undecided, blocks])
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText(/at least one could not be determined/)).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: assessGroupForUser({
      group: {
        id: ENGINEERING,
        type: 'OKTA_GROUP'
      },
      feedingRules: [rule({
        groupIds: [ENGINEERING]
      })],
      subject,
      groupNames
    }),
    groupName: 'Engineering'
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('This user is a member of Engineering today.')).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: {
      kind: 'app-managed'
    },
    groupName: 'Salesforce Users'
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: {
      kind: 'inventory-unavailable'
    }
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: {
      kind: 'no-feeding-rule'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('article')).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}};const Q=["WouldBeAdded","NotQualified","Undetermined","AlreadyMember","AppManaged","InventoryUnavailable","NoFeedingRule"];export{i as AlreadyMember,c as AppManaged,d as InventoryUnavailable,p as NoFeedingRule,s as NotQualified,o as Undetermined,t as WouldBeAdded,Q as __namedExportsOrder,L as default};
