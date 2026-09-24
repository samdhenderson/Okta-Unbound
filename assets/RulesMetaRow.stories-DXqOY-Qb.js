import{R as o}from"./RulesMetaRow-CMRjTvMh.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:a,within:n}=__STORYBOOK_MODULE_TEST__,p={title:"Rules/RulesMetaRow",component:o,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"What the last load cost in API requests. There is no cached-at chip: a stale list is refetched by hand, so the timestamp only spent a row. Renders nothing when the cost is unknown — a load served from cache cost nothing this session."}}},argTypes:{apiCost:{description:"API requests the last load cost, or null when unknown."}},args:{apiCost:12}},t={play:async({canvasElement:s})=>{await a(n(s).getByText("12")).toBeInTheDocument()}},e={args:{apiCost:null}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('12')).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    apiCost: null
  }
}`,...e.parameters?.docs?.source},description:{story:"Cost unknown — the component renders null.",...e.parameters?.docs?.description}}};const l=["Default","Empty"];export{t as Default,e as Empty,l as __namedExportsOrder,p as default};
