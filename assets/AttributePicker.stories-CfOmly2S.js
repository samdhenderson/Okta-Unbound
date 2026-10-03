import{A as m}from"./AttributePicker-DcO3jn5g.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./slots-kY_j0TaM.js";const{expect:t,fn:p,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,w={title:"Home/Ask/AttributePicker",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"The picker for a predicate slot: one of the org’s text attributes and a value the reader types. The slot is written only when they press Use; while the schema loads, or if it cannot be read, the picker says so."}}},args:{id:"picker",list:{status:"ready",attributes:[{key:"costCenter",label:"Cost center"},{key:"department",label:"Department"}]},current:void 0,onPick:p(),onClear:p(),onRetry:p()}},o={play:async({args:a,canvasElement:n})=>{const e=d(n),s=e.getByRole("button",{name:"Use"});await t(s).toBeDisabled(),await u.selectOptions(e.getByRole("combobox",{name:"Attribute"}),"department"),await u.type(e.getByRole("textbox",{name:"Value"})," Engineering "),await u.click(s),await t(a.onPick).toHaveBeenCalledWith({attr:"department",op:"eq",value:"Engineering"})}},r={args:{current:{attr:"department",op:"eq",value:"Sales"}},play:async({args:a,canvasElement:n})=>{const e=d(n),s=e.getByRole("textbox",{name:"Value"});await t(s).toHaveValue("Sales"),await u.click(e.getByRole("button",{name:"Clear attribute"})),await t(a.onClear).toHaveBeenCalled(),await t(s).toHaveValue(""),await t(e.getByRole("combobox",{name:"Attribute"})).toHaveValue("")}},i={args:{list:{status:"loading"}},play:async({canvasElement:a})=>{await t(d(a).getByRole("status")).toHaveTextContent(/Reading/)}},c={args:{list:{status:"failed"}},play:async({args:a,canvasElement:n})=>{const e=d(n);await t(e.queryByRole("combobox")).not.toBeInTheDocument(),await t(e.getByRole("alert")).toHaveTextContent(/couldn’t be read/),await u.click(e.getByRole("button",{name:"Try again"})),await t(a.onRetry).toHaveBeenCalled()}},l={args:{list:{status:"ready",attributes:[]}},play:async({canvasElement:a})=>{await t(d(a).getByRole("status")).toHaveTextContent(/defines no text attribute/)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const use = canvas.getByRole('button', {
      name: 'Use'
    });
    await expect(use).toBeDisabled();
    await userEvent.selectOptions(canvas.getByRole('combobox', {
      name: 'Attribute'
    }), 'department');
    await userEvent.type(canvas.getByRole('textbox', {
      name: 'Value'
    }), ' Engineering ');
    await userEvent.click(use);
    await expect(args.onPick).toHaveBeenCalledWith({
      attr: 'department',
      op: 'eq',
      value: 'Engineering'
    });
  }
}`,...o.parameters?.docs?.source},description:{story:"Pick an attribute, type a value, press Use: the slot gets the trimmed value.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    current: {
      attr: 'department',
      op: 'eq',
      value: 'Sales'
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const value = canvas.getByRole('textbox', {
      name: 'Value'
    });
    await expect(value).toHaveValue('Sales');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear attribute'
    }));
    await expect(args.onClear).toHaveBeenCalled();
    await expect(value).toHaveValue('');
    await expect(canvas.getByRole('combobox', {
      name: 'Attribute'
    })).toHaveValue('');
  }
}`,...r.parameters?.docs?.source},description:{story:"Editing a filled slot starts from its value; Clear empties the slot and the fields.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    list: {
      status: 'loading'
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(/Reading/);
  }
}`,...i.parameters?.docs?.source},description:{story:"The schema is still being read.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    list: {
      status: 'failed'
    }
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('combobox')).not.toBeInTheDocument();
    await expect(canvas.getByRole('alert')).toHaveTextContent(/couldn’t be read/);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Try again'
    }));
    await expect(args.onRetry).toHaveBeenCalled();
  }
}`,...c.parameters?.docs?.source},description:{story:"The schema could not be read: no list is offered, and the read can be tried again.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    list: {
      status: 'ready',
      attributes: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(/defines no text attribute/);
  }
}`,...l.parameters?.docs?.source},description:{story:"The org defines no text attribute: said so, not shown as an empty list.",...l.parameters?.docs?.description}}};const x=["Picking","Editing","Loading","SchemaUnread","NoTextAttributes"];export{r as Editing,i as Loading,l as NoTextAttributes,o as Picking,c as SchemaUnread,x as __namedExportsOrder,w as default};
