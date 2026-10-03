import{A as p,I as c}from"./reducer-C7bPglpv.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./SlotPicker-0ZR16Ogn.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./oktaId-BKuZMWJR.js";import"./AttributePicker-DcO3jn5g.js";import"./slots-kY_j0TaM.js";import"./GrantingGroupPicker-BEsEc4BK.js";import"./HeldValuePicker-BwShd0te.js";import"./RunningLine-BJSVlGYi.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./CompareAnswerView-BjeNLZd8.js";import"./AnswerHeadline-1rdFjlxA.js";import"./AccessAnswerView-BHrNNcuO.js";import"./AccessPathList-xYLLiYDM.js";import"./BuildAnswerView-BHoBH5yx.js";import"./ComposeAnswerView-CFFjt3lz.js";import"./ComposeAttributeRow-FpGF-y2V.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./FindAnswerView-BXotIyHx.js";import"./ThenChips-Bh2ZPFuf.js";import"./EarlierList-xEe-rROv.js";import"./dateFormat-Db8QGh5_.js";const{expect:r,fn:e,userEvent:m,within:l}=__STORYBOOK_MODULE_TEST__,u={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},a={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"};function i(t,s={}){return{state:{...c,...t},verbs:["compare"],ready:!1,cost:"Takes no requests.",chips:[],history:[],suggestions:[],attributes:{status:"loading"},retryAttributes:e(),scoped:{kind:"none"},unscope:e(),pickVerb:e(),fill:e(),clear:e(),focusSlot:e(),run:e(),ask:e(),tap:e(),...s}}const q={title:"Home/Ask/AskTray",component:p,tags:["autodocs"],parameters:{docs:{description:{component:"The band under the sentence, in one mode at a time: the open slot’s picker, the running line, the answer with its follow-ups, a failure, or the questions asked earlier. The picker wins over a shown answer, because opening a slot is the reader moving on."}}},args:{ask:i({slots:{u1:u},activeSlot:"u2"},{suggestions:[{ref:a,source:"pin"}]}),searchers:{},pickerId:"picker",isActive:!0}},o={play:async({args:t,canvasElement:s})=>{await m.click(l(s).getByRole("button",{name:/Jon Ruiz/})),await r(t.ask.fill).toHaveBeenCalledWith("u2",a)}},n={args:{ask:i({activeSlot:null})},play:async({canvasElement:t})=>{await r(t.textContent).toBe("")}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: /Jon Ruiz/
    }));
    await expect(args.ask.fill).toHaveBeenCalledWith('u2', jon);
  }
}`,...o.parameters?.docs?.source},description:{story:"A slot open: the picker, filling through the hook.",...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      activeSlot: null
    })
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toBe('');
  }
}`,...n.parameters?.docs?.source},description:{story:"No slot open and nothing asked: the tray is not drawn.",...n.parameters?.docs?.description}}};const F=["Picking","Empty"];export{n as Empty,o as Picking,F as __namedExportsOrder,q as default};
