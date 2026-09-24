import{j as h,a4 as y}from"./iframe-mmN7AxbW.js";import{R as T}from"./RuleUserReport-Dw4FGkEi.js";import{r as x,g as v,u as B,c as w,i as D,d as g,e as I,f as E,h as f,n as V,j as N,m as b}from"./storyFixtures-D5ilZVaO.js";import"./preload-helper-PPVm8Dsz.js";import"./MissingGroupChip-BPaj6mVy.js";import"./qualification-cO_gjK9U.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:a,fn:M,within:n}=__STORYBOOK_MODULE_TEST__,Q={title:"Qualification/RuleUserReport",component:T,tags:["autodocs"],parameters:{docs:{description:{component:`One rule × one user: the **qualification** headline, then the evidence — the rule's status when inactive, how the rule excludes the user when it does, the clause ledger, and a row per target group saying whether the user already holds it.

The ledger's own chip is the *condition*; the headline is the *qualification*. They legitimately differ (a match under an exclusion, a match on an inactive rule) and neither is rewritten to agree with the other.`}}},decorators:[e=>h.jsx(y,{handlers:{group:M()},children:h.jsx("div",{className:"max-w-md p-4",children:h.jsx(e,{})})})],args:{user:B,groupContext:v,resolveGroupName:x}},m={args:{verdict:w},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Qualifies")).toBeInTheDocument(),await a(t.getByText("Rule matches this user")).toBeInTheDocument(),await a(t.getByText("Not a member")).toBeInTheDocument()}},s={args:{verdict:D},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Inactive")).toBeInTheDocument(),await a(t.getByText("Rule matches this user")).toBeInTheDocument()}},u={args:{verdict:g}},r={args:{verdict:I},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Excluded")).toBeInTheDocument(),await a(t.getByText("Named on the rule's exclusion list.")).toBeInTheDocument(),await a(t.getByText("Rule matches this user")).toBeInTheDocument()}},p={args:{verdict:E},play:async({canvasElement:e})=>{await a(n(e).getByText("A member of a group the rule excludes.")).toBeInTheDocument()}},o={args:{verdict:f},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Not determined")).toBeInTheDocument(),await a(t.queryByText("Does not match")).not.toBeInTheDocument()}},l={args:{verdict:V},play:async({canvasElement:e})=>{await a(n(e).getByText("This rule has no condition expression to explain.")).toBeInTheDocument()}},c={args:{verdict:N},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Member")).toBeInTheDocument(),await a(t.getByText("Not a member")).toBeInTheDocument()}},i={args:{verdict:b},play:async({canvasElement:e})=>{await a(n(e).getByText("Group no longer exists")).toBeInTheDocument()}},d={args:{verdict:g,compact:!0},play:async({canvasElement:e})=>{const t=n(e);await a(t.getByText("Engineers into SecOps")).toBeInTheDocument(),await a(t.getByRole("button",{name:/Condition/})).toBeInTheDocument()}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: grantsVerdict
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
    await expect(canvas.getByText('Not a member')).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: inactiveVerdict
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"The condition matches; the rule places nobody today. Two marks, one truth.",...s.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: doesNotMatchVerdict
  }
}`,...u.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: excludedByUserVerdict
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Excluded')).toBeInTheDocument();
    await expect(canvas.getByText("Named on the rule's exclusion list.")).toBeInTheDocument();
    await expect(canvas.getByText('Rule matches this user')).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"The headline says excluded; the ledger still says the condition matches.",...r.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: excludedByGroupVerdict
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('A member of a group the rule excludes.')).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: undeterminedVerdict
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Not determined')).toBeInTheDocument();
    await expect(canvas.queryByText('Does not match')).not.toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:'A string compared as a number: never rounded to "does not match".',...o.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: noConditionVerdict
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('This rule has no condition expression to explain.')).toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: alreadyMemberVerdict
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Member')).toBeInTheDocument();
    await expect(canvas.getByText('Not a member')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"One target already held, one not — read from the complete list.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: missingTargetVerdict
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('Group no longer exists')).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:"A target the org no longer has, per the producer's verdict.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    verdict: doesNotMatchVerdict,
    compact: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Engineers into SecOps')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: /Condition/
    })).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"The shape used inside a group report: the name leads, the ledger folds.",...d.parameters?.docs?.description}}};const q=["Qualifies","InactiveWouldMatch","DoesNotMatch","ExcludedByUser","ExcludedByGroup","Undetermined","NoCondition","AlreadyMemberOfOneTarget","MissingTarget","Compact"];export{c as AlreadyMemberOfOneTarget,d as Compact,u as DoesNotMatch,p as ExcludedByGroup,r as ExcludedByUser,s as InactiveWouldMatch,i as MissingTarget,l as NoCondition,m as Qualifies,o as Undetermined,q as __namedExportsOrder,Q as default};
