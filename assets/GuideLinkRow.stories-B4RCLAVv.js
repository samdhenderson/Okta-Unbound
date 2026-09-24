import{G as s}from"./GuideLinkRow-Dd4iUFjj.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./githubLinks-BfCtNl-2.js";const{expect:t,fn:i,userEvent:c,within:d}=__STORYBOOK_MODULE_TEST__,h={title:"Home/GuideLinkRow",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"The last row on Home: a `link` button that opens the user guide, and an anchor to a pre-titled GitHub issue for feedback. No card chrome; it sits under the reports card as a quiet line of two phrases."}}},args:{onOpenGuide:i()}},e={play:async({canvasElement:o,args:r})=>{const a=d(o);await c.click(a.getByRole("button",{name:"User guide"})),await t(r.onOpenGuide).toHaveBeenCalledTimes(1);const n=a.getByRole("link",{name:"Send feedback"});await t(n).toHaveAttribute("rel","noopener noreferrer"),await t(n.getAttribute("href")).toMatch(/\/issues\/new\?title=Feedback/)}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'User guide'
    }));
    await expect(args.onOpenGuide).toHaveBeenCalledTimes(1);
    const feedback = canvas.getByRole('link', {
      name: 'Send feedback'
    });
    await expect(feedback).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(feedback.getAttribute('href')).toMatch(/\\/issues\\/new\\?title=Feedback/);
  }
}`,...e.parameters?.docs?.source},description:{story:"Both links present; the guide button reports through its handler, the feedback link is a real anchor.",...e.parameters?.docs?.description}}};const b=["Default"];export{e as Default,b as __namedExportsOrder,h as default};
