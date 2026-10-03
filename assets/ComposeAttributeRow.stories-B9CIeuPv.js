import{j as c}from"./iframe-Pee757m_.js";import{C as d}from"./ComposeAttributeRow-FpGF-y2V.js";import{r as m}from"./memberAnalytics-tPH-giHi.js";import"./preload-helper-PPVm8Dsz.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./copy-DPkId50G.js";import"./slots-kY_j0TaM.js";const{expect:e,fn:p,userEvent:u,within:r}=__STORYBOOK_MODULE_TEST__,g={key:"department",label:"Department",distinct:9,populated:38,total:40,fillRate:95,rows:[{value:"Engineering",label:"Engineering",count:20,pct:50},{value:"engineering",label:"engineering",count:6,pct:15},{value:"__other__",label:"Other (7 values)",count:12,pct:30},{value:"__none__",label:"(none)",count:2,pct:5}]},[v]=m([g],()=>0),f={title:"Home/Ask/ComposeAttributeRow",component:d,tags:["autodocs"],decorators:[t=>c.jsx("ul",{children:c.jsx(t,{})})],parameters:{docs:{description:{component:"One attribute in a Compose answer: its name and why it stands out. Its values split only once the reader opens it; the tail and blanks are stated, never offered as values."}}},args:{attribute:v,open:!1,onToggle:p(),tapped:null,onTap:p()}},a={play:async({args:t,canvasElement:s})=>{const n=r(s);await e(n.getByText(/12 of 40 members hold a value outside/)).toBeInTheDocument(),await u.click(n.getByRole("button",{name:"Values"})),await e(t.onToggle).toHaveBeenCalled()}},o={args:{open:!0,tapped:{attr:"department",op:"eq",value:"engineering"}},play:async({args:t,canvasElement:s})=>{const n=r(s),i=r(n.getByRole("group"));await e(i.getAllByRole("button")).toHaveLength(2);const l=i.getByRole("button",{pressed:!0});await e(l).toHaveTextContent("engineering"),await u.click(l),await e(t.onTap).toHaveBeenCalledWith(null),await e(n.getByText("Blank in 2 of 40 members.")).toBeInTheDocument()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/12 of 40 members hold a value outside/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Values'
    }));
    await expect(args.onToggle).toHaveBeenCalled();
  }
}`,...a.parameters?.docs?.source},description:{story:"Closed: the reasons, and a control to open it.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    tapped: {
      attr: 'department',
      op: 'eq',
      value: 'engineering'
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const values = within(canvas.getByRole('group'));
    await expect(values.getAllByRole('button')).toHaveLength(2);
    const pressed = values.getByRole('button', {
      pressed: true
    });
    await expect(pressed).toHaveTextContent('engineering');
    // Pressed again, the tap is taken back.
    await userEvent.click(pressed);
    await expect(args.onTap).toHaveBeenCalledWith(null);
    await expect(canvas.getByText('Blank in 2 of 40 members.')).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"Open with a value tapped: named values are toggles; the tail and blanks are lines.",...o.parameters?.docs?.description}}};const k=["Closed","OpenWithTap"];export{a as Closed,o as OpenWithTap,k as __namedExportsOrder,f as default};
