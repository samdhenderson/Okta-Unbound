import{R as y}from"./RulePickerModal-DxTkSrVU.js";import{b as c}from"./storyFixtures-D5ilZVaO.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./qualification-cO_gjK9U.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./ruleAssessment-CTkD-VAM.js";const{expect:n,fn:u,userEvent:i,within:l}=__STORYBOOK_MODULE_TEST__,p=[c({id:"0prFAKE1",name:"Engineers into SecOps"}),c({id:"0prFAKE2",name:"Directors into Leadership",status:"INACTIVE"}),c({id:"0prFAKE3",name:"Contractors into Contractors",status:"INVALID"})],R={title:"Qualification/RulePickerModal",component:y,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Pick one rule from the inventory the rung already holds — a local name filter, zero requests. Inactive and invalid rules are listed with their status: checking a user against a rule that places nobody is still a question with an answer."}}},args:{isOpen:!0,onClose:u(),onPick:u(),rules:p}},t={play:async({canvasElement:a,args:e})=>{const m=l(a.ownerDocument.body);await n(m.getByRole("list",{name:"Rules"}).children).toHaveLength(3),await i.click(m.getByRole("button",{name:/Engineers into SecOps/})),await n(e.onPick).toHaveBeenCalledWith(p[0])}},o={play:async({canvasElement:a})=>{const e=l(a.ownerDocument.body);await i.type(e.getByRole("searchbox",{name:"Filter rules by name"}),"dir"),await n(e.getByRole("list",{name:"Rules"}).children).toHaveLength(1),await n(e.getByText("Inactive")).toBeInTheDocument()}},s={play:async({canvasElement:a})=>{const e=l(a.ownerDocument.body);await i.type(e.getByRole("searchbox",{name:"Filter rules by name"}),"zzz"),await n(e.getByText(/No rule name contains/)).toBeInTheDocument()}},r={args:{rules:[]}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('list', {
      name: 'Rules'
    }).children).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', {
      name: /Engineers into SecOps/
    }));
    await expect(args.onPick).toHaveBeenCalledWith(rules[0]);
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.type(canvas.getByRole('searchbox', {
      name: 'Filter rules by name'
    }), 'dir');
    await expect(canvas.getByRole('list', {
      name: 'Rules'
    }).children).toHaveLength(1);
    await expect(canvas.getByText('Inactive')).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await userEvent.type(canvas.getByRole('searchbox', {
      name: 'Filter rules by name'
    }), 'zzz');
    await expect(canvas.getByText(/No rule name contains/)).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    rules: []
  }
}`,...r.parameters?.docs?.source}}};const x=["Default","Filtered","NoMatch","EmptyInventory"];export{t as Default,r as EmptyInventory,o as Filtered,s as NoMatch,x as __namedExportsOrder,R as default};
