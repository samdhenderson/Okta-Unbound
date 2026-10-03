import{G as u}from"./GrantingGroupPicker-BEsEc4BK.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,fn:l,userEvent:p,within:i}=__STORYBOOK_MODULE_TEST__,m={kind:"app",id:"0oaFAKE0000000000001",name:"Salesforce"},d=(e,a)=>({kind:"group",id:`00gFAKE00000000000${String(e).padStart(2,"0")}`,name:a}),g=[d(1,"Engineering"),d(2,"Sales NA")],y=["Accounts","Engineering","Finance","Legal","Marketing","Ops","Sales EMEA","Sales NA","Support"].map((e,a)=>d(a+1,e)),h={title:"Home/Ask/GrantingGroupPicker",component:u,tags:["autodocs"],parameters:{docs:{description:{component:"The group picker a concierge card narrows to one app’s assigned groups: every one by name, nothing ranked or picked for the reader, and a way back to every group."}}},args:{id:"picker",app:m,groups:{status:"ready",items:g},onPick:l(),onRetry:l(),onUnscope:l()}},s={play:async({args:e,canvasElement:a})=>{const t=i(a);await p.click(t.getByRole("button",{name:"Sales NA"})),await n(e.onPick).toHaveBeenCalledWith(g[1]),await p.click(t.getByRole("button",{name:"Choose any group"})),await n(e.onUnscope).toHaveBeenCalled()}},o={args:{groups:{status:"ready",items:y}},play:async({canvasElement:e})=>{const a=i(e);await p.type(a.getByRole("searchbox",{name:/Filter/}),"sales"),await n(i(a.getByRole("list")).getAllByRole("button").map(t=>t.textContent)).toEqual(["Sales EMEA","Sales NA"])}},r={args:{groups:{status:"failed"}},play:async({args:e,canvasElement:a})=>{const t=i(a);await n(t.getByRole("alert")).toHaveTextContent(/couldn’t be read/),await p.click(t.getByRole("button",{name:"Try again"})),await n(e.onRetry).toHaveBeenCalled()}},c={args:{groups:{status:"ready",items:[]}},play:async({canvasElement:e})=>{await n(i(e).getByRole("status")).toHaveTextContent("Salesforce is assigned to no group.")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Sales NA'
    }));
    await expect(args.onPick).toHaveBeenCalledWith(FEW[1]);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Choose any group'
    }));
    await expect(args.onUnscope).toHaveBeenCalled();
  }
}`,...s.parameters?.docs?.source},description:{story:"The app's groups; a tap fills the slot, and the reader can widen the picker.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    groups: {
      status: 'ready',
      items: MANY
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('searchbox', {
      name: /Filter/
    }), 'sales');
    await expect(within(canvas.getByRole('list')).getAllByRole('button').map(b => b.textContent)).toEqual(['Sales EMEA', 'Sales NA']);
  }
}`,...o.parameters?.docs?.source},description:{story:"Enough groups to scan: a filter narrows them.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    groups: {
      status: 'failed'
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toHaveTextContent(/couldn’t be read/);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Try again'
    }));
    await expect(args.onRetry).toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source},description:{story:"The walk failed: said, with a way to try again.",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    groups: {
      status: 'ready',
      items: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Salesforce is assigned to no group.');
  }
}`,...c.parameters?.docs?.source},description:{story:"The app is assigned to no group.",...c.parameters?.docs?.description}}};const B=["Groups","Filtered","Unread","NoGroups"];export{o as Filtered,s as Groups,c as NoGroups,r as Unread,B as __namedExportsOrder,h as default};
