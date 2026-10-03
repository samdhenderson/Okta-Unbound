import{R as d}from"./RuleTargetPicker-Ddrs_JwX.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./useDebouncedValue-CPDJ-sEe.js";const{expect:n,fn:r,userEvent:s,within:l}=__STORYBOOK_MODULE_TEST__,i="00gFAKE00000000MGR01",o="00gFAKE00000000ENG01",E={title:"Rules/RuleTargetPicker",component:d,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"`SearchDropdown` over the org’s groups. Results render in flow, pushing the card’s footer down rather than covering it. Groups already on the rule or staged are left out, so a pick is always a real addition."}}},args:{searchGroups:r(async()=>[{id:o,name:"Engineering - All",type:"OKTA_GROUP"},{id:i,name:"Engineering Managers",type:"OKTA_GROUP"}]),takenIds:new Set([o]),onPick:r()},argTypes:{searchGroups:{description:"Search the org’s groups by name."},takenIds:{description:"Ids already on the rule or staged, left out of the results."},onPick:{description:"Stage the picked group."}}},e={},a={play:async({canvasElement:c,args:p})=>{const t=l(c);await s.type(t.getByPlaceholderText("Search groups by name…"),"eng");const g=await t.findByText("Engineering Managers");await n(t.queryByText("Engineering - All")).not.toBeInTheDocument(),await s.click(g),await n(p.onPick).toHaveBeenCalledWith({id:i,name:"Engineering Managers"})}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source},description:{story:"Empty, waiting for a name.",...e.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Search groups by name…'), 'eng');
    const hit = await canvas.findByText('Engineering Managers');
    await expect(canvas.queryByText('Engineering - All')).not.toBeInTheDocument();
    await userEvent.click(hit);
    await expect(args.onPick).toHaveBeenCalledWith({
      id: MGR,
      name: 'Engineering Managers'
    });
  }
}`,...a.parameters?.docs?.source},description:{story:"A search: the group already on the rule is left out, and a pick stages the other.",...a.parameters?.docs?.description}}};const w=["Default","Results"];export{e as Default,a as Results,w as __namedExportsOrder,E as default};
