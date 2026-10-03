import{r as p,j as n,F as ce,G as de,J as ue}from"./iframe-Pee757m_.js";import{C as me,a as U,w as pe,b as Z,r as g}from"./chapterStory-CFpIgc-I.js";import{S as j,M as k}from"./Scene-CdJM5Keo.js";import{A as I}from"./Assemble-AGzofEAC.js";import{R as L}from"./RuleCard-v2Wt7y2R.js";import{R as ee}from"./RuleImpactModal-DHYK8qq6.js";import{R as he}from"./RuleActionBar-BbkaDxBE.js";import{D as ge,f as we,p as ye}from"./ruleMerge-CW67dk9w.js";import{V as ve}from"./VerbRunner-C8BUgmCE.js";import{m as fe,a as be,b as xe,M as Re}from"./DuplicateSetParts-AUAlRlyx.js";import{f as q}from"./ruleUtils-D89ADPfb.js";import{s as Be,t as Te}from"./ruleImpact-fK1Gyw3T.js";import{E as Ee}from"./selectionStore-CJ3uIvus.js";import{f as G,d as te,c as ae,e as J}from"./memberships-Cd9vTj_G.js";import{c as H,e as N}from"./snapshot-CcW3L-sh.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-B2QnSBoC.js";import"./InstallCta-BEikTIAL.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-tucVCR_u.js";import"./useRevealOnView-S6iiQ_8T.js";import"./motion-BHuXImUL.js";import"./Dock-C2yLCSm9.js";import"./useStaggerReveal-B8AfVumu.js";import"./sceneRegistry-CY69Myqs.js";/* empty css              */import"./Stage-Cjomzbog.js";import"./revealOnHover-DU3PDCIu.js";import"./StatCard-CkyoovcV.js";import"./useCountUp-TDDOfz3n.js";import"./motion-DWPTjLhl.js";import"./userDisplay-xpx41Abi.js";import"./RuleLifecycleActions-BqS1mFt3.js";import"./ruleTargets-hCG7hfyY.js";import"./ruleTargetFacts-DKSE0DP8.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./memberAnalytics-tPH-giHi.js";import"./BreakdownReport-DLC4-fAg.js";import"./PreflightSections-DS2OyTQC.js";import"./RunSteps-B3-vvI0R.js";import"./costSentence-BaIgeJiz.js";import"./csvUtils-DgNWYp8m.js";import"./dateFormat-Db8QGh5_.js";const r=()=>{},M=t=>{const e=N.find(a=>a.id===G("0pr",t));if(!e)throw new Error(`Demo rule ${t} is missing`);return e},Ae=['String.toLowerCase(user.department) == "engineering"','user.employeeType != "CONTRACTOR"','(user.countryCode == "US" || user.countryCode == "CA")','String.stringContains(user.title, "Engineer")',`!isMemberOfAnyGroup("${G("00g",15)}", "${G("00g",16)}")`].join(" && "),K={...M(3),name:"Engineering staff in North America → GitHub",conditions:{expression:{value:Ae,type:"urn:okta:expression:1.0"}}},ke=M(9),W=M(22),h=q(M(2)),ne=[ke,K,W].map(t=>q(t)),X=t=>{const e=ae.get(t);if(!e)throw new Error(`Demo person ${t} is missing`);return e},d={tomas:X(J.right),amara:X(J.left)},Ce={tomas:"Tomas passes two clauses: his department lowercases to engineering, and his title has Engineer in it. Three fail: he is a CONTRACTOR, he is in DE rather than US or CA, and he is in Contractors - EMEA, which the last clause excludes. One failed clause settles the rule: no match.",amara:"Amara passes all five: her department lowercases to engineering, her employee type is FULL_TIME, her country is US, her title has Engineer in it, and she is in neither contractor group. Every clause holds, so the rule matches her and GitHub is hers by rule."},Se=t=>t.conditions?.expression?.value??"";function je(){const t=te(),e=H(),a=h.groupIds.map(s=>{const l=e.get(s);return{groupId:s,groupName:l?.profile?.name??s,groupType:l?.type,members:(t.get(s)??[]).map(u=>ae.get(u)).filter(u=>!!u)}});return Be(h.id,h.name,a,N.map(Te))}const O=je(),se=N.map(t=>q(t)),oe=we(se),De=(()=>{const t=oe.find(e=>e.kind==="mergeable");if(!t)throw new Error("The demo org has no mergeable set of rules");return t})(),Ie=De.rules.length,Oe=H(),re=t=>Oe.get(t)?.profile?.name;function Pe(t,e){const a=t.ruleIds.flatMap(_=>N.find(y=>y.id===_)??[]),s=ye({raws:a,keptRuleId:t.keptRuleId,nextName:t.nextName,takenNames:t.takenNames});if(s.refusal!==null)return null;const{plan:l}=s;return{verb:{id:"rule-merge",label:be(l.retire.length),title:fe(l.kept.name,a.length),path:"write",needs:[],confirmTone:"danger",reversal:Re,cost:()=>l.cost,run:async()=>({status:"done",summary:""})},stage:"confirm",preflight:xe(l,re),progress:"",steps:[],outcome:null,error:null,fields:[],values:{},setValue:r,isComposed:!0,isRefreshing:!1,submitFields:r,start:r,confirm:e,close:e}}const He="rounded-md outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:outline-primary/40 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot=true]+span]:ring-4 [&[data-hot=true]+span]:ring-primary/25",Ne="-mx-2 -my-1 block rounded-md px-2 py-1 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:bg-primary-light/60";function D(){const[t,e]=p.useState(null);return p.useCallback(a=>({"data-hot":t===a?"true":"false",onPointerEnter:()=>e(a),onPointerLeave:()=>e(s=>s===a?null:s),onFocusCapture:()=>e(a),onBlurCapture:()=>e(s=>s===a?null:s)}),[t])}const C=({n:t,bind:e,children:a})=>n.jsx("div",{...e(t),className:He,children:a}),w=({n:t,bind:e,children:a})=>n.jsx("span",{...e(t),className:Ne,children:a}),Me=({bind:t})=>n.jsx(I,{className:"flex flex-col gap-(--sp-rung)",children:ne.map((e,a)=>a<2?n.jsx(k,{n:a+1,align:"top",children:n.jsx(C,{n:a+1,bind:t,children:n.jsx(L,{rule:e,onOpenRule:r,selected:!1,onToggleSelect:r})})},e.id):n.jsx(L,{rule:e,onOpenRule:r,selected:!1,onToggleSelect:r},e.id))}),P=({rule:t,user:e,groups:a,rise:s=!0})=>n.jsx("div",{className:s?"animate-rise-in":void 0,style:s?{animationFillMode:"backwards"}:void 0,children:n.jsxs(de,{children:[n.jsx("p",{className:"mb-2 text-sm font-semibold text-neutral-900",children:t.name}),n.jsx(ue,{expression:Se(t),user:e,groupContext:a,resolveGroupName:Ve})]})}),ie=({person:t,onPick:e})=>n.jsxs("div",{className:"flex items-center gap-2",role:"group","aria-label":"Check against",children:[n.jsx("span",{className:"text-xs font-medium text-neutral-600",children:"Check against"}),Object.keys(d).map(a=>n.jsx(ce,{active:t===a,onClick:()=>e(a),children:d[a].profile.firstName},a))]}),_e=t=>t>=2?"amara":"tomas";function Q(t){const e=H();return[...te().entries()].filter(([,a])=>a.includes(t.id)).map(([a])=>({id:a,name:e.get(a)?.profile?.name??a}))}const $={tomas:Q(d.tomas),amara:Q(d.amara)},Ve=t=>H().get(t)?.profile?.name,Le='[role="dialog"] .grid > *, [role="dialog"] [class*="space-y-(--sp-rung)"] > *',Ge=({beat:t})=>{const e=_e(t);return n.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[t===0?n.jsx(I,{className:"flex flex-col gap-(--sp-rung)",children:ne.map(a=>n.jsx(L,{rule:a,onOpenRule:r,selected:!1,onToggleSelect:r},a.id))}):n.jsxs(n.Fragment,{children:[n.jsx(ie,{person:e,onPick:r}),n.jsxs(I,{className:"flex flex-col gap-(--sp-rung)",children:[n.jsx(P,{rule:K,user:d[e],groups:$[e],rise:!1}),n.jsx(P,{rule:W,user:d[e],groups:$[e],rise:!1})]},e)]}),t>=3?n.jsx(I,{selector:Le,children:n.jsx(ee,{isOpen:!0,ruleName:h.name,mode:"deactivate",status:"done",summary:O,error:null,progress:null,onClose:r,onConfirmDeactivate:r})}):null]})},$e=`Deactivate measures before it writes: ${O.totalHeldSolely} ${O.totalHeldSolely===1?"person is":"people are"} held by this rule alone. Nobody is removed; they stay.`,Fe={stageLabel:"Rules",minHeight:740,beats:[{caption:"Every rule is one row: its name, its status, and its condition in plain words.",hold:2},{caption:"Open one and check it against Tomas. Every clause gets a verdict, and so does the rule.",hold:3},{caption:"Switch to Amara. GitHub turns to a match, and the contractor rule turns away.",hold:3},{caption:$e}],render:t=>n.jsx(Ge,{beat:t})},F=()=>{const[t,e]=p.useState(null),[a,s]=p.useState(!1),[l,u]=p.useState(null),_=p.useCallback(()=>u(null),[]),y=l?Pe(l,_):null,[m,le]=p.useState("tomas"),V=D(),S=D(),Y=D(),z=D();return n.jsxs(me,{id:"rules",show:Fe,children:[n.jsx(j,{title:"The List",intro:"A group rule is a sentence about people: whoever matches its condition goes into its target groups. The Rules tab shows you every rule in plain words, one row each, on the canvas the way the tab stacks them: the name, the status, and the condition with the syntax taken out. Press a row to open the rule's detail.",legend:[{text:n.jsx(w,{n:1,bind:V,children:"The status is a word, not a colour. The intern rule is paused, so it reads INACTIVE and places nobody; a rule Okta can no longer evaluate reads Broken."})},{text:n.jsxs(w,{n:2,bind:V,children:["The condition drops the user. prefix, so the GitHub row opens"," ",n.jsx("code",{className:"font-mono text-xs",children:'department == "Engineering"'})," where Okta stores ",n.jsx("code",{className:"font-mono text-xs",children:"user.department"}),". Group functions are spelled out the same way."]})}],children:n.jsx(Me,{bind:V})}),n.jsx(j,{title:"Check a Person",intro:"Open a rule and pick a person. The ledger walks the condition clause by clause, then states one verdict for the whole rule. This one is deliberately a hard read: a comparison made on a lowercased value, a negation, an either-or pair, a substring test, and a clause about group membership whose ids are printed as the groups they name. Press Tomas or Amara and watch both verdicts follow.",legend:[{text:n.jsx(w,{n:1,bind:S,children:Ce[m]})},{text:n.jsx(w,{n:2,bind:S,children:"A clause that asks about group membership can only be answered from the person's group list. The ledger above is given it, so its last clause is a real pass or fail; this one is not, so its clause reads not evaluated, with the groups it cites still named rather than a guess either way."})}],children:n.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[n.jsx(ie,{person:m,onPick:le}),n.jsx(k,{n:1,align:"top",children:n.jsx(C,{n:1,bind:S,children:n.jsx(P,{rule:K,user:d[m],groups:$[m]},m)})}),n.jsx(k,{n:2,align:"top",children:n.jsx(C,{n:2,bind:S,children:n.jsx(P,{rule:W,user:d[m]},m)})})]})}),n.jsxs(j,{title:"Impact",stageLabel:"Rules, deactivate",intro:`This is the verb strip on ${h.name}. Preview impact keeps the row because it writes nothing. Deactivate sits behind More, because pausing a rule is not something a second press takes back. Press either one.`,legend:[{text:n.jsx(w,{n:1,bind:Y,children:"Preview impact reads every target group and writes nothing, so it keeps the row. Press More and Deactivate appears with its cost printed beside it: it stops adding members, and everyone it already added stays where they are."})},{text:"Either press opens the same measurement. Its headline count is the people this rule holds alone, and deactivating removes none of them from a group: they stay, with no rule left to explain them."}],minHeight:t?720:void 0,children:[n.jsx(k,{n:1,align:"top",children:n.jsx(C,{n:1,bind:Y,children:n.jsx(he,{rule:h,sticky:!1,onPreviewImpact:()=>e("preview"),tierOpen:a,onTierOpenChange:s,isConfirmingActivate:!1,onRequestActivate:r,onCancelActivate:r,onConfirmActivate:r,onRequestDeactivate:()=>e("deactivate")})})}),n.jsx(ee,{isOpen:t!==null,ruleName:h.name,mode:t??"preview",status:"done",summary:O,error:null,progress:null,onClose:()=>e(null),onConfirmDeactivate:()=>e(null)})]}),n.jsxs(j,{title:"Duplicates",stageLabel:"Rules, duplicates",intro:`${Ie} rules in this org carry the same condition and the same exclusions, so the rules strip offers View duplicates. This is the rung it opens. Pick the rule to keep, rename it if you want, and press Review merge.`,legend:[{text:n.jsx(w,{n:1,bind:z,children:"The set counts its rules and the target groups they add up to, and prints the condition they share. The kept rule defaults to the active one, then the oldest, and its row says why. Rename opens its name; a name Okta would refuse takes Review merge away and says why."})},{text:"The confirm names the kept rule and any new name, lists every target group with the new ones marked, and names the rules it retires. The kept rule takes their groups in place, so it keeps its id. Nothing is written until you confirm."}],outro:"A merge is recorded in History with the kept rule's old and new name. It is not undone from there: a retired rule can only be recreated, and a recreated rule gets a new id.",minHeight:y?720:void 0,children:[n.jsx(k,{n:1,align:"top",children:n.jsx(C,{n:1,bind:z,children:n.jsx(ge,{sets:oe,allRules:se,merged:[],groupName:re,onViewRule:r,onReviewMerge:u})})}),y&&n.jsx(ve,{run:y,basket:Ee})]})]})};try{F.displayName="rules",F.__docgenInfo={description:"",displayName:"rules",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/rules.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:o,userEvent:i,within:c}=__STORYBOOK_MODULE_TEST__,Pt={title:"Guide/Chapters/rules",component:F,decorators:[pe("rules")],parameters:U,parameters:{docs:{description:{component:"The Rules chapter, in the shell, rail on Rules."}}}},v={},f={parameters:{...U,motion:"on"},play:async({canvasElement:t})=>{await Z(t);const e=c(t.querySelector(".guide-show"));await o(e.getByText(/held by this rule alone\. Nobody is removed; they stay\./)).toBeInTheDocument();const a=e.getByRole("dialog",{name:"Deactivate rule?"});await o(c(a).getByText("Held by this rule alone")).toBeInTheDocument(),await o(c(a).getByText(/held by this rule alone$/)).toBeInTheDocument(),await o(e.getByRole("button",{name:"Amara"})).toHaveAttribute("aria-pressed","true")}},b={parameters:{...U,motion:"on"},play:async({canvasElement:t})=>{await Z(t);const e=g(t);await i.click(await e.findByRole("button",{name:"Amara"})),await o(e.getByRole("button",{name:"Amara"})).toHaveAttribute("aria-pressed","true"),await o(e.getByText(/the rule matches her/)).toBeVisible()}},x={play:async({canvasElement:t})=>{const e=g(t),[a]=await e.findAllByRole("button",{name:"Raw expression"});await i.click(a),await o(a).toHaveAttribute("aria-pressed","true")}},R={play:async({canvasElement:t})=>{const e=g(t);await o(e.getByText(/settles the rule: no match/)).toBeVisible(),await o(e.getAllByText("Rule does not match").length).toBeGreaterThan(0),await i.click(e.getByRole("button",{name:"Amara"})),await o(e.getByRole("button",{name:"Amara"})).toHaveAttribute("aria-pressed","true"),await o(e.getByRole("button",{name:"Tomas"})).toHaveAttribute("aria-pressed","false"),await o(e.getByText(/the rule matches her/)).toBeVisible(),await o(e.getAllByText("Rule matches this user").length).toBeGreaterThan(0)}},B={play:async({canvasElement:t})=>{const e=g(t),a=e.getByText(/The status is a word, not a colour/),s=e.getByRole("heading",{name:/Interns/}).closest("[data-hot]");if(!s)throw new Error("The Interns row is not wrapped in a linked frame");await i.hover(s),await o(a).toHaveAttribute("data-hot","true"),await i.unhover(s),await o(a).toHaveAttribute("data-hot","false"),await i.hover(a),await o(s).toHaveAttribute("data-hot","true"),await i.unhover(a),await o(s).toHaveAttribute("data-hot","false")}},T={play:async({canvasElement:t})=>{const e=g(t);await i.click(await e.findByRole("button",{name:"Preview impact"}));const a=await e.findByRole("dialog",{name:"Rule impact preview"});await o(c(a).getByText("Held by this rule alone")).toBeVisible(),await o(c(a).getByRole("button",{name:"Close"})).toBeVisible()}},E={play:async({canvasElement:t})=>{const e=g(t);await i.click(await e.findByRole("button",{name:"More"})),await i.click(await e.findByRole("button",{name:"Deactivate rule"}));const a=await e.findByRole("dialog",{name:"Deactivate rule?"});await o(a).toBeVisible(),await o(c(a).getByText("Held by this rule alone")).toBeVisible(),await i.click(c(a).getByRole("button",{name:"Cancel"})),await o(e.queryByRole("dialog",{name:"Deactivate rule?"})).not.toBeInTheDocument()}},A={play:async({canvasElement:t})=>{const e=g(t);await i.click(e.getByRole("button",{name:"Review merge"}));const a=await c(t.ownerDocument.body).findByRole("dialog",{name:/^Merge 2 rules into /});await o(a).toBeVisible(),await o(c(a).getByRole("region",{name:"Retiring 1 rule"})).toBeVisible()}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:"{}",...v.parameters?.docs?.source},description:{story:"The chapter as a reader sees it, the show already on its still.",...v.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(show.getByText(/held by this rule alone\\. Nobody is removed; they stay\\./)).toBeInTheDocument();
    const dialog = show.getByRole('dialog', {
      name: 'Deactivate rule?'
    });
    await expect(within(dialog).getByText('Held by this rule alone')).toBeInTheDocument();
    await expect(within(dialog).getByText(/held by this rule alone$/)).toBeInTheDocument();
    await expect(show.getByRole('button', {
      name: 'Amara'
    })).toHaveAttribute('aria-pressed', 'true');
  }
}`,...f.parameters?.docs?.source},description:{story:`The show, with motion on: three rows land, the condition is read against
Tomas, the person flips to Amara, then Deactivate's finished preview cascades
in. The play waits for the still and asserts what it holds: the last caption,
the open preview, its headline figure, and Amara still pressed.`,...f.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Amara'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Amara'
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText(/the rule matches her/)).toBeVisible();
  }
}`,...b.parameters?.docs?.source},description:{story:"The choreography with motion on: the list's rows cascade in after their\nstage, and the ledger rises in afresh when the person changes. Same\nassertions as `PersonSwitched`; the motion is the subject.",...b.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const [toggle] = await canvas.findAllByRole('button', {
      name: 'Raw expression'
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  }
}`,...x.parameters?.docs?.source},description:{story:"The ledger's raw toggle flips to the tenant's own expression text and back.",...x.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(canvas.getByText(/settles the rule: no match/)).toBeVisible();
    await expect(canvas.getAllByText('Rule does not match').length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Amara'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Amara'
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', {
      name: 'Tomas'
    })).toHaveAttribute('aria-pressed', 'false');
    await expect(canvas.getByText(/the rule matches her/)).toBeVisible();
    await expect(canvas.getAllByText('Rule matches this user').length).toBeGreaterThan(0);
  }
}`,...R.parameters?.docs?.source},description:{story:`Picking Amara re-evaluates both ledgers and the first legend line follows: the
GitHub rule matches her, where it did not match Tomas. The two assertions are
the same pair as before, read off the rewritten verdict sentences.`,...R.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const line = canvas.getByText(/The status is a word, not a colour/);
    const row = canvas.getByRole('heading', {
      name: /Interns/
    }).closest('[data-hot]');
    if (!row) throw new Error('The Interns row is not wrapped in a linked frame');
    await userEvent.hover(row);
    await expect(line).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(row);
    await expect(line).toHaveAttribute('data-hot', 'false');
    await userEvent.hover(line);
    await expect(row).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(line);
    await expect(row).toHaveAttribute('data-hot', 'false');
  }
}`,...B.parameters?.docs?.source},description:{story:"Resting the pointer on a marked row lights its legend line, and resting on the\nline lights the row. Both halves are asserted through the `data-hot` attribute\neach side sets, not through a class.",...B.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Preview impact'
    }));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Rule impact preview'
    });
    await expect(within(dialog).getByText('Held by this rule alone')).toBeVisible();
    await expect(within(dialog).getByRole('button', {
      name: 'Close'
    })).toBeVisible();
  }
}`,...T.parameters?.docs?.source},description:{story:`The row verb: Preview impact writes nothing, so it opens the read-only
preview whose footer offers Close and no Deactivate.`,...T.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: 'More'
    }));
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Deactivate rule'
    }));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Deactivate rule?'
    });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByText('Held by this rule alone')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', {
      name: 'Cancel'
    }));
    await expect(canvas.queryByRole('dialog', {
      name: 'Deactivate rule?'
    })).not.toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source},description:{story:`The tier verb: Deactivate lives behind More on the rule's own strip, and the
dialog it opens is the confirm. Cancel closes it without writing.`,...E.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Review merge'
    }));
    // The confirm is a \`Modal\`, portalled to the document body, outside the reader body.
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: /^Merge 2 rules into /
    });
    await expect(dialog).toBeVisible();
    await expect(within(dialog).getByRole('region', {
      name: 'Retiring 1 rule'
    })).toBeVisible();
  }
}`,...A.parameters?.docs?.source},description:{story:"Review merge opens the merge confirm, naming the rules it retires.",...A.parameters?.docs?.description}}};const Ht=["Default","Show","Choreography","RawExpressionShown","PersonSwitched","LegendLinked","PreviewOpened","ImpactOpened","MergeOpened"];export{b as Choreography,v as Default,E as ImpactOpened,B as LegendLinked,A as MergeOpened,R as PersonSwitched,T as PreviewOpened,x as RawExpressionShown,f as Show,Ht as __namedExportsOrder,Pt as default};
