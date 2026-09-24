import{j as n}from"./iframe-mmN7AxbW.js";import{Q as c}from"./QualificationSubjectStatus-C8GNQ5uy.js";import"./preload-helper-PPVm8Dsz.js";const{expect:d,within:u}=__STORYBOOK_MODULE_TEST__,m={title:"Qualification/QualificationSubjectStatus",component:c,tags:["autodocs"],parameters:{docs:{description:{component:"The non-verdict states of a subject load: a spinner while the two requests run, a danger alert naming the leg that failed. Never a verdict — absent is not zero."}}},decorators:[e=>n.jsx("div",{className:"max-w-md p-4",children:n.jsx(e,{})})]},s={args:{state:{status:"loading",userId:"00uFAKEQUAL001"}}},t={args:{state:{status:"failed",userId:"00uFAKEQUAL001",reason:"user-not-found"}},play:async({canvasElement:e})=>{await d(u(e).getByText(/could not be loaded/)).toBeInTheDocument()}},r={args:{state:{status:"failed",userId:"00uFAKEQUAL001",reason:"groups-failed"}}},o={args:{state:{status:"failed",userId:"00uFAKEQUAL001",reason:"no-tab"}}},a={args:{state:{status:"idle"}},play:async({canvasElement:e})=>{await d(e.querySelector('[role="alert"]')).toBeNull()}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: 'loading',
      userId: '00uFAKEQUAL001'
    }
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: 'failed',
      userId: '00uFAKEQUAL001',
      reason: 'user-not-found'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText(/could not be loaded/)).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: 'failed',
      userId: '00uFAKEQUAL001',
      reason: 'groups-failed'
    }
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: 'failed',
      userId: '00uFAKEQUAL001',
      reason: 'no-tab'
    }
  }
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: {
      status: 'idle'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.querySelector('[role="alert"]')).toBeNull();
  }
}`,...a.parameters?.docs?.source},description:{story:"Idle and loaded render nothing here — the report owns the loaded state.",...a.parameters?.docs?.description}}};const g=["Loading","UserNotFound","GroupsFailed","NoTab","Idle"];export{r as GroupsFailed,a as Idle,s as Loading,o as NoTab,t as UserNotFound,g as __namedExportsOrder,m as default};
