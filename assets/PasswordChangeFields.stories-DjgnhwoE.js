import{j as u}from"./iframe-mmN7AxbW.js";import{P as g}from"./PasswordChangeFields-CrZFAhNM.js";import"./preload-helper-PPVm8Dsz.js";const{expect:t,fn:w,userEvent:h,within:n}=__STORYBOOK_MODULE_TEST__,T={title:"Users/PasswordChangeFields",component:g,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`The body of the Reset Password confirm. Okta has four ways to change a password and they are not interchangeable, so this is a picker with the consequence stated beside each choice rather than four verbs in the action strip.

**Email them a reset link** changes nothing until the user follows it, and is no help when you cannot reach their mailbox. **Set a password now** takes effect immediately and stays in force — the break-glass case, and the one write in this app that cannot be undone. **Set a one-time password** does the same and then makes them replace it. **Generate a temporary password** has Okta produce the value and return it once.

Only the two middle modes take a value, so only they render a field. Fully controlled: the parent owns the mode and the value, and drops the value when the modal closes.`}}},decorators:[a=>u.jsx("div",{className:"max-w-sm rounded-md border border-neutral-200 bg-white p-4",children:u.jsx(a,{})})],args:{email:"ada@example.com",mode:"email-reset",onModeChange:w(),password:"",onPasswordChange:w(),disabled:!1},argTypes:{email:{description:"Who the reset link would go to, named in the copy for that mode."},mode:{description:"The chosen operation."},onModeChange:{description:"Report a new choice."},password:{description:"The typed value. Empty for the modes that need none."},onPasswordChange:{description:"Report a new value."},disabled:{description:"True while a confirmed action is in flight."}}},s={play:async({canvasElement:a})=>{const e=n(a);await t(e.getByText("ada@example.com")).toBeInTheDocument(),await t(e.queryByLabelText("New password")).not.toBeInTheDocument()}},o={args:{mode:"set"},play:async({canvasElement:a})=>{const e=n(a);await t(e.getByLabelText("New password")).toHaveAttribute("type","password"),await t(e.getByText(/cannot be undone/i)).toBeInTheDocument()}},r={args:{mode:"set",password:"FAKE-value-1"},play:async({args:a,canvasElement:e})=>{const m=n(e);await h.selectOptions(m.getByRole("combobox",{name:"What should happen"}),"email-reset"),await t(a.onPasswordChange).toHaveBeenCalledWith(""),await t(a.onModeChange).toHaveBeenCalledWith("email-reset")}},c={args:{mode:"set-and-expire",password:"FAKE-value-1"},play:async({canvasElement:a})=>{const e=n(a);await h.click(e.getByRole("button",{name:"Show password"})),await t(e.getByLabelText("New password")).toHaveAttribute("type","text"),await t(e.getByRole("button",{name:"Hide password"})).toBeInTheDocument()}},i={args:{mode:"set"},play:async({args:a,canvasElement:e})=>{const m=n(e);await h.click(m.getByRole("button",{name:"Generate"}));const y=a.onPasswordChange.mock.calls.at(-1)?.[0];await t(y.length).toBeGreaterThan(11)}},d={args:{mode:"temp"},play:async({canvasElement:a})=>{const e=n(a);await t(e.queryByLabelText("New password")).not.toBeInTheDocument(),await t(e.getByText(/shown to you once/i)).toBeInTheDocument()}},l={args:{mode:"set",password:"FAKE-value-1",disabled:!0}},p={args:{mode:"set"},parameters:{viewport:{value:"sidepanelCompact"}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('ada@example.com')).toBeInTheDocument();
    await expect(canvas.queryByLabelText('New password')).not.toBeInTheDocument();
  }
}`,...s.parameters?.docs?.source},description:{story:"The default: a reset email, which needs no value and names the address it goes to.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('New password')).toHaveAttribute('type', 'password');
    await expect(canvas.getByText(/cannot be undone/i)).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"Setting a value directly — the break-glass case, and the only unreversible one.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set',
    password: 'FAKE-value-1'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', {
      name: 'What should happen'
    }), 'email-reset');

    // A value must not survive a switch to a mode that would send it elsewhere.
    await expect(args.onPasswordChange).toHaveBeenCalledWith('');
    await expect(args.onModeChange).toHaveBeenCalledWith('email-reset');
  }
}`,...r.parameters?.docs?.source},description:{story:"Choosing a mode clears whatever was typed for the previous one.",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set-and-expire',
    password: 'FAKE-value-1'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Show password'
    }));
    await expect(canvas.getByLabelText('New password')).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', {
      name: 'Hide password'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Revealing the value: masked by default, and the toggle says which state it is in.",...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set'
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Generate'
    }));
    const value = (args.onPasswordChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as string;
    await expect(value.length).toBeGreaterThan(11);
  }
}`,...i.parameters?.docs?.source},description:{story:"Generating one: the field fills and reveals, so it can actually be read out.",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'temp'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByLabelText('New password')).not.toBeInTheDocument();
    await expect(canvas.getByText(/shown to you once/i)).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"Okta produces the value for this mode, so there is nothing to type.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set',
    password: 'FAKE-value-1',
    disabled: true
  }
}`,...l.parameters?.docs?.source},description:{story:"An action is in flight: the picker, the field and the generator all lock.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    mode: 'set'
  },
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...p.parameters?.docs?.source},description:{story:"The 360px floor: the consequence text wraps rather than squeezing the control.",...p.parameters?.docs?.description}}};const B=["EmailReset","SetDirectly","ChangingModeClearsTheValue","Revealed","Generated","TemporaryPassword","Disabled","Narrow"];export{r as ChangingModeClearsTheValue,l as Disabled,s as EmailReset,i as Generated,p as Narrow,c as Revealed,o as SetDirectly,d as TemporaryPassword,B as __namedExportsOrder,T as default};
