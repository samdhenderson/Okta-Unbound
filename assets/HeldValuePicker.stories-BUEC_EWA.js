import{H as p}from"./HeldValuePicker-BwShd0te.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:r,fn:c,userEvent:l,within:o}=__STORYBOOK_MODULE_TEST__,d={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},y={title:"Home/Ask/HeldValuePicker",component:p,tags:["autodocs"],parameters:{docs:{description:{component:"The predicate picker a concierge card narrows to one user: each searchable attribute they hold a value for, with that value read from their profile. The reader picks the attribute; the value is theirs, never typed."}}},args:{id:"picker",user:d,values:{status:"ready",items:[{key:"costCenter",label:"Cost center",value:"CC-104"},{key:"department",label:"Department",value:"Engineering"}]},onPick:c(),onRetry:c(),onUnscope:c()}},a={play:async({args:e,canvasElement:i})=>{await l.click(o(i).getByRole("button",{name:/Department/})),await r(e.onPick).toHaveBeenCalledWith({attr:"department",op:"eq",value:"Engineering"})}},t={args:{values:{status:"loading"}},play:async({canvasElement:e})=>{await r(o(e).getByRole("status")).toHaveTextContent("Reading Joe Park’s profile…")}},n={args:{values:{status:"failed"}},play:async({args:e,canvasElement:i})=>{await l.click(o(i).getByRole("button",{name:"Try again"})),await r(e.onRetry).toHaveBeenCalled()}},s={args:{values:{status:"ready",items:[]}},play:async({canvasElement:e})=>{await r(o(e).getByRole("status")).toHaveTextContent(/holds no value/)}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: /Department/
    }));
    await expect(args.onPick).toHaveBeenCalledWith({
      attr: 'department',
      op: 'eq',
      value: 'Engineering'
    });
  }
}`,...a.parameters?.docs?.source},description:{story:"A tap fills the predicate with the user's own value.",...a.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      status: 'loading'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Reading Joe Park’s profile…');
  }
}`,...t.parameters?.docs?.source},description:{story:"The profile is being read.",...t.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      status: 'failed'
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole('button', {
      name: 'Try again'
    }));
    await expect(args.onRetry).toHaveBeenCalled();
  }
}`,...n.parameters?.docs?.source},description:{story:"The profile could not be read.",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    values: {
      status: 'ready',
      items: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(/holds no value/);
  }
}`,...s.parameters?.docs?.source},description:{story:"The user holds no value the org can search on.",...s.parameters?.docs?.description}}};const v=["Values","Reading","Unread","NothingHeld"];export{s as NothingHeld,t as Reading,n as Unread,a as Values,v as __namedExportsOrder,y as default};
