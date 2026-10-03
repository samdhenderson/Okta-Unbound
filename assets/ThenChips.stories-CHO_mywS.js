import{T as o}from"./ThenChips-Bh2ZPFuf.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:r,fn:n,userEvent:i,within:c}=__STORYBOOK_MODULE_TEST__,a={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},w={title:"Home/Ask/ThenChips",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"The follow-ups a settled answer offers. Each reads as the question it asks, with `…` where the reader still chooses: a chip carries only what the answer established, never a counterpart picked for the reader."}}},args:{chips:[{verb:"compare",slots:{u1:a},activeSlot:"u2"},{verb:"access",slots:{u1:a},activeSlot:"tgt"}],onAsk:n()}},e={play:async({args:t,canvasElement:s})=>{await i.click(c(s).getByRole("button",{name:"Compare Joe Park with …"})),await r(t.onAsk).toHaveBeenCalledWith(t.chips[0])}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Compare Joe Park with …'
    }));
    await expect(args.onAsk).toHaveBeenCalledWith(args.chips[0]);
  }
}`,...e.parameters?.docs?.source},description:{story:"Two follow-ups, each leaving its counterpart open.",...e.parameters?.docs?.description}}};const k=["Default"];export{e as Default,k as __namedExportsOrder,w as default};
