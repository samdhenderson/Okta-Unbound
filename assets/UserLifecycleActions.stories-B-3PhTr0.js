import{j as b}from"./iframe-mmN7AxbW.js";import{U as v}from"./UserLifecycleActions-Dz_OlyWD.js";import{m as B}from"./fixtures-CsAiPaTu.js";import"./preload-helper-PPVm8Dsz.js";import"./PasswordChangeFields-CrZFAhNM.js";const{expect:a,fn:h,userEvent:s,within:n}=__STORYBOOK_MODULE_TEST__,f=(e={})=>({...B[10],status:"ACTIVE",...e}),D={title:"Users/UserLifecycleActions",component:v,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:`The Manage tier's body on the user-detail rung: the account-state verbs plus their confirmation modal, gated by user status. Reading order is deliberate — the non-destructive verbs first, a rule, then the destructive one alone with its consequence stated beside it.

Offers only the actions valid for the current status: Reset password + Suspend for ACTIVE, Unsuspend for SUSPENDED, Reset password alone for RECOVERY / LOCKED_OUT / PASSWORD_EXPIRED, and a notice for DEPROVISIONED. Presentational: the parent owns the pending-action state and the API call.

**Reset password is one verb with four modes.** The strip shows one button because the admin has one question; the confirm is where it forks into a reset email, a direct set, a one-time set, and a generated temporary value — each with its consequence beside it. A generated value is shown once, in its own dialog, because Okta will not return it again.`}}},decorators:[e=>b.jsx("div",{className:"rounded-b-md border border-neutral-200 bg-white px-4 py-3",children:b.jsx(e,{})})],args:{user:f(),isLifecycleLoading:!1,pendingLifecycleAction:null,onRequestAction:h(),onCancel:h(),onConfirm:h(),tempPassword:null,onDismissTempPassword:h()},argTypes:{user:{description:"The selected user the actions apply to."},isLifecycleLoading:{description:"True while a confirmed action is in flight (disables the trigger buttons)."},pendingLifecycleAction:{description:"The action awaiting confirmation, or null. Drives the confirm modal."},onRequestAction:{description:"Arm the confirm modal for an action."},onCancel:{description:"Dismiss the confirm modal without running the action."},onConfirm:{description:"Run the armed action (the confirm button)."},tempPassword:{description:"The one-time password Okta generated, or null when there is none to read out."},onDismissTempPassword:{description:"Drop the one-time password when its dialog closes."}}},r={play:async({args:e,canvasElement:t})=>{const o=n(t);await s.click(o.getByRole("button",{name:"Suspend user"})),await a(e.onRequestAction).toHaveBeenCalledWith("suspend"),await a(e.onConfirm).not.toHaveBeenCalled()}},i={args:{user:f({status:"SUSPENDED"})}},c={args:{user:f({status:"LOCKED_OUT"})}},d={args:{user:f({status:"DEPROVISIONED"})}},l={args:{isLifecycleLoading:!0}},p={args:{pendingLifecycleAction:"suspend"},play:async({args:e})=>{const t=n(await n(document.body).findByRole("dialog"));await s.click(t.getByRole("button",{name:"Suspend"})),await a(e.onConfirm).toHaveBeenCalledTimes(1)}},u={args:{pendingLifecycleAction:"resetPassword"},play:async()=>{const e=n(await n(document.body).findByRole("dialog"));await a(e.getByRole("button",{name:"Send Reset Email"})).toBeEnabled(),await a(e.queryByLabelText("New password")).not.toBeInTheDocument()}},m={args:{pendingLifecycleAction:"resetPassword"},play:async({args:e})=>{const t=n(await n(document.body).findByRole("dialog"));await s.selectOptions(t.getByRole("combobox",{name:"What should happen"}),"set");const o=t.getByRole("button",{name:"Set Password"});await a(o).toBeDisabled(),await s.type(t.getByLabelText("New password"),"FAKE-value-1"),await a(o).toBeEnabled(),await s.click(o),await a(e.onConfirm).toHaveBeenCalledWith({mode:"set",password:"FAKE-value-1"})}},g={args:{pendingLifecycleAction:"resetPassword"},play:async()=>{const e=n(await n(document.body).findByRole("dialog"));await s.selectOptions(e.getByRole("combobox",{name:"What should happen"}),"set"),await a(e.getByLabelText("New password")).toHaveAttribute("type","password"),await s.click(e.getByRole("button",{name:"Generate"}));const t=e.getByLabelText("New password");await a(t).toHaveAttribute("type","text"),await a(t.value.length).toBeGreaterThan(11)}},w={args:{tempPassword:"TempFAKE123"},play:async({args:e})=>{const t=n(await n(document.body).findByRole("dialog"));await a(t.getByText("TempFAKE123")).toBeInTheDocument(),await s.click(t.getByRole("button",{name:"Done"})),await a(e.onDismissTempPassword).toHaveBeenCalled()}},y={parameters:{viewport:{value:"sidepanelCompact"}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // The destructive verb arms a confirmation; it never writes on the first press.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Suspend user'
    }));
    await expect(args.onRequestAction).toHaveBeenCalledWith('suspend');
    await expect(args.onConfirm).not.toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source},description:{story:"ACTIVE user: Reset password above the rule, Suspend user below it.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    user: user({
      status: 'SUSPENDED'
    })
  }
}`,...i.parameters?.docs?.source},description:{story:"SUSPENDED user: the destructive row becomes the restorative one.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    user: user({
      status: 'LOCKED_OUT'
    })
  }
}`,...c.parameters?.docs?.source},description:{story:"LOCKED_OUT user: Reset password only — there is no destructive row to rule off.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    user: user({
      status: 'DEPROVISIONED'
    })
  }
}`,...d.parameters?.docs?.source},description:{story:"DEPROVISIONED user: no actions available, just the notice.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    isLifecycleLoading: true
  }
}`,...l.parameters?.docs?.source},description:{story:"An action is in flight — the trigger buttons are disabled.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    pendingLifecycleAction: 'suspend'
  },
  play: async ({
    args
  }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', {
      name: 'Suspend'
    }));
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
  }
}`,...p.parameters?.docs?.source},description:{story:"The suspend action is armed — the confirmation modal is open.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    pendingLifecycleAction: 'resetPassword'
  },
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'));
    await expect(dialog.getByRole('button', {
      name: 'Send Reset Email'
    })).toBeEnabled();
    await expect(dialog.queryByLabelText('New password')).not.toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:`The reset-password action is armed. It opens on the reset email — the mode
that costs nobody a password — and asks for no value until one is chosen.`,...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    pendingLifecycleAction: 'resetPassword'
  },
  play: async ({
    args
  }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));
    await userEvent.selectOptions(dialog.getByRole('combobox', {
      name: 'What should happen'
    }), 'set');
    const confirm = dialog.getByRole('button', {
      name: 'Set Password'
    });
    await expect(confirm).toBeDisabled();
    await userEvent.type(dialog.getByLabelText('New password'), 'FAKE-value-1');
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledWith({
      mode: 'set',
      password: 'FAKE-value-1'
    });
  }
}`,...m.parameters?.docs?.source},description:{story:`Choosing to set a password directly. The confirm is refused until a value is
present — the one place in the app where a write cannot be undone, so it is
also the one that must not fire on an empty field.`,...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    pendingLifecycleAction: 'resetPassword'
  },
  play: async () => {
    const dialog = within(await within(document.body).findByRole('dialog'));
    await userEvent.selectOptions(dialog.getByRole('combobox', {
      name: 'What should happen'
    }), 'set');
    await expect(dialog.getByLabelText('New password')).toHaveAttribute('type', 'password');
    await userEvent.click(dialog.getByRole('button', {
      name: 'Generate'
    }));
    const field = dialog.getByLabelText('New password') as HTMLInputElement;
    await expect(field).toHaveAttribute('type', 'text');
    await expect(field.value.length).toBeGreaterThan(11);
  }
}`,...g.parameters?.docs?.source},description:{story:`The value is masked until revealed, and generating one reveals it — an admin
who cannot read what they are about to hand over has no use for it.`,...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    tempPassword: 'TempFAKE123'
  },
  play: async ({
    args
  }) => {
    const dialog = within(await within(document.body).findByRole('dialog'));
    await expect(dialog.getByText('TempFAKE123')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', {
      name: 'Done'
    }));
    await expect(args.onDismissTempPassword).toHaveBeenCalled();
  }
}`,...w.parameters?.docs?.source},description:{story:`Okta returns a temporary password once and never again, so it gets its own
dialog rather than a banner someone can scroll past.`,...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    viewport: {
      value: 'sidepanelCompact'
    }
  }
}`,...y.parameters?.docs?.source},description:{story:"The 360px floor: the consequence text and its button must wrap, not squeeze.",...y.parameters?.docs?.description}}};const x=["Active","Suspended","LockedOut","Deprovisioned","Loading","ConfirmingSuspend","ConfirmingResetPassword","SettingAPassword","RevealingAGeneratedPassword","ShowingATemporaryPassword","Narrow"];export{r as Active,u as ConfirmingResetPassword,p as ConfirmingSuspend,d as Deprovisioned,l as Loading,c as LockedOut,y as Narrow,g as RevealingAGeneratedPassword,m as SettingAPassword,w as ShowingATemporaryPassword,i as Suspended,x as __namedExportsOrder,D as default};
