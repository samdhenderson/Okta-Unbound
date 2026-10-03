import{j as s}from"./iframe-Pee757m_.js";import{S as d}from"./SlotPill-eK_fGwgC.js";import"./preload-helper-PPVm8Dsz.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:i,fn:l,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,A={title:"Home/Ask/SlotPill",component:d,tags:["autodocs"],decorators:[e=>s.jsxs(s.Fragment,{children:[s.jsx(e,{}),s.jsx("div",{id:"picker"})]})],parameters:{docs:{description:{component:"One hole in an Ask sentence. Empty, it is dashed and reads its placeholder; filled, it carries a kind-tinted monogram and the value’s name. The control is a `StretchedButton`, which reports the open picker as `aria-expanded`."}}},args:{kind:"user",placeholder:"someone",active:!1,pickerId:"picker",onToggle:l()}},a={play:async({args:e,canvasElement:o})=>{const c=p(o).getByRole("button",{name:/Choose user/});await i(c).toHaveAttribute("aria-expanded","false"),await m.click(c),await i(e.onToggle).toHaveBeenCalledTimes(1)}},t={args:{active:!0},play:async({canvasElement:e})=>{const o=p(e).getByRole("button",{name:/Choose user/});await i(o).toHaveAttribute("aria-expanded","true")}},n={args:{value:{kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"}}},r={args:{kind:"app",placeholder:"an app",value:{kind:"app",id:"0oaFAKE0000000000001",name:"Salesforce"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: /Choose user/
    });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    await expect(args.onToggle).toHaveBeenCalledTimes(1);
  }
}`,...a.parameters?.docs?.source},description:{story:"An empty slot, waiting for the reader.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    active: true
  },
  play: async ({
    canvasElement
  }) => {
    const button = within(canvasElement).getByRole('button', {
      name: /Choose user/
    });
    await expect(button).toHaveAttribute('aria-expanded', 'true');
  }
}`,...t.parameters?.docs?.source},description:{story:"An empty slot with its picker open: primary dashes and a caret.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: {
      kind: 'user',
      id: '00uFAKE0000000000001',
      name: 'Joe Park'
    }
  }
}`,...n.parameters?.docs?.source},description:{story:"A filled user slot.",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    kind: 'app',
    placeholder: 'an app',
    value: {
      kind: 'app',
      id: '0oaFAKE0000000000001',
      name: 'Salesforce'
    }
  }
}`,...r.parameters?.docs?.source},description:{story:"A filled app slot — square monogram, warning tint.",...r.parameters?.docs?.description}}};const x=["Empty","EmptyActive","FilledUser","FilledApp"];export{a as Empty,t as EmptyActive,r as FilledApp,n as FilledUser,x as __namedExportsOrder,A as default};
