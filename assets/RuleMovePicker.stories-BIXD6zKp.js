import{R as g}from"./RuleMovePicker-CcVHYBbz.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./DuplicateSetParts-AUAlRlyx.js";import"./dateFormat-Db8QGh5_.js";import"./ruleUtils-D89ADPfb.js";import"./ruleTargets-hCG7hfyY.js";import"./ruleTargetFacts-DKSE0DP8.js";const{expect:t,fn:h,userEvent:l,within:m}=__STORYBOOK_MODULE_TEST__,v="00gFAKE00000000CON01",w="00gFAKE00000000VPN01",u=(o,e,n={})=>({id:o,name:e,status:"ACTIVE",condition:'user.employeeType == "CONTRACTOR"',conditionExpression:'user.employeeType == "CONTRACTOR"',groupIds:[w],groupNames:["VPN"],userAttributes:["employeeType"],created:"2023-03-02T09:00:00.000Z",lastUpdated:"2026-05-11T10:00:00.000Z",...n}),p=[u("00rFAKE0000000000003","EMEA contractors"),u("00rFAKE0000000000004","AMER contractors",{status:"INACTIVE"}),u("00rFAKE0000000000005","Everyone → VPN",{groupIds:[w,"00gFAKE00000000ALL01"],condition:'user.status == "ACTIVE"',conditionExpression:'user.status == "ACTIVE"'})],C={title:"Rules/RuleMovePicker",component:g,tags:["autodocs"],parameters:{docs:{description:{component:"A `Modal` over the loaded rules, filtered in memory by name or condition. Each candidate is a `ListRow` radio with its status, group count and condition; the rule the group moves off is never offered, and the rest left out are counted by reason. **Review move** is withheld until a destination is chosen."}}},args:{group:{id:v,name:"Contractors"},sourceName:"Engineering by department",destinations:{candidates:p,excluded:{"has-group":0,broken:0,full:0}},onClose:h(),onReview:h()},argTypes:{group:{description:"The group being moved. `null` closes the picker."},sourceName:{description:"The name of the rule the group moves off."},destinations:{description:"The loaded rules the group can move to, and the count left out per reason."},onClose:{description:"Close without moving anything."},onReview:{description:"Open the move’s confirm for the chosen destination."}}},a={play:async({canvasElement:o})=>{const e=m(o.ownerDocument.body);await t(e.getByRole("dialog",{name:"Move Contractors"})).toBeVisible(),await t(e.getAllByRole("radio")).toHaveLength(3),await t(e.queryByRole("button",{name:"Review move"})).not.toBeInTheDocument()}},r={play:async({canvasElement:o,args:e})=>{const n=m(o.ownerDocument.body),y=n.getByRole("radio",{name:"Move to EMEA contractors"});await l.click(y),await t(y).toHaveAttribute("aria-checked","true"),await l.click(n.getByRole("button",{name:"Review move"})),await t(e.onReview).toHaveBeenCalledWith(p[0])}},s={play:async({canvasElement:o})=>{const e=m(o.ownerDocument.body),n=e.getByRole("searchbox",{name:"Filter rules by name or condition"});await l.type(n,"amer"),await t(e.getAllByRole("radio")).toHaveLength(1),await l.clear(n),await l.type(n,"finance"),await t(e.getByText("No loaded rule matches “finance”.")).toBeInTheDocument()}},i={args:{destinations:{candidates:p,excluded:{"has-group":2,broken:1,full:0}}},play:async({canvasElement:o})=>{await t(m(o.ownerDocument.body).getByText("Not offered: 2 already add to Contractors and 1 is Broken.")).toBeInTheDocument()}},c={args:{destinations:{candidates:[],excluded:{"has-group":1,broken:0,full:1}}},play:async({canvasElement:o})=>{const e=m(o.ownerDocument.body);await t(e.getByText("No other loaded rule can take Contractors, so there is nowhere to move it.")).toBeInTheDocument(),await t(e.queryByRole("radio")).not.toBeInTheDocument()}},d={parameters:{viewport:{value:"sidepanelDefault"}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole('dialog', {
      name: 'Move Contractors'
    })).toBeVisible();
    await expect(body.getAllByRole('radio')).toHaveLength(3);
    await expect(body.queryByRole('button', {
      name: 'Review move'
    })).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Three destinations, none chosen: there is no **Review move** yet.",...a.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    const emea = body.getByRole('radio', {
      name: 'Move to EMEA contractors'
    });
    await userEvent.click(emea);
    await expect(emea).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(body.getByRole('button', {
      name: 'Review move'
    }));
    await expect(args.onReview).toHaveBeenCalledWith(candidates[0]);
  }
}`,...r.parameters?.docs?.source},description:{story:"Choosing a destination checks its row and offers **Review move** for it.",...r.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    const filter = body.getByRole('searchbox', {
      name: 'Filter rules by name or condition'
    });
    await userEvent.type(filter, 'amer');
    await expect(body.getAllByRole('radio')).toHaveLength(1);
    await userEvent.clear(filter);
    await userEvent.type(filter, 'finance');
    await expect(body.getByText('No loaded rule matches “finance”.')).toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"The filter narrows the list in memory, and says so when nothing matches.",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    destinations: {
      candidates,
      excluded: {
        'has-group': 2,
        broken: 1,
        full: 0
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement.ownerDocument.body).getByText('Not offered: 2 already add to Contractors and 1 is Broken.')).toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:"Some loaded rules left out, each reason counted.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    destinations: {
      candidates: [],
      excluded: {
        'has-group': 1,
        broken: 0,
        full: 1
      }
    }
  },
  play: async ({
    canvasElement
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByText('No other loaded rule can take Contractors, so there is nowhere to move it.')).toBeInTheDocument();
    await expect(body.queryByRole('radio')).not.toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"No loaded rule can take the group: the reason, and nothing to choose.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelDefault'
    }
  }
}`,...d.parameters?.docs?.source},description:{story:"The 480px default panel.",...d.parameters?.docs?.description}}};const D=["Default","Chosen","Filtered","SomeNotOffered","NowhereToMove","Panel480"];export{r as Chosen,a as Default,s as Filtered,c as NowhereToMove,d as Panel480,i as SomeNotOffered,D as __namedExportsOrder,C as default};
