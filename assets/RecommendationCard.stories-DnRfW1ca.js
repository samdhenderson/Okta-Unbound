import{R as r}from"./RecommendationCard-DJVvo1S8.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,fn:c,userEvent:i,within:d}=__STORYBOOK_MODULE_TEST__,m={title:"Home/Concierge/RecommendationCard",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"One concierge card: the question, and beneath it what running it spends or what the reader still chooses. The whole row is the button."}}},args:{text:"What’s inside Engineering?",how:"Seven pages of members, 200 to a page.",icon:"chart",onChoose:c()}},e={play:async({args:o,canvasElement:s})=>{const a=d(s).getByRole("button",{name:o.text});await n(a).toHaveAccessibleDescription(o.how),await i.click(a),await n(o.onChoose).toHaveBeenCalled()}},t={args:{text:"What’s inside a group that grants Salesforce — Sales Cloud (Production, EMEA)?",how:"You choose a group."}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const button = within(canvasElement).getByRole('button', {
      name: args.text
    });
    await expect(button).toHaveAccessibleDescription(args.how);
    await userEvent.click(button);
    await expect(args.onChoose).toHaveBeenCalled();
  }
}`,...e.parameters?.docs?.source},description:{story:"The row is one button, named by the question and described by its cost.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'What’s inside a group that grants Salesforce — Sales Cloud (Production, EMEA)?',
    how: 'You choose a group.'
  }
}`,...t.parameters?.docs?.source},description:{story:"A long question wraps rather than truncating.",...t.parameters?.docs?.description}}};const l=["Default","LongText"];export{e as Default,t as LongText,l as __namedExportsOrder,m as default};
