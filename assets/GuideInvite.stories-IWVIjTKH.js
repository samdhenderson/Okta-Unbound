import{G as r}from"./GuideInvite-D_pp1wv2.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:a,fn:s,userEvent:o,within:c}=__STORYBOOK_MODULE_TEST__,p={title:"Home/Concierge/GuideInvite",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"The welcome a new reader sees on Home: an invitation to the user guide that stays until it is answered."}}},args:{onOpenGuide:s(),onDismiss:s()}},e={play:async({args:n,canvasElement:i})=>{const t=c(i);await o.click(t.getByRole("button",{name:"Open the user guide"})),await a(n.onOpenGuide).toHaveBeenCalled(),await o.click(t.getByRole("button",{name:"Dismiss"})),await a(n.onDismiss).toHaveBeenCalled()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Open the user guide'
    }));
    await expect(args.onOpenGuide).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Dismiss'
    }));
    await expect(args.onDismiss).toHaveBeenCalled();
  }
}`,...e.parameters?.docs?.source},description:{story:"Both answers.",...e.parameters?.docs?.description}}};const u=["Default"];export{e as Default,u as __namedExportsOrder,p as default};
