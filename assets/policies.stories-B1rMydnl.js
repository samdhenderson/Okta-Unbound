import{r as v,j as e,Z as H,L as O,s as V,a as _,I as D,E as $,C as F,d as K}from"./iframe-mmN7AxbW.js";import{C as q,a as E,w as M,r as x,b as W}from"./chapterStory-BJBxwv1h.js";import{S,M as P}from"./Scene-D2nzHScN.js";import{A as b}from"./Assemble-BfsBqw6B.js";import{p as G,a as U,P as T}from"./PolicyRulesList-CDkvg2jw.js";import{u as Y}from"./useCountUp-DBR4-HMR.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./InstallCta-wq3hO1J-.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";const C={policy:{id:"rstFAKE000000000001",name:"Any two factors",status:"ACTIVE",type:"ACCESS_POLICY",priority:1,description:"Requires two factors for high-risk applications",system:!1},rules:[{id:"0prFAKE000000000011",name:"Trusted device, no prompt",status:"ACTIVE",priority:1},{id:"0prFAKE000000000012",name:"Contractors: prompt every time",status:"ACTIVE",priority:2},{id:"0prFAKE000000000013",name:"Catch-all Rule",status:"ACTIVE",priority:3,system:!0}]},z={policy:{id:"rstFAKE000000000002",name:"Legacy VPN",status:"INACTIVE",type:"ACCESS_POLICY",priority:2,description:"Password only, for the appliance that is being retired",system:!1},rules:[{id:"0prFAKE000000000021",name:"Catch-all Rule",status:"ACTIVE",priority:1,system:!0}]},Z={policy:{id:"rstFAKE000000000003",name:"Default Policy",status:"ACTIVE",type:"ACCESS_POLICY",priority:99,system:!0},rules:[{id:"0prFAKE000000000031",name:"Catch-all Rule",status:"ACTIVE",priority:1,system:!0}]},y=[C,z,Z],k=()=>{},N="flex flex-col gap-(--sp-rung)";function R(){const[a,t]=v.useState(null);return{hot:a,onHot:t}}const B=({scene:a,n:t,hot:n,onHot:s,lift:o,children:r})=>{const l=`${a}:${t}`,w=n===l;return e.jsx("div",{className:`rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2 ${o?"lift":""}`,"data-spot":l,"data-lit":w||void 0,onPointerEnter:()=>s(l),onPointerLeave:()=>s(null),onFocus:()=>s(l),onBlur:()=>s(null),children:r})},f=({scene:a,n:t,hot:n,onHot:s,children:o})=>{const r=`${a}:${t}`,l=n===r;return e.jsx("span",{className:"-mx-1.5 -my-0.5 box-decoration-clone rounded-sm px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:bg-primary-light","data-spot":r,"data-lit":l||void 0,onPointerEnter:()=>s(r),onPointerLeave:()=>s(null),children:o})},L=({fixture:a,expanded:t,onToggle:n,cascade:s})=>{const{policy:o,rules:r}=a,l=v.useId(),w=v.useId(),g=o.name??o.id,j="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs";return e.jsx(O,{density:"comfortable",headerClassName:"press-subtle",body:e.jsx("div",{id:l,className:"disclose","data-open":t,inert:!t||void 0,children:e.jsx("div",{children:e.jsxs("div",{className:`space-y-3 border-t border-neutral-100 bg-neutral-50 px-4 pb-4 pt-3 ${t&&!s?"animate-rise-in":""}`,style:t&&!s?{animationDelay:"calc(var(--dur-quick) * var(--guide-motion, 1))"}:void 0,children:[e.jsx($,{as:"div",children:"Rules"}),s&&t?e.jsx(b,{selector:"ul > li",children:e.jsx(T,{rules:r,isLoading:!1,error:null})}):e.jsx(T,{rules:r,isLoading:!1,error:null}),e.jsxs("div",{className:"flex min-w-0 items-center gap-1 border-t border-neutral-200 pt-2 text-xs text-neutral-600",children:[e.jsx("span",{className:"shrink-0 font-semibold",children:"Policy ID:"}),e.jsx(F,{value:o.id,label:`Copy policy id for ${g} (${o.id})`})]})]},String(t))})}),children:e.jsxs("div",{className:"relative flex items-start justify-between gap-4",children:[e.jsx(V,{label:t?"Hide rules":"Show rules",describedBy:w,onClick:()=>n(o.id)}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"mb-1 flex flex-wrap items-center gap-(--sp-inline)",children:[e.jsx("h3",{id:w,className:"text-sm font-semibold text-neutral-900",children:g}),e.jsx("span",{className:`rounded-md border px-2 py-0.5 text-xs font-medium ${U(o.status)}`,children:G(o.status)}),o.system&&e.jsx("span",{className:`${j} font-medium text-neutral-600`,children:"System"}),o.priority!=null&&e.jsxs("span",{className:`${j} font-mono text-neutral-600`,children:["Priority ",o.priority]})]}),o.description&&e.jsx("p",{className:"truncate text-xs text-neutral-600",children:o.description})]}),e.jsx(_,{label:t?`Hide rules for ${g}`:`Show rules for ${g}`,variant:"ghost",size:"md",expanded:t,controls:l,className:"relative z-10 shrink-0",onClick:()=>n(o.id),children:e.jsx(D,{type:"chevron-right",size:"sm",className:`transition-transform duration-(--dur-instant) ${t?"rotate-90":""}`})})]})})},I=()=>e.jsx(K,{icon:"shield",title:"Policies are not readable by this admin role",description:"Okta refused the read. An admin role with policy read access can list app authentication policies; this one cannot, so the panel has nothing to show.",actions:[{label:"Check again",onClick:k,variant:"secondary"}]}),J=({total:a})=>{const{value:t}=Y(a);return e.jsx(H,{shown:t,of:t})},Q={stageLabel:"Policies",minHeight:560,beats:[{caption:"Every app authentication policy in your org, in the order Okta reads them.",hold:4},{caption:"Open Any two factors and its three rules appear, top one tried first.",hold:5},{caption:"When your role cannot read policies, the tab says Okta refused, not that the org is empty."}],render:a=>a<2?e.jsxs("div",{children:[e.jsx(J,{total:y.length}),e.jsx(b,{className:N,children:y.map(t=>e.jsx(L,{fixture:t,expanded:a>=1&&t.policy.id===C.policy.id,onToggle:k,cascade:!0},t.policy.id))})]},"list"):e.jsx(b,{children:e.jsx(I,{})},"refused")},A=()=>{const[a,t]=v.useState(C.policy.id),n=r=>t(l=>l===r?null:r),s=R(),o=R();return e.jsxs(q,{id:"policies",show:Q,children:[e.jsx(S,{title:"Policy Cards",intro:"An app authentication policy decides what a sign-in to an app has to pass, and its rules decide who gets which requirement. The Policies tab lists every one in your org and lets you open each to read its rules. It reads; it does not edit. Each policy is a card: its name, whether it is active, and the priority Okta reads it at. The line above the cards says how many loaded. Click a card to open its rules, and click it again to close them.",legend:[{text:e.jsx(f,{scene:"list",n:1,...s,children:"Any two factors is open, so you can read its three rules in the order Okta tries them. The first rule that matches a person wins, which leaves Catch-all Rule at the bottom taking whoever is left."})},{text:e.jsx(f,{scene:"list",n:2,...s,children:"Legacy VPN is switched off and keeps its place in the list with a grey Inactive badge, so a policy someone turned off is never mistaken for one that was deleted."})},{text:e.jsx(f,{scene:"list",n:3,...s,children:"Default Policy carries a System badge because Okta manages it, and the last priority because every app that names no other policy signs in under it."})}],outro:"A rule row shows its priority, its name, and whether it is on. What the rule checks and what it then demands (the device, the factors, how long the session lasts) is not on the card yet. That is what a deeper Policies tab would add, if it is built.",minHeight:320,children:e.jsxs("div",{children:[e.jsx(H,{shown:y.length,of:y.length}),e.jsx("div",{className:N,children:y.map((r,l)=>e.jsx(P,{n:l+1,align:"top",children:e.jsx(B,{scene:"list",n:l+1,lift:!0,...s,children:e.jsx(L,{fixture:r,expanded:a===r.policy.id,onToggle:n})})},r.policy.id))})]})}),e.jsx(S,{title:"Refused Reads",intro:"Reading policies takes an admin role that can read them. When yours cannot, the tab says so instead of showing you an empty list.",legend:[{text:e.jsx(f,{scene:"refused",n:1,...o,children:"Okta answered the read with a refusal, so the panel reports that rather than claiming your org has no policies. Check again reruns the read, which is the only way to find out that your role has widened."})}],children:e.jsx(P,{n:1,children:e.jsx(B,{scene:"refused",n:1,...o,children:e.jsx(I,{})})})})]})};try{A.displayName="policies",A.__docgenInfo={description:"",displayName:"policies",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/policies.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:i,fireEvent:X,userEvent:c,within:ee}=__STORYBOOK_MODULE_TEST__,ve={title:"Guide/Chapters/policies",component:A,decorators:[M("policies")],parameters:E,parameters:{docs:{description:{component:"The Policies chapter, in the shell, rail on Policies."}}}},d={play:async({canvasElement:a})=>{const t=x(a);await i(await t.findByText(/Showing 3 of 3/)).toBeVisible()}},h={parameters:{...E,motion:"on"},play:async({canvasElement:a})=>{await W(a);const t=a.querySelector("[data-show-state]");if(!t)throw new Error("the chapter has no show");const n=ee(t);await i(n.getByTestId("guide-caption")).toHaveTextContent("When your role cannot read policies, the tab says Okta refused, not that the org is empty."),await i(n.getByRole("heading",{name:"Policies are not readable by this admin role"})).toBeVisible(),await i(n.queryByRole("heading",{name:"Any two factors"})).toBeNull()}},p={play:async({canvasElement:a})=>{const t=x(a),n=await t.findByRole("button",{name:"Hide rules for Any two factors"}),s=t.getByRole("button",{name:"Show rules for Default Policy"});await c.click(s),await i(s).toHaveAttribute("aria-expanded","true"),await i(n).toHaveAttribute("aria-expanded","false"),await i(t.getByRole("button",{name:"Copy policy id for Default Policy (rstFAKE000000000003)"})).toBeVisible()}},u={play:async({canvasElement:a})=>{const t=x(a),n=await t.findByText(/Legacy VPN is switched off/),s=a.querySelector('[data-testid="guide-body"] [data-spot="list:2"]:not(span)');if(!s)throw new Error("the Legacy VPN card has no hot target wrapper");await c.hover(n),await i(n).toHaveAttribute("data-lit"),await i(s).toHaveAttribute("data-lit"),await c.unhover(n),await i(n).not.toHaveAttribute("data-lit"),await i(s).not.toHaveAttribute("data-lit"),await c.hover(s),await i(n).toHaveAttribute("data-lit"),await c.unhover(s),await X.focusIn(t.getByRole("button",{name:"Show rules for Legacy VPN"})),await i(n).toHaveAttribute("data-lit"),await i(s).toHaveAttribute("data-lit")}},m={parameters:{...E,motion:"on"},play:async({canvasElement:a})=>{const t=x(a),n=await t.findByRole("button",{name:"Show rules for Legacy VPN"});await c.click(n),await i(n).toHaveAttribute("aria-expanded","true"),await i(t.getAllByTestId("policy-rules-list").length).toBeGreaterThan(0)}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(await canvas.findByText(/Showing 3 of 3/)).toBeVisible();
  }
}`,...d.parameters?.docs?.source},description:{story:`The chapter as a reader sees it: the count line the tab states above its
cards, then the first policy open and the rest closed.`,...d.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    if (!show) throw new Error('the chapter has no show');
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent('When your role cannot read policies, the tab says Okta refused, not that the org is empty.');
    await expect(stage.getByRole('heading', {
      name: 'Policies are not readable by this admin role'
    })).toBeVisible();
    await expect(stage.queryByRole('heading', {
      name: 'Any two factors'
    })).toBeNull();
  }
}`,...h.parameters?.docs?.source},description:{story:`The show, with motion on: the count line counts up while three closed cards
land, the first opens and its rules cascade in, then the refusal rises as the
still. The play waits for the run to finish and pins the still: its caption,
and the empty state on the lit stage (the reader scene below shows the same
one, so the query is scoped to the show).`,...h.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const first = await canvas.findByRole('button', {
      name: 'Hide rules for Any two factors'
    });
    const toggle = canvas.getByRole('button', {
      name: 'Show rules for Default Policy'
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByRole('button', {
      name: 'Copy policy id for Default Policy (rstFAKE000000000003)'
    })).toBeVisible();
  }
}`,...p.parameters?.docs?.source},description:{story:`Opening a second card closes the first; the frame holds both. An open card
carries the policy id and its copy control, the way the panel's card does.`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const line = await canvas.findByText(/Legacy VPN is switched off/);
    const target = canvasElement.querySelector('[data-testid="guide-body"] [data-spot="list:2"]:not(span)');
    if (!target) throw new Error('the Legacy VPN card has no hot target wrapper');
    await userEvent.hover(line);
    await expect(line).toHaveAttribute('data-lit');
    await expect(target).toHaveAttribute('data-lit');
    await userEvent.unhover(line);
    await expect(line).not.toHaveAttribute('data-lit');
    await expect(target).not.toHaveAttribute('data-lit');
    await userEvent.hover(target);
    await expect(line).toHaveAttribute('data-lit');
    await userEvent.unhover(target);

    // React hears \`focusin\`, and a headless window may not be focused, so
    // \`.focus()\` alone is not enough to reach the handler.
    await fireEvent.focusIn(canvas.getByRole('button', {
      name: 'Show rules for Legacy VPN'
    }));
    await expect(line).toHaveAttribute('data-lit');
    await expect(target).toHaveAttribute('data-lit');
  }
}`,...u.parameters?.docs?.source},description:{story:`Hovering a legend line lights the card its number marks, and hovering the
card lights the line. Focus counts too: tabbing to a card's toggle lights its
line without a pointer.`,...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: 'Show rules for Legacy VPN'
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getAllByTestId('policy-rules-list').length).toBeGreaterThan(0);
  }
}`,...m.parameters?.docs?.source},description:{story:`The choreography, with motion on: the shell's arrival sequence, then a card
pressed open so its rules rise in behind the disclosure. Watch it in the
browser; the assertions only pin the end state.`,...m.parameters?.docs?.description}}};const xe=["Default","Show","CardOpened","LegendLit","Choreography"];export{p as CardOpened,m as Choreography,d as Default,u as LegendLit,h as Show,xe as __namedExportsOrder,ve as default};
