import{j as m}from"./iframe-Pee757m_.js";import{R as h}from"./RuleTargetRow-UTy4fshw.js";import"./preload-helper-PPVm8Dsz.js";import"./ruleTargetFacts-DKSE0DP8.js";const{expect:g,fn:p,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,e="00gFAKE00000000CON01",C={title:"Rules/RuleTargetRow",component:h,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"A target group in edit mode, on `ListRow`. A kept row offers ✕ (and, once the move flow is wired, a move). A staged addition is `added`-toned with an **Added** badge and what it does to people; ✕ unstages it. A staged removal is `removed`-toned, its name struck through, with a **Removed** badge, its consequence, and **Undo**. An unnamed group says so and shows its id; it is never named by its id."}}},decorators:[o=>m.jsx("ul",{className:"space-y-(--sp-inline)",children:m.jsx(o,{})})],args:{group:{id:e,name:"Contractors"},change:"kept",onRemove:p(),onRestore:p()},argTypes:{group:{description:"The group this row shows."},change:{description:"Where it stands in the draft.",control:"inline-radio",options:["kept","added","removed"]},onRemove:{description:"Stage a removal, or unstage an addition."},onRestore:{description:"Put a staged removal back."},onMove:{description:"Move the group to another rule. Omitted, the control is absent."}}},a={play:async({canvasElement:o,args:d})=>{const c=u(o);await l.click(c.getByRole("button",{name:"Remove Contractors from this rule"})),await g(d.onRemove).toHaveBeenCalledWith(e)}},t={args:{change:"added",group:{id:e,name:"Engineering Managers"}}},n={args:{change:"removed"},play:async({canvasElement:o,args:d})=>{const c=u(o);await l.click(c.getByRole("button",{name:"Undo removing Contractors"})),await g(d.onRestore).toHaveBeenCalledWith(e)}},s={args:{group:{id:e}}},r={args:{group:{id:e,missing:!0}}},i={args:{onMove:p()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Remove Contractors from this rule'
    }));
    await expect(args.onRemove).toHaveBeenCalledWith(CON);
  }
}`,...a.parameters?.docs?.source},description:{story:"A group the rule keeps.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    change: 'added',
    group: {
      id: CON,
      name: 'Engineering Managers'
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"A staged addition, with what it does to people.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    change: 'removed'
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Undo removing Contractors'
    }));
    await expect(args.onRestore).toHaveBeenCalledWith(CON);
  }
}`,...n.parameters?.docs?.source},description:{story:"A staged removal: struck through, still legible, and undoable.",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      id: CON
    }
  }
}`,...s.parameters?.docs?.source},description:{story:"No name was loaded: the row says so and shows the id, rather than naming it by its id.",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    group: {
      id: CON,
      missing: true
    }
  }
}`,...r.parameters?.docs?.source},description:{story:"A target that no longer exists in Okta.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    onMove: fn()
  }
}`,...i.parameters?.docs?.source},description:{story:"With a move handler, a kept row also offers the move.",...i.parameters?.docs?.description}}};const E=["Kept","Added","Removed","Unnamed","NoLongerExists","WithMove"];export{t as Added,a as Kept,r as NoLongerExists,n as Removed,s as Unnamed,i as WithMove,E as __namedExportsOrder,C as default};
