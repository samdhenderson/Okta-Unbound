import{r as H,j as t,E as be}from"./iframe-mmN7AxbW.js";import{C as Re,F as Ae,a as F,w as je,b as Ee,r as G}from"./chapterStory-BJBxwv1h.js";import{B as Te}from"./Band-DluAEd5K.js";import{S as k,M as g}from"./Scene-D2nzHScN.js";import{A as V}from"./Assemble-BfsBqw6B.js";import{u as Se}from"./useTyped-CRITGoQX.js";import{h as He}from"./InstallCta-wq3hO1J-.js";import{J as ne}from"./JumpBar-iQ5L7rJM.js";import{J as Be}from"./JumpResultRow-DbMKZd7j.js";import{O as ae}from"./OrgSnapshotCard-DpYaYYPJ.js";import{F as ke}from"./FigureNumber-L-zgAkk2.js";import{a as Oe}from"./ReportRow-oZ49qSL0.js";import{a as Ce}from"./EntityChooser-Du1Aqvt_.js";import{M as Me}from"./MfaCoverageLauncher-BQGg_dgJ.js";import{W as Ne}from"./WorkingSet-fss6F8mJ.js";import{b as N,a as I,c as P}from"./orgFigures-Z-hvuRoQ.js";import{c as W}from"./homeReports-DENgM1_q.js";import{u as O}from"./useCountUp-DBR4-HMR.js";import{c as Ie,D as J,f as se,e as Pe,G as _e}from"./memberships-DTz2buzd.js";import{c as $e,a as K,e as L,d as oe,D as De}from"./snapshot-D1CIyPrl.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./githubLinks-BfCtNl-2.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./dateFormat-C9yVDsck.js";import"./WorkingSetRow-BIARlDpF.js";const i=()=>{},M=(e,n,a)=>`${e.toLocaleString()} ${e===1?n:a}`,d=Ie.get(Pe.left)??Fe();function Fe(){throw new Error("Demo comparison user is missing")}const h=$e(),u=e=>e.profile?.name??e.id,x=e=>e._embedded?.stats?.usersCount??0;function re(e){const n=h.find(a=>a.id===e);if(!n)throw new Error(`Demo group ${e} is missing`);return n}const f=re(De),ee=re(se("00g",_e.awsProdAdmin)),ie=[{kind:"group",id:f.id,name:u(f),secondary:f.profile?.description},{kind:"rule",id:se("0pr",2),name:"Engineering by department",secondary:'user.department == "Engineering"'},{kind:"user",id:d.id,name:`${d.profile.firstName} ${d.profile.lastName}`,secondary:d.profile.login}],U=Date.now()-1200*1e3,v=e=>({isReading:!1,complete:!0,lastFullWalkAt:U,count:e,error:null}),z=new Set(L.flatMap(e=>e.actions?.assignUserToGroups?.groupIds??[])),q=h.filter(e=>x(e)===0&&!z.has(e.id)),X=L.filter(e=>e.status==="INACTIVE").length,B={source:v(h.length),noun:"groups"},y={source:v(L.length),noun:"group rules"},ce={source:v(oe.length),noun:"applications"},Y={source:v(K.length),noun:"app group assignments"},Ge=[N(P("rules","Group rules","bolt",y.source),"rules","group rules",[I({key:"rules-paused",label:"Group rules paused",icon:"pause",counted:y,count:X,request:{tab:"rules",view:"paused"}})]),N(P("groups","Groups","users",B.source),"groups","groups",[I({key:"groups-empty-unfilled",label:"Groups with no members that no rule fills",icon:"users",counted:B,gates:[y],count:q.length,request:{tab:"groups",view:"empty-no-rules"}})])],le=new Map(oe.map(e=>[e.id,e.label])),de=K.filter(({assignment:e})=>!z.has(e.id)).map(({appId:e,assignment:n})=>{const a=h.find(s=>s.id===n.id);return a?{id:a.id,name:u(a),detail:`${x(a)} members · ${le.get(e)??"an app"}`}:null}).filter(e=>e!==null),ue="Only apps with group push enabled are read.",te=`Okta Workflows, SCIM and HR provisioning, direct API writes, and IdP group sync can all fill a group without leaving anything here to see. ${ue}`,Le=[W({key:"group-cleanup",label:"Empty groups nothing fills",counted:B,gates:[y,Y],findings:q.map(e=>({id:e.id,name:u(e),detail:"No members · no rule fills it · no app assigned"})),caveat:`Findings, not a delete list. ${te}`}),W({key:"unmaintained-app-access",label:"App access no rule maintains",counted:B,floors:[Y,ce],gates:[y],findings:de,caveat:te})],Ue=h.map(e=>({id:e.id,name:u(e),detail:`${x(e)} members`})),_=3600*1e3,qe=[{kind:"group",id:ee.id,name:u(ee),lastSeenAt:Date.now()-3*_}],Ve=[{kind:"user",id:d.id,name:`${d.profile.firstName} ${d.profile.lastName}`,lastPane:"Groups",lastSeenAt:Date.now()-26*_},{kind:"group",id:f.id,name:u(f),lastPane:"Members",lastSeenAt:Date.now()-50*_}],We="rounded-md border border-neutral-200 bg-white",Je="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700",pe=H.createContext({hot:null,setHot:i}),C=({children:e})=>{const[n,a]=H.useState(null),s=H.useMemo(()=>({hot:n,setHot:a}),[n]);return t.jsx(pe.Provider,{value:s,children:e})};function he(e){const{hot:n,setHot:a}=H.useContext(pe);return{isHot:n===e,handlers:{onPointerEnter:()=>a(e),onPointerLeave:()=>a(s=>s===e?null:s),onFocus:()=>a(e),onBlur:s=>{s.currentTarget.contains(s.relatedTarget)||a(r=>r===e?null:r)}}}}const Ye={around:"rounded-md ring-primary-highlight ring-offset-1 ring-offset-canvas data-hot:ring-2",within:"overflow-hidden data-hot:inset-ring-2 data-hot:inset-ring-primary-highlight"},w=({n:e,ring:n="around",children:a})=>{const{isHot:s,handlers:r}=he(e);return t.jsx("div",{"data-guide-target":e,"data-hot":s||void 0,className:`${Ye[n]} transition-shadow duration-(--dur-instant) ease-(--ease-standard) [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight`,...r,children:a})},p=({n:e,children:n})=>{const{isHot:a,handlers:s}=he(e);return t.jsx("span",{"data-guide-legend":e,"data-hot":a||void 0,className:"-mx-1.5 -my-0.5 block box-decoration-clone rounded px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-hot:bg-primary-light",...s,children:n})},me=({children:e})=>t.jsxs("div",{className:"space-y-2",children:[t.jsx(be,{as:"h3",children:"Reports"}),t.jsx("div",{className:`divide-y divide-neutral-100 ${We} [&>*:first-child>*]:rounded-t-md [&>*:last-child>*]:rounded-b-md`,children:e})]}),ge=({report:e})=>t.jsx("ul",{children:t.jsx(Oe,{rowKey:e.key,figure:t.jsx(ke,{value:e.value}),label:e.label,note:e.note,children:t.jsxs("div",{className:"animate-rise-in","data-testid":`guide-report-${e.key}`,children:[t.jsx("p",{className:"text-xs text-neutral-600",children:e.caveat}),t.jsx("ul",{className:"rise-in-stagger mt-2 space-y-px",children:e.findings.map(n=>t.jsx(Ce,{choice:n,actionLabel:"Open this group",onChoose:i},n.id))}),e.value!==null&&e.value>e.findings.length&&t.jsxs("p",{className:"mt-2 text-xs text-neutral-600",children:["Showing the first ",e.findings.length.toLocaleString()," of"," ",e.value.toLocaleString(),"."]})]})})}),Qe="eng",Ke=(e,n)=>e>=2?"results":n.length>=3?"searching":"idle",ze=({beat:e})=>{const n=Se(Qe,e>=1),a={query:n,setQuery:i,mode:Ke(e,n),results:e>=2?ie:[],error:null,isIdQuery:!1,resolution:null,submit:i,clear:i};return t.jsx(V,{selector:"ul > li",live:e>=2,children:t.jsx(ne,{jump:a,onSelect:i,canReach:()=>!0,oktaOrigin:J})})},Xe=()=>{const e=O(L.length).value,n=O(h.length).value,a=O(X).value,s=O(q.length).value,r={source:v(e),noun:"group rules"},c={source:v(n),noun:"groups"},b=[N(P("rules","Group rules","bolt",r.source),"rules","group rules",[I({key:"rules-paused-show",label:"Group rules paused",icon:"pause",counted:r,count:a,request:{tab:"rules",view:"paused"}})]),N(P("groups","Groups","users",c.source),"groups","groups",[I({key:"groups-empty-unfilled-show",label:"Groups with no members that no rule fills",icon:"users",counted:c,gates:[r],count:s,request:{tab:"groups",view:"empty-no-rules"}})])];return t.jsx(ae,{boxes:b,readAt:U,isRefreshing:!1,onRefresh:i,canRefresh:!0,onOpenTab:i,onOpenListView:i})},$=24*_,we=180,Ze="App access with no membership change in 6 months",et="Measured from the last complete read of your groups, not from today. Okta Workflows, SCIM and HR provisioning, direct API writes and IdP group sync all move a group's membership date, so none of them has written to these groups either. What the date cannot show is a maintainer who reviewed the roster and changed nothing. "+ue,fe=e=>{const n=Math.floor(e/365);if(n>=1)return`${n} ${n===1?"year":"years"}`;const a=Math.max(1,Math.floor(e/30));return`${a} ${a===1?"month":"months"}`},D=new Map;for(const{appId:e,assignment:n}of K){const a=D.get(n.id)??[];a.push(le.get(e)??"an app"),D.set(n.id,a)}const ye=h.filter(e=>x(e)>0&&!z.has(e.id)&&D.has(e.id)).map(e=>({group:e,silentFor:e.lastMembershipUpdated?U-Date.parse(e.lastMembershipUpdated):Number.NaN})).filter(({silentFor:e})=>Number.isFinite(e)&&e>=we*$).sort((e,n)=>n.silentFor-e.silentFor),tt=fe((ye[0]?.silentFor??we*$)/$),xe=ye.map(({group:e,silentFor:n})=>({id:e.id,name:u(e),detail:[`${x(e)} ${x(e)===1?"member":"members"}`,(D.get(e.id)??[]).join(", "),`no membership change in ${fe(n/$)}`].join(" · ")})),nt=W({key:"dormant-app-access",label:Ze,counted:B,floors:[Y,ce],gates:[y],findings:xe,caveat:et}),at=()=>t.jsx(me,{children:t.jsx(ge,{report:nt})}),st=":scope > section > div, :scope > section > ul > li, :scope > section > p",ot={stageLabel:"Home",minHeight:528,beats:[{caption:"Home opens on one field. Type a name, or paste an id.",hold:2},{caption:"Three characters in, the org is searched. Fewer, and nothing is sent.",hold:2},{caption:`Three kinds answer at once: ${u(f)}, the rule that fills it, and ${d.profile.firstName}. Each row names the tab it opens.`,hold:3},{caption:`Under it, the snapshot you already hold counts what to fix: ${M(X,"group rule paused","group rules paused")}, ${M(q.length,"group no rule fills","groups no rule fills")}.`,hold:3},{caption:`Reports answer with names. This one counted ${M(xe.length,"app group","app groups")} whose membership has not moved in ${tt}.`}],render:e=>t.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[t.jsx(ze,{beat:e}),e>=3?t.jsx(V,{selector:st,children:t.jsx(Xe,{})}):null,e>=4?t.jsx(V,{children:t.jsx(at,{})}):null]})},Q=()=>{const[e,n]=H.useState(""),a={query:e,setQuery:n,mode:"idle",results:[],error:null,isIdQuery:!1,resolution:null,submit:i,clear:()=>n("")};return t.jsxs(Re,{id:"home",show:ot,children:[t.jsx(C,{children:t.jsx(k,{title:"Launcher",intro:"Home is where the panel opens. It reads the org snapshot the extension already holds, so the findings and reports on it cost no requests, and it keeps whatever you pinned and whatever you had open last. One field sits at the top of the tab: it searches names and emails as you type, and resolves an Okta id exactly. Rest on a number to light the sentence beside it.",legend:[{text:t.jsx(p,{n:1,children:"Type three characters and your org is searched; type fewer and nothing is sent. Paste an id instead, press Enter, and only that entity is resolved."})},{text:t.jsx(p,{n:2,children:"One search, three kinds of answer: the group, the rule that fills it, the person. Each row wears its kind on the left and names the tab it opens on the right."})}],children:t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx(g,{n:1,children:t.jsx(w,{n:1,children:t.jsx(ne,{jump:a,onSelect:i,canReach:()=>!0,oktaOrigin:J})})}),t.jsx(g,{n:2,align:"top",children:t.jsx(w,{n:2,children:t.jsx("ul",{className:"space-y-1",children:ie.map(s=>t.jsx("li",{children:t.jsx(Be,{result:s,onSelect:i,oktaOrigin:J})},s.id))})})})]})})}),t.jsx(C,{children:t.jsx(k,{title:"Org Snapshot",intro:"The card counts findings rather than totals: each row is one thing you can act on. A finding whose collection has not finished a read states no number and names the read it is missing; one walked to zero is a plain row with nothing to open.",legend:[{text:t.jsx(p,{n:1,children:"Press Group rules paused and the Rules tab opens showing only those. The totals underneath open the same tab unfiltered, the footnote dates the oldest read behind the card, and Refresh walks every collection again."})}],children:t.jsx(g,{n:1,align:"top",children:t.jsx(w,{n:1,children:t.jsx(ae,{boxes:Ge,readAt:U,isRefreshing:!1,onRefresh:i,canRefresh:!0,onOpenTab:i,onOpenListView:i})})})})}),t.jsx(C,{children:t.jsx(k,{title:"Reports",intro:"Three rows on one card. The first two answer with names rather than a number, so they open in place; the last one needs a group before it can answer at all. Press a row to open it.",legend:[{text:t.jsx(p,{n:1,children:"Empty groups nothing fills: no members, no rule assigning into it, no app pushed to it. The caveat above the names says what the join cannot see."})},{text:t.jsxs(p,{n:2,children:["App access no rule maintains:"," ",M(de.length,"pushed app group","pushed app groups")," whose members were all put there by hand. Each name opens that group."]})},{text:t.jsx(p,{n:3,children:"MFA coverage is the one report that costs requests, a factor read per member. It asks for a group first, then opens the Insights pane for that group with the scan armed and not started."})}],minHeight:320,children:t.jsxs(me,{children:[Le.map((s,r)=>t.jsx(g,{n:r+1,align:"top",children:t.jsx(w,{n:r+1,ring:"within",children:t.jsx(ge,{report:s})})},s.key)),t.jsx(g,{n:3,align:"top",children:t.jsx(w,{n:3,ring:"within",children:t.jsx("ul",{children:t.jsx(Me,{choices:Ue,status:"ok",onScan:i})})})})]})})}),t.jsx(C,{children:t.jsx(k,{title:"Working Set",intro:"The bottom of the tab is yours: what you chose to keep, and what you were just looking at.",legend:[{text:t.jsx(p,{n:1,children:"Pin a group or a user from the corner of its header and it stays here until you unpin it. Recent fills itself as you open things, newest first, and remembers the pane you left on."})}],children:t.jsx(g,{n:1,align:"top",children:t.jsx(w,{n:1,children:t.jsx(Ne,{pinned:qe,recent:Ve,onOpen:i,onUnpin:i,onForget:i})})})})}),t.jsxs(Te,{title:"What Home Should Show",children:[t.jsx("p",{className:Je,children:"Home is the least settled tab in the panel. The two findings and the three reports above are a first draft, and what belongs there is your call more than ours. Tell us what you would want to see the moment you open the panel, and what you would want it to have noticed for you."}),t.jsx(Ae,{href:He(),children:"Suggest a Home report"})]})]})};try{Q.displayName="home",Q.__docgenInfo={description:"",displayName:"home",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/home.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:o,userEvent:l,within:ve}=__STORYBOOK_MODULE_TEST__,Gt={title:"Guide/Chapters/home",component:Q,decorators:[je("home")],parameters:F,parameters:{docs:{description:{component:"The Home chapter, in the shell, rail on Home."}}}},R={},A={parameters:{...F,motion:"on"},play:async({canvasElement:e})=>{await Ee(e);const n=e.querySelector("[data-show-state]");if(await o(n).not.toBeNull(),!n)return;const a=ve(n);await o(a.getByTestId("guide-caption")).toHaveTextContent("Reports answer with names. This one counted 1 app group whose membership has not moved in 3 years."),await o(a.getByRole("textbox",{name:"Search groups, apps, users, rules"})).toHaveValue("eng"),await o(a.getByRole("status")).toHaveTextContent("3 results"),await o(a.getByRole("button",{name:/^Engineering - All .* open in Groups$/})).toBeVisible();const s=a.getByRole("button",{name:/App access with no membership change in 6 months/});await o(s).toHaveAttribute("aria-expanded","false"),await o(s).toHaveTextContent(/^1/)}},j={parameters:{...F,motion:"on"},play:async({canvasElement:e})=>{const n=G(e),a=await n.findByRole("button",{name:/Empty groups nothing fills/});await l.click(a),await o(a).toHaveAttribute("aria-expanded","true"),await o(n.getByText(/Findings, not a delete list/)).toBeInTheDocument();const s=n.getByTestId("guide-report-group-cleanup"),r=ve(s).getAllByRole("button",{name:"Open this group"}),c=Number(a.textContent?.match(/^\d+/)?.[0]);await o(r).toHaveLength(c)}},E={parameters:{...F,motion:"on"},play:async({canvasElement:e})=>{const n=G(e),a=n.getByRole("region",{name:"Reports"}),s=m=>{const Z=a.querySelector(m);if(!Z)throw new Error(`Missing ${m}`);return Z},r=m=>s(`[data-guide-target="${m}"]`),c=m=>s(`[data-guide-legend="${m}"]`);await o(r(1)).toBeInTheDocument(),await l.hover(r(1)),await o(c(1)).toHaveAttribute("data-hot","true"),await o(c(2)).not.toHaveAttribute("data-hot"),await l.unhover(r(1)),await o(c(1)).not.toHaveAttribute("data-hot"),await l.hover(c(3)),await o(r(3)).toHaveAttribute("data-hot","true"),await o(r(1)).not.toHaveAttribute("data-hot"),await l.unhover(c(3)),await o(r(3)).not.toHaveAttribute("data-hot");const b=n.getByRole("region",{name:"Launcher"}).querySelector('[data-guide-target="1"]');if(!b)throw new Error("Missing the Jump scene target");await l.hover(b),await o(c(1)).not.toHaveAttribute("data-hot"),await l.unhover(b)}},T={play:async({canvasElement:e})=>{const n=G(e);await l.click(await n.findByRole("button",{name:/MFA coverage/})),await l.type(n.getByRole("searchbox",{name:"Filter groups"}),"aws prod"),await o(n.getByRole("button",{description:"AWS Prod - ReadOnly"})).toBeVisible(),await o(n.queryByRole("button",{description:"Sales - All"})).not.toBeInTheDocument()}},S={play:async({canvasElement:e})=>{const n=G(e),a=await n.findByRole("textbox",{name:"Search groups, apps, users, rules"});await l.type(a,"amara"),await o(a).toHaveValue("amara"),await l.click(n.getByRole("button",{name:"Clear"})),await o(a).toHaveValue("")}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:"{}",...R.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...R.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const show = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    await expect(show).not.toBeNull();
    if (!show) return;
    const stage = within(show);
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent('Reports answer with names. This one counted 1 app group whose membership has not moved in 3 years.');
    await expect(stage.getByRole('textbox', {
      name: 'Search groups, apps, users, rules'
    })).toHaveValue('eng');
    await expect(stage.getByRole('status')).toHaveTextContent('3 results');
    await expect(stage.getByRole('button', {
      name: /^Engineering - All .* open in Groups$/
    })).toBeVisible();
    const report = stage.getByRole('button', {
      name: /App access with no membership change in 6 months/
    });
    await expect(report).toHaveAttribute('aria-expanded', 'false');
    await expect(report).toHaveTextContent(/^1/);
  }
}`,...A.parameters?.docs?.source},description:{story:`The show, played through: the still is the jump bar with "eng" in it and
three hits under it, the org findings, and the dormant-access report row on
the reports card stating its count and holding its names behind it, with the
last caption under the stage. The headless runner loads no motion scale, so
the still is up at once; the play is the gate for the pose.`,...A.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const row = await canvas.findByRole('button', {
      name: /Empty groups nothing fills/
    });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Findings, not a delete list/)).toBeInTheDocument();
    const panel = canvas.getByTestId('guide-report-group-cleanup');
    const names = within(panel).getAllByRole('button', {
      name: 'Open this group'
    });
    const stated = Number(row.textContent?.match(/^\\d+/)?.[0]);
    await expect(names).toHaveLength(stated);
  }
}`,...j.parameters?.docs?.source},description:{story:`A report row opens on click and names its findings, on the same card the
other reports sit on. Motion on, because the opening is the subject: the
panel rises in and the names cascade under the caveat, and the number the row
states is the number of names that arrive.`,...j.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const scene = canvas.getByRole('region', {
      name: 'Reports'
    });
    const find = (selector: string): Element => {
      const hit = scene.querySelector(selector);
      if (!hit) throw new Error(\`Missing \${selector}\`);
      return hit;
    };
    const target = (n: number) => find(\`[data-guide-target="\${n}"]\`);
    const sentence = (n: number) => find(\`[data-guide-legend="\${n}"]\`);
    await expect(target(1)).toBeInTheDocument();
    await userEvent.hover(target(1));
    await expect(sentence(1)).toHaveAttribute('data-hot', 'true');
    await expect(sentence(2)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(target(1));
    await expect(sentence(1)).not.toHaveAttribute('data-hot');
    await userEvent.hover(sentence(3));
    await expect(target(3)).toHaveAttribute('data-hot', 'true');
    await expect(target(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(sentence(3));
    await expect(target(3)).not.toHaveAttribute('data-hot');
    const elsewhere = canvas.getByRole('region', {
      name: 'Launcher'
    }).querySelector('[data-guide-target="1"]');
    if (!elsewhere) throw new Error('Missing the Jump scene target');
    await userEvent.hover(elsewhere);
    await expect(sentence(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(elsewhere);
  }
}`,...E.parameters?.docs?.source},description:{story:`The marker-to-legend tie, with motion on so the ring and tint ease in.
Resting on a framed report lights its sentence; resting on a sentence rings
its report. Leaving clears both, and one scene's tie never lights another.`,...E.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: /MFA coverage/
    }));
    await userEvent.type(canvas.getByRole('searchbox', {
      name: 'Filter groups'
    }), 'aws prod');
    await expect(canvas.getByRole('button', {
      description: 'AWS Prod - ReadOnly'
    })).toBeVisible();
    await expect(canvas.queryByRole('button', {
      description: 'Sales - All'
    })).not.toBeInTheDocument();
  }
}`,...T.parameters?.docs?.source},description:{story:"The MFA launcher opens to a chooser, and typing narrows it locally.",...T.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const field = await canvas.findByRole('textbox', {
      name: 'Search groups, apps, users, rules'
    });
    await userEvent.type(field, 'amara');
    await expect(field).toHaveValue('amara');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear'
    }));
    await expect(field).toHaveValue('');
  }
}`,...S.parameters?.docs?.source},description:{story:"The jump bar's field takes typing and clears itself; nothing is fetched.",...S.parameters?.docs?.description}}};const Lt=["Default","Show","ReportOpened","MarkerTied","MfaLauncherOpened","JumpBarTyped"];export{R as Default,S as JumpBarTyped,E as MarkerTied,T as MfaLauncherOpened,j as ReportOpened,A as Show,Lt as __namedExportsOrder,Gt as default};
