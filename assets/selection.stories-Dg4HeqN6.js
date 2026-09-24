import{r as D,j as e,am as _,i as Q,L as le,a as ue,I as de,B as he,y as pe,z as me,T as ge}from"./iframe-mmN7AxbW.js";import{C as be,a as G,w as we,b as fe,r as K}from"./chapterStory-BJBxwv1h.js";import{S as C,M as b}from"./Scene-D2nzHScN.js";import{A as M}from"./Assemble-BfsBqw6B.js";import{S as $}from"./SelectionPane-DSEGeQnu.js";import{V as N}from"./VerbList-DOZ6GAGz.js";import{V as ee}from"./VerbRunner-CK-T3KUd.js";import{u as X}from"./useCountUp-DBR4-HMR.js";import{b as ye,f as ve,G as xe}from"./memberships-DTz2buzd.js";import{u as ke}from"./userDisplay-xpx41Abi.js";import{a as Be}from"./dateFormat-C9yVDsck.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./InstallCta-wq3hO1J-.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./types-CedNKx8Z.js";import"./registry-l4mQzsmW.js";import"./groupRuleIndex-CUdSMoPG.js";import"./fetchGroupRulesRequest-DgNCr2VU.js";import"./ruleUtils-Vt2BA8lQ.js";import"./oktaPagination-DzUnd2oi.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";import"./orgSnapshotStore-CqR6Bu-g.js";import"./index-Dob3nYDb.js";import"./types-aoYpQiYS.js";import"./ruleOrphans-w7zgihHR.js";import"./selectionStore-CrmbAKHN.js";import"./memberRuleAttribution-DwskNnmH.js";import"./profile-Bul2VYbY.js";import"./undoManager-Db5dJWVO.js";import"./ruleExpression-YtJDU2CF.js";import"./profileDraft-qVcYAhdY.js";import"./membershipAnalysis-BZfvnwXl.js";import"./groupContext-D0LcfWax.js";import"./membershipVerdict-DUrEZuW9.js";import"./sourceLine-6HOHdWfm.js";import"./profileAttributes-D7zGcuAf.js";import"./profileFields-BZvCtc6D.js";import"./memberAnalytics-_apwJWix.js";import"./entityCache-CUqsH66e.js";import"./keys-CUIcVywe.js";import"./AttributeSpreadBar-QNQoFo_X.js";import"./chartPalette-Byit8206.js";import"./BreakdownReport-8ktuwLFZ.js";import"./csvUtils-DgNWYp8m.js";const Te=ye.filter(t=>t.profile.department==="Marketing"&&t.status==="ACTIVE").slice(0,4),te={kind:"group",id:ve("00g",xe.sales),name:"Sales - All"},V=t=>({picked:t.map((n,o)=>({...n,pickedAt:17e11+o}))}),W=t=>{const n={};for(const o of t.picked)n[o.kind]=(n[o.kind]??0)+1;return n},d=V([...Te.map(t=>({kind:"user",id:t.id,name:ke(t)})),te]),H=W(d),q=V(d.picked.filter(t=>t.kind==="user")),Z=W(q),p=(t,n)=>t.picked.filter(o=>o.kind===n).length,B=t=>({path:"write",cost:()=>({requests:1,writes:1}),run:async()=>({status:"done",summary:"Done."}),...t}),ne=t=>{const n=p(t,"user")*p(t,"group");return{requests:n,writes:n}},Re=B({id:"add-users-to-groups",label:"Add to groups",title:"Add these users to these groups",needs:["user","group"],cost:ne}),je=B({id:"remove-users-from-groups",label:"Remove from groups",title:"Remove these users from these groups",needs:["user","group"],cost:ne}),Y=B({id:"bulk-update-user-profile",label:"Set a profile attribute",title:"Set one profile attribute on these users",needs:["user"],cost:t=>({requests:p(t,"user"),writes:p(t,"user")})}),Se=B({id:"remove-inactive-members",label:"Remove inactive members",title:"Remove deactivated, suspended and locked-out members from these groups",needs:["group"],cost:t=>({requests:0,walks:[{count:p(t,"group"),kind:"membership"}],writes:0})}),Ae=B({id:"deactivate-rules",label:"Turn rules off",title:"Turn these group rules off",needs:["rule"]}),U=B({id:"group-overlap",label:"Members these groups share",title:"Report which members these groups share",path:"read",needs:["group"],isAvailable:t=>p(t,"group")>=2,unavailableReason:"Needs at least two groups: an overlap of one group is not a question.",cost:t=>({requests:p(t,"group"),writes:0})}),oe=[Re,je,Y,Se],l=()=>{},se=t=>({verb:Y,stage:"confirm",preflight:{cost:{requests:3,writes:3},items:3,lines:["3 of 4 users will have Department set to Advertising","Overwrites Marketing (3)","1 user already holds that value, and costs no write","3 users would stop matching Marketing by department, so Okta drops them from Marketing - All"]},progress:"",outcome:null,error:null,fields:[],values:{},setValue:l,isComposed:!0,isRefreshing:!1,submitFields:l,start:l,confirm:t,close:t}),O=[{id:"colFAKE0001",name:"Marketing to Advertising",counts:H,savedAt:Date.UTC(2026,8,14,9,30)},{id:"colFAKE0002",name:"Contractor access review",counts:{user:12,group:2,policy:1},savedAt:Date.UTC(2026,8,2,16,5)}],ae=["user","group","app","rule","policy"],Ee=t=>ae.filter(n=>(t[n]??0)>0).map(n=>`${t[n]} ${pe(t[n]??0,me[n])}`).join(" · "),De=t=>{const n={};for(const o of t)for(const s of ae){const r=o[s]??0;r>0&&(n[s]=(n[s]??0)+r)}return n},Ie=({count:t,children:n})=>{const o=D.useId();return e.jsxs("section",{className:"rounded-md border border-neutral-200 bg-white px-4 py-3","aria-labelledby":o,children:[e.jsxs("h4",{id:o,className:"flex items-center gap-(--sp-inline) text-xs font-semibold uppercase tracking-wide text-neutral-600",style:{fontFamily:"var(--font-heading)"},children:[e.jsx("span",{children:"Saved collections"}),e.jsx(he,{variant:"neutral",children:t})]}),e.jsx("div",{className:"mt-3",children:n})]})},z=({children:t})=>e.jsxs("div",{className:"flex min-h-9 items-center gap-2 rounded-md border border-neutral-200 bg-white px-(--sp-gutter) py-1.5",children:[e.jsx("span",{className:"min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900",children:te.name}),e.jsxs("div",{className:"relative flex shrink-0 items-center gap-1",children:[t,e.jsx(ue,{label:"Refresh",variant:"ghost",size:"sm",title:"Refresh",children:e.jsx(de,{type:"refresh",size:"sm"})})]})]});function L(){const[t,n]=D.useState(null);return{hot:t,onHot:n}}const w=({scene:t,n,hot:o,onHot:s,children:r})=>{const i=`${t}:${n}`;return e.jsx("div",{className:"rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2","data-spot":i,"data-lit":o===i||void 0,onPointerEnter:()=>s(i),onPointerLeave:()=>s(null),onFocus:()=>s(i),onBlur:()=>s(null),children:r})},f=({scene:t,n,hot:o,onHot:s,children:r})=>{const i=`${t}:${n}`;return e.jsx("span",{className:"-mx-1.5 -my-0.5 box-decoration-clone rounded-sm px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:bg-primary-light","data-spot":i,"data-lit":o===i||void 0,onPointerEnter:()=>s(i),onPointerLeave:()=>s(null),children:r})},Ce=V([]),Le=t=>[{key:"selection",label:"Selection",count:t,countDisplay:"nonzero"},{key:"actions",label:"Actions"},{key:"reports",label:"Reports"},{key:"collections",label:"Collections",count:O.length,countDisplay:"nonzero"}],Ne="section h2, section .space-y-\\(--sp-inline\\) > *",qe=":scope > div > *",Oe='[role="dialog"] li',He=({beat:t})=>{const n=t>=1,o=X(n?p(d,"user"):0).value,s=X(n?p(d,"group"):0).value,r=o+s,i={...o>0?{user:o}:{},...s>0?{group:s}:{}},m=t>=2?"actions":"selection";return e.jsxs("div",{className:"flex flex-col gap-(--sp-gutter)",children:[e.jsx(z,{children:e.jsx("span",{className:"inline-flex animate-rise-in",children:e.jsx(_,{counts:i,total:r,onOpen:l})},String(n))}),e.jsxs("div",{children:[e.jsx(ge,{tabs:Le(r),activeKey:m,onChange:l,variant:"underline",ariaLabel:"Selection sections"}),e.jsx("div",{className:"mt-(--sp-rung)",children:m==="selection"?n?e.jsx(M,{selector:Ne,children:e.jsx($,{basket:d,counts:H,query:"",onRemove:l,onClearKind:l})}):e.jsx($,{basket:Ce,counts:{},query:"",onRemove:l,onClearKind:l}):e.jsx(M,{selector:qe,children:e.jsx(N,{verbs:[...oe,U],basket:d,counts:H,onRun:l,emptyIcon:"bolt",emptyTitle:"No actions yet",emptyDescription:"None are wired yet."})})})]}),t>=3?e.jsx(M,{selector:Oe,children:e.jsx(ee,{run:se(l),basket:d})}):null]})},Pe={stageLabel:"Selection",minHeight:470,beats:[{caption:"Nothing ticked, so there is no count beside Refresh and no verb to run.",hold:2},{caption:"Tick four people in Marketing and the Sales group. One basket holds both.",hold:4},{caption:"Actions prices every verb from the basket: four users into one group, four requests.",hold:3},{caption:"Set a profile attribute counts first, then the confirm quotes what it found."}],render:t=>e.jsx(He,{beat:t})},Me=(t,n)=>t.kind===n.kind&&t.id===n.id,F=()=>{const t=L(),n=L(),o=L(),s=L(),[r,i]=D.useState(d.picked),m={picked:[...r]},v=W(m),I=r.length,x=I<d.picked.length,[T,k]=D.useState(!1),g=se(()=>k(!1)),[re,ie]=D.useState([]),J=De(O.filter(c=>re.includes(c.id)).map(c=>c.counts)),ce=Object.values(J).reduce((c,h)=>c+h,0);return e.jsxs(be,{id:"selection",show:Pe,children:[e.jsx(C,{title:"The Basket",intro:"Some changes are about a cohort, not a person. Tick rows wherever you find them, in Users results, in a group's members, in a rule's list, and every tick lands in one basket. The count sits beside Refresh at the top of the panel. Click it and the Selection pane lists what you ticked. This frame is live: untick a row and the count drops with it.",outro:"The basket keeps users, groups, apps, rules and policies apart, because a verb acts on a kind. Ticking a group does not tick its members; the Selection pane offers to add them when you want that.",legend:[{text:e.jsx(f,{scene:"basket",n:1,...t,children:"The count is the whole basket. Hover it and the per-kind breakdown grows leftward over the tab name, never pushing Refresh out of its pixel. Untick everything and the control goes, rather than sitting there reading zero."})},{text:e.jsx(f,{scene:"basket",n:2,...t,children:"One card per kind, titled with that kind's real count. The cross unticks one row. Clear empties the whole section and asks first, because nothing re-ticks it for you."})}],minHeight:360,children:e.jsxs("div",{className:"flex flex-col gap-(--sp-gutter)",children:[e.jsx(b,{n:1,children:e.jsx(w,{scene:"basket",n:1,...t,children:e.jsx(z,{children:e.jsx(_,{counts:v,total:I,onOpen:l})})})}),e.jsx(b,{n:2,align:"top",children:e.jsx(w,{scene:"basket",n:2,...t,children:e.jsx($,{basket:m,counts:v,query:"",onRemove:c=>i(h=>h.filter(P=>!Me(P,c))),onClearKind:c=>i(h=>h.filter(P=>P.kind!==c))})})}),e.jsx("div",{className:"flex min-h-7 items-center justify-end",children:x?e.jsx(Q,{variant:"ghost",size:"xs",onClick:()=>i(d.picked),children:"Put them back"}):null})]})}),e.jsx(C,{title:"Verbs",intro:"The Actions pane lists the verbs that can run against this basket, each one priced from what you ticked before you start it.",outro:"The verbs come in families. Membership adds ticked users to ticked groups or takes them out. Cleanup removes deactivated, suspended and locked-out members from ticked groups. Rules turn ticked group rules on or off. Reports, on their own pane, read and never write: which members ticked groups share, MFA enrolment across them, what ticked rules hold up.",legend:[{text:e.jsx(f,{scene:"verb",n:1,...n,children:"A verb names what it does to the basket and prices itself from it: four users into one group is four requests and four changed entities. Only the verbs that write get the red control."})},{text:e.jsx(f,{scene:"verb",n:2,...n,children:"The same basket with the group unticked. A verb whose object is missing is never offered, so the pane names the kinds it is waiting for instead of showing a control that cannot run."})}],children:e.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[e.jsx(b,{n:1,align:"top",children:e.jsx(w,{scene:"verb",n:1,...n,children:e.jsx(N,{verbs:[...oe,U],basket:d,counts:H,onRun:l,emptyIcon:"bolt",emptyTitle:"No actions yet",emptyDescription:"None are wired yet."})})}),e.jsx(b,{n:2,align:"top",children:e.jsx(w,{scene:"verb",n:2,...n,children:e.jsx(N,{verbs:[Ae,U],basket:q,counts:Z,onRun:l,emptyIcon:"bolt",emptyTitle:"No actions yet",emptyDescription:"None are wired yet."})})})]})}),e.jsxs(C,{title:"Preflight",stageLabel:"Selection, Actions",intro:"Every run counts before it changes anything. Click Set a profile attribute and the confirm opens on what the counting found, four ticked users in, three of them changing.",legend:[{text:e.jsx(f,{scene:"run",n:1,...o,children:"The profile verb sets one attribute to one value on every ticked user. Press it and nothing is written yet: the run measures the four users first, and the confirm quotes those counts back to you before the button that spends them."})}],outro:"The confirm quotes what was measured, never a projection: how many users will change, what values get overwritten, who already holds the value and costs no write, and which group rule reads that attribute and would move people out of a group. Then the exact cost, and a plain statement that the change cannot be undone from here. Escape closes the dialog; a run already going keeps going, and the activity bar is where you stop it.",minHeight:440,children:[e.jsx(b,{n:1,align:"top",children:e.jsx(w,{scene:"run",n:1,...o,children:e.jsx(N,{verbs:[Y],basket:q,counts:Z,onRun:()=>k(!0),emptyIcon:"bolt",emptyTitle:"No actions yet",emptyDescription:"None are wired yet."})})}),T&&e.jsx(ee,{run:g,basket:q})]}),e.jsx(C,{title:"Saved Cohorts",intro:"Save as collection names the basket and keeps it for this org. The Collections pane lists what you saved, newest first.",legend:[{text:e.jsx(f,{scene:"keep",n:1,...s,children:"The count above is the basket, and Load is what grows it. Load the same collection twice and the count stays where it is, because the basket keys on the entity, not on the click."})},{text:e.jsx(f,{scene:"keep",n:2,...s,children:"A row says what the collection holds by kind and the day you saved it. Load ticks all of it again, on top of whatever is already in the basket."})}],outro:"Collections live in this browser, for this org. A row is an id, so loading one later finds those same entities again. A user saved without a name costs one request to name again, and the pane says how many before it spends them.",children:e.jsxs("div",{className:"flex flex-col gap-(--sp-gutter)",children:[e.jsx(b,{n:1,children:e.jsx(w,{scene:"keep",n:1,...s,children:e.jsx(z,{children:e.jsx(_,{counts:J,total:ce,onOpen:l})})})}),e.jsx(b,{n:2,align:"top",children:e.jsx(w,{scene:"keep",n:2,...s,children:e.jsx(Ie,{count:O.length,children:e.jsx("div",{className:"space-y-(--sp-inline)",children:O.map(c=>e.jsx("div",{"data-testid":"guide-collection",children:e.jsx(le,{density:"compact",children:e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsxs("span",{className:"flex min-w-0 flex-col",children:[e.jsx("span",{className:"truncate text-sm font-semibold text-neutral-900",children:c.name}),e.jsxs("span",{className:"text-xs text-neutral-500",children:[Ee(c.counts)," · Saved"," ",Be(c.savedAt)]})]}),e.jsx(Q,{variant:"secondary",size:"xs",ariaLabel:`Load ${c.name}`,onClick:()=>ie(h=>h.includes(c.id)?h:[...h,c.id]),children:"Load"})]})})},c.id))})})})})]})})]})};try{F.displayName="selection",F.__docgenInfo={description:"",displayName:"selection",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/selection.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:a,userEvent:u,within:y}=__STORYBOOK_MODULE_TEST__,_t={title:"Guide/Chapters/selection",component:F,decorators:[we("selection")],parameters:G,parameters:{docs:{description:{component:"The Selection chapter, in the shell, rail on Selection."}}}},R={},j={parameters:{...G,motion:"on"},play:async({canvasElement:t})=>{await fe(t);const n=y(t.querySelector(".guide-show"));await a(n.getByText("Set a profile attribute counts first, then the confirm quotes what it found.")).toBeInTheDocument(),await a(n.getByRole("dialog",{name:"Set one profile attribute on these users"})).toBeInTheDocument(),await a(n.getByText("3 of 4 users will have Department set to Advertising")).toBeInTheDocument(),await a(n.getByRole("button",{name:/4 users and 1 group selected/})).toBeInTheDocument()}},S={play:async({canvasElement:t})=>{const n=K(t),o=y(n.getByRole("region",{name:"The Basket"}));await a(o.getByRole("button",{name:/4 users and 1 group selected/})).toBeInTheDocument();const s=o.getAllByRole("button",{name:/^Remove /});await u.click(s[0]),await a(o.getByRole("button",{name:/3 users and 1 group selected/})).toBeInTheDocument(),await u.click(o.getByRole("button",{name:"Clear groups"}));const r=y(await o.findByRole("dialog"));await u.click(r.getByRole("button",{name:"Clear"})),await a(o.queryByRole("dialog")).not.toBeInTheDocument(),await a(o.getByRole("button",{name:/^3 users selected$/})).toBeInTheDocument();for(const i of o.getAllByRole("button",{name:/^Remove /}))await u.click(i);await a(o.queryByRole("button",{name:/selected/})).not.toBeInTheDocument(),await a(o.getByText("Nothing selected")).toBeInTheDocument(),await a(o.getByRole("button",{name:"Refresh"})).toBeInTheDocument(),await u.click(o.getByRole("button",{name:"Put them back"})),await a(o.getByRole("button",{name:/4 users and 1 group selected/})).toBeInTheDocument(),await a(o.queryByRole("button",{name:"Put them back"})).not.toBeInTheDocument()}},A={play:async({canvasElement:t})=>{const n=K(t),o=y(n.getByRole("region",{name:"Preflight"}));await u.click(o.getByRole("button",{name:"Set one profile attribute on these users"}));const s=y(await n.findByRole("dialog",{name:"Set one profile attribute on these users"}));await a(s.getByText("3 of 4 users will have Department set to Advertising")).toBeInTheDocument(),await a(s.getByText(/cannot be undone from here/)).toBeInTheDocument(),await a(s.getByRole("button",{name:"Set a profile attribute"})).toBeInTheDocument(),await u.click(s.getByRole("button",{name:"Cancel"})),await a(n.queryByRole("dialog")).not.toBeInTheDocument(),await u.click(o.getByRole("button",{name:"Set one profile attribute on these users"})),await a(await n.findByRole("dialog",{name:"Set one profile attribute on these users"})).toBeInTheDocument()}},E={parameters:{...G,motion:"on"},play:async({canvasElement:t})=>{const n=K(t),o=t.querySelector('[data-testid="guide-body"]'),s=g=>o.querySelectorAll(`[data-spot="${g}"]`),[r,i]=Array.from(s("verb:1")),[m,v]=Array.from(s("verb:2"));await u.hover(r),await a(r).toHaveAttribute("data-lit"),await a(i).toHaveAttribute("data-lit"),await a(m).not.toHaveAttribute("data-lit"),await a(v).not.toHaveAttribute("data-lit"),await u.unhover(r),await a(i).not.toHaveAttribute("data-lit"),await u.hover(v),await a(m).toHaveAttribute("data-lit"),await a(r).not.toHaveAttribute("data-lit");for(const g of Array.from(s("basket:2")))await a(g).not.toHaveAttribute("data-lit");await u.unhover(v);const[I]=Array.from(s("keep:1")),x=()=>y(I).queryByRole("button",{name:/selected$/})?.textContent??null;await a(x()).toBe(null);const T=n.getAllByTestId("guide-collection"),k=g=>u.click(y(g).getByRole("button",{name:/^Load /}));await k(T[0]),await a(x()).toBe("5"),await k(T[0]),await a(x()).toBe("5"),await k(T[1]),await a(x()).toBe("20")}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:"{}",...R.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...R.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(show.getByText('Set a profile attribute counts first, then the confirm quotes what it found.')).toBeInTheDocument();
    await expect(show.getByRole('dialog', {
      name: 'Set one profile attribute on these users'
    })).toBeInTheDocument();
    await expect(show.getByText('3 of 4 users will have Department set to Advertising')).toBeInTheDocument();
    await expect(show.getByRole('button', {
      name: /4 users and 1 group selected/
    })).toBeInTheDocument();
  }
}`,...j.parameters?.docs?.source},description:{story:`The show plays through to its still: the profile verb's confirm over the
Actions pane, quoting what the preflight measured, with the count strip and
the Selection tab both saying five. Motion on, so the beats actually step;
the play waits for the last one before it looks.`,...j.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const scene = within(canvas.getByRole('region', {
      name: 'The Basket'
    }));
    await expect(scene.getByRole('button', {
      name: /4 users and 1 group selected/
    })).toBeInTheDocument();
    const removes = scene.getAllByRole('button', {
      name: /^Remove /
    });
    await userEvent.click(removes[0]);
    await expect(scene.getByRole('button', {
      name: /3 users and 1 group selected/
    })).toBeInTheDocument();

    // Clear the group section: the pane asks first, inside the frame.
    await userEvent.click(scene.getByRole('button', {
      name: 'Clear groups'
    }));
    const dialog = within(await scene.findByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', {
      name: 'Clear'
    }));
    await expect(scene.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(scene.getByRole('button', {
      name: /^3 users selected$/
    })).toBeInTheDocument();

    // Untick the rest: the count goes absent, not to zero, and the pane says so
    // in the panel's own words. Refresh stays in the same pixel either way.
    for (const button of scene.getAllByRole('button', {
      name: /^Remove /
    })) {
      await userEvent.click(button);
    }
    await expect(scene.queryByRole('button', {
      name: /selected/
    })).not.toBeInTheDocument();
    await expect(scene.getByText('Nothing selected')).toBeInTheDocument();
    await expect(scene.getByRole('button', {
      name: 'Refresh'
    })).toBeInTheDocument();
    await userEvent.click(scene.getByRole('button', {
      name: 'Put them back'
    }));
    await expect(scene.getByRole('button', {
      name: /4 users and 1 group selected/
    })).toBeInTheDocument();
    await expect(scene.queryByRole('button', {
      name: 'Put them back'
    })).not.toBeInTheDocument();
  }
}`,...S.parameters?.docs?.source},description:{story:`The first basket is live. Unticking a person drops the count in the strip
above; Clear on the group section asks, then empties it; with nothing left
the count is gone from the context strip and the pane states the absence in
the panel's own words; Put them back restores the five.`,...S.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    // The show's still holds the same confirm, so every query stays below it.
    const canvas = readerCanvas(canvasElement);
    // The Actions scene lists the same verb; only the run scene opens it.
    const scene = within(canvas.getByRole('region', {
      name: 'Preflight'
    }));
    await userEvent.click(scene.getByRole('button', {
      name: 'Set one profile attribute on these users'
    }));
    const dialog = within(await canvas.findByRole('dialog', {
      name: 'Set one profile attribute on these users'
    }));
    await expect(dialog.getByText('3 of 4 users will have Department set to Advertising')).toBeInTheDocument();
    await expect(dialog.getByText(/cannot be undone from here/)).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Set a profile attribute'
    })).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    // Reopens on the next click, and is left open so the story shows the confirm.
    await userEvent.click(scene.getByRole('button', {
      name: 'Set one profile attribute on these users'
    }));
    await expect(await canvas.findByRole('dialog', {
      name: 'Set one profile attribute on these users'
    })).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source},description:{story:`The profile verb's confirm opens on click, inside the frame, and quotes what
the preflight measured; Cancel closes it, and the next click reopens it.`,...A.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const body = canvasElement.querySelector<HTMLElement>('[data-testid="guide-body"]') as HTMLElement;
    const spot = (id: string) => body.querySelectorAll(\`[data-spot="\${id}"]\`);
    const [verbTarget, verbLine] = Array.from(spot('verb:1'));
    const [otherTarget, otherLine] = Array.from(spot('verb:2'));

    // Element to line.
    await userEvent.hover(verbTarget);
    await expect(verbTarget).toHaveAttribute('data-lit');
    await expect(verbLine).toHaveAttribute('data-lit');
    await expect(otherTarget).not.toHaveAttribute('data-lit');
    await expect(otherLine).not.toHaveAttribute('data-lit');
    await userEvent.unhover(verbTarget);
    await expect(verbLine).not.toHaveAttribute('data-lit');

    // Line to element, and a scene's number one does not light another's.
    await userEvent.hover(otherLine);
    await expect(otherTarget).toHaveAttribute('data-lit');
    await expect(verbTarget).not.toHaveAttribute('data-lit');
    for (const el of Array.from(spot('basket:2'))) await expect(el).not.toHaveAttribute('data-lit');
    await userEvent.unhover(otherLine);

    // Load ticks the collection's rows back into the basket, and the count in
    // the strip above the card says so. Loading the same one again leaves the
    // count where it is, because the basket keys on the entity.
    const [countStrip] = Array.from(spot('keep:1')) as HTMLElement[];
    const countOf = () => within(countStrip).queryByRole('button', {
      name: /selected$/
    })?.textContent ?? null;
    await expect(countOf()).toBe(null);
    const rows = canvas.getAllByTestId('guide-collection');
    const load = (row: HTMLElement) => userEvent.click(within(row).getByRole('button', {
      name: /^Load /
    }));
    await load(rows[0]);
    await expect(countOf()).toBe('5');
    await load(rows[0]);
    await expect(countOf()).toBe('5');
    await load(rows[1]);
    await expect(countOf()).toBe('20');
  }
}`,...E.parameters?.docs?.source},description:{story:`Each marked element and its legend line light each other, and Load grows the
count above the collections card. Motion on, so the ring and the tint run as
a reader sees them; the assertions read the \`data-lit\` flag and the count's
own accessible name, neither of which depends on it.`,...E.parameters?.docs?.description}}};const $t=["Default","Show","BasketThinned","ConfirmOpened","MarkersLightTheirLines"];export{S as BasketThinned,A as ConfirmOpened,R as Default,E as MarkersLightTheirLines,j as Show,$t as __namedExportsOrder,_t as default};
