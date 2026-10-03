import{j as s}from"./iframe-Pee757m_.js";import{S as p}from"./Sentence-f34hhmJK.js";import"./preload-helper-PPVm8Dsz.js";import"./SlotPill-eK_fGwgC.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:n,fn:m,userEvent:d,within:l}=__STORYBOOK_MODULE_TEST__,c={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},w={title:"Home/Ask/Sentence",component:p,tags:["autodocs"],decorators:[r=>s.jsxs(s.Fragment,{children:[s.jsx(r,{}),s.jsx("div",{id:"picker"})]})],parameters:{docs:{description:{component:"The Ask question as a sentence, read straight off the verb’s grammar: fixed words, and a `SlotPill` for every hole. Keyed on the verb, so a verb change re-forms it word by word."}}},args:{verb:"compare",slots:{},activeSlot:"u1",pickerId:"picker",onToggleSlot:m()}},e={},t={args:{slots:{u1:c},activeSlot:"u2"},play:async({args:r,canvasElement:i})=>{const a=l(i);await n(a.getByText("Joe Park")).toBeInTheDocument(),await d.click(a.getByRole("button",{name:/Choose user/})),await n(r.onToggleSlot).toHaveBeenCalledWith("u2")}},o={args:{verb:"access",slots:{u1:c},activeSlot:"tgt"}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source},description:{story:"Compare, nothing chosen yet.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    slots: {
      u1: joe
    },
    activeSlot: 'u2'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Joe Park')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: /Choose user/
    }));
    await expect(args.onToggleSlot).toHaveBeenCalledWith('u2');
  }
}`,...t.parameters?.docs?.source},description:{story:"Compare with the page’s user filled; the counterpart is the reader’s to choose.",...t.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    verb: 'access',
    slots: {
      u1: joe
    },
    activeSlot: 'tgt'
  }
}`,...o.parameters?.docs?.source},description:{story:"Access, the user filled and the app open.",...o.parameters?.docs?.description}}};const C=["CompareEmpty","CompareCounterpartOpen","Access"];export{o as Access,t as CompareCounterpartOpen,e as CompareEmpty,C as __namedExportsOrder,w as default};
