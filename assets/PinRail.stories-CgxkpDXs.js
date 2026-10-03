import{P as m}from"./PinRail-Dr8sHgux.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";const{expect:o,fn:p,userEvent:l,within:i}=__STORYBOOK_MODULE_TEST__,c=(e,s,n)=>({kind:e,id:s,name:n,lastSeenAt:1}),r=c("group","00gFAKE0000000000001","Engineering"),d=c("user","00uFAKE0000000000001","Joe Park"),u=c("app","0oaFAKE0000000000001","Salesforce"),v={title:"Home/Pinned/PinRail",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"The pins as a row of toggles: one is selected and described below. A kind filter sits above once the pins span more than one kind."}}},args:{kinds:["group","user","app"],filter:"all",onFilter:p(),pins:[r,d,u],selected:r,onSelect:p()}},t={play:async({args:e,canvasElement:s})=>{const n=i(s);await o(n.getByRole("button",{name:"Engineering"})).toHaveAttribute("aria-pressed","true"),await l.click(n.getByRole("button",{name:"Joe Park"})),await o(e.onSelect).toHaveBeenCalledWith(d),await l.click(i(n.getByRole("group",{name:"Show pins"})).getByRole("button",{name:"Users"})),await o(e.onFilter).toHaveBeenCalledWith("user")}},a={args:{kinds:["group"],pins:[r]},play:async({canvasElement:e})=>{await o(i(e).queryByRole("group",{name:"Show pins"})).not.toBeInTheDocument()}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Engineering'
    })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Joe Park'
    }));
    await expect(args.onSelect).toHaveBeenCalledWith(JOE);
    await userEvent.click(within(canvas.getByRole('group', {
      name: 'Show pins'
    })).getByRole('button', {
      name: 'Users'
    }));
    await expect(args.onFilter).toHaveBeenCalledWith('user');
  }
}`,...t.parameters?.docs?.source},description:{story:"Three kinds: a filter, and the selected pin pressed.",...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    kinds: ['group'],
    pins: [ENGINEERING]
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('group', {
      name: 'Show pins'
    })).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"One kind: nothing to filter, so no filter.",...a.parameters?.docs?.description}}};const B=["MixedKinds","OneKind"];export{t as MixedKinds,a as OneKind,B as __namedExportsOrder,v as default};
