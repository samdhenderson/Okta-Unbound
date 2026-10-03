import{E as r}from"./EarlierList-xEe-rROv.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./dateFormat-Db8QGh5_.js";const{expect:i,fn:c,userEvent:l,within:m}=__STORYBOOK_MODULE_TEST__,a={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},n={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"},s=3600*1e3,w={title:"Home/Ask/EarlierList",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Questions recently asked in this org. Only the question is kept, never its answer, so asking again reads again."}}},args:{entries:[{verb:"compare",slots:{u1:a,u2:n},askedAt:Date.now()-2*s},{verb:"compare",slots:{u1:n,u2:a},askedAt:Date.now()-50*s}],onAsk:c()}},e={play:async({args:t,canvasElement:o})=>{await l.click(m(o).getAllByRole("button",{name:"Ask again"})[0]),await i(t.onAsk).toHaveBeenCalledWith(t.entries[0])}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getAllByRole('button', {
      name: 'Ask again'
    })[0] as HTMLElement);
    await expect(args.onAsk).toHaveBeenCalledWith(args.entries[0]);
  }
}`,...e.parameters?.docs?.source},description:{story:"Two questions from earlier.",...e.parameters?.docs?.description}}};const v=["Default"];export{e as Default,v as __namedExportsOrder,w as default};
