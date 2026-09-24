import{M as o}from"./MissingGroupChip-BPaj6mVy.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,within:s}=__STORYBOOK_MODULE_TEST__,c={title:"Rules/MissingGroupChip",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"A rule target the org has no group for — a proven absence, so it takes a warning's weight. Distinct from `EntityLink`'s id-only mode, which says the name has not been loaded."}}},args:{groupId:"00gFAKEGONE001"}},e={play:async({canvasElement:t})=>{await n(s(t).getByText("Group no longer exists")).toBeInTheDocument()}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('Group no longer exists')).toBeInTheDocument();
  }
}`,...e.parameters?.docs?.source}}};const p=["Default"];export{e as Default,p as __namedExportsOrder,c as default};
