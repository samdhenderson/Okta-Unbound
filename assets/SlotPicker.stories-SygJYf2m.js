import{S as m}from"./SlotPicker-0ZR16Ogn.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./oktaId-BKuZMWJR.js";const{expect:c,fn:p,userEvent:i,within:l}=__STORYBOOK_MODULE_TEST__,u={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"},o={kind:"user",id:"00uFAKE0000000000003",name:"Ana Silva"},k={title:"Home/Ask/SlotPicker",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"The picker for one entity slot. It suggests what the reader has been near — the open page, pins, recents — and never fills the slot itself: the reader taps, or types to search with the same type-ahead the jump bar uses."}}},args:{id:"picker",kind:"user",suggestions:[{ref:u,source:"pin"},{ref:o,source:"recent"}],enabled:!0,autoFocus:!0,filled:!1,onPick:p(),onClear:p()}},n={play:async({args:e,canvasElement:a})=>{await i.click(l(a).getByRole("button",{name:/Jon Ruiz/})),await c(e.onPick).toHaveBeenCalledWith(u)}},s={args:{suggestions:[]}},t={args:{suggestions:[],search:async()=>[{kind:"user",id:o.id,name:o.name,secondary:"ana@example.com"}]},play:async({args:e,canvasElement:a})=>{const d=l(a);await i.type(d.getByRole("searchbox",{name:"Search users"}),"ana"),await i.click(await d.findByRole("button",{name:"Ana Silva"},{timeout:3e3})),await c(e.onPick).toHaveBeenCalledWith(o)}},r={args:{filled:!0},play:async({args:e,canvasElement:a})=>{await i.click(l(a).getByRole("button",{name:"Clear user"})),await c(e.onClear).toHaveBeenCalledTimes(1)}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: /Jon Ruiz/
    }));
    await expect(args.onPick).toHaveBeenCalledWith(jon);
  }
}`,...n.parameters?.docs?.source},description:{story:"Pins and recents offered as taps.",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    suggestions: []
  }
}`,...s.parameters?.docs?.source},description:{story:"Nothing to suggest yet.",...s.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    suggestions: [],
    search: async () => [{
      kind: 'user',
      id: ana.id,
      name: ana.name,
      secondary: 'ana@example.com'
    }]
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', {
      name: 'Search users'
    }), 'ana');
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Ana Silva'
    }, {
      timeout: 3000
    }));
    await expect(args.onPick).toHaveBeenCalledWith(ana);
  }
}`,...t.parameters?.docs?.source},description:{story:"A typed search, answered.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    filled: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Clear user'
    }));
    await expect(args.onClear).toHaveBeenCalledTimes(1);
  }
}`,...r.parameters?.docs?.source},description:{story:"A filled slot can be cleared from here.",...r.parameters?.docs?.description}}};const S=["Suggestions","NothingToSuggest","SearchResults","Filled"];export{r as Filled,s as NothingToSuggest,t as SearchResults,n as Suggestions,S as __namedExportsOrder,k as default};
