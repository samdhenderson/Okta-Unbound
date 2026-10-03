import{j as a,r as p}from"./iframe-Pee757m_.js";import{C as Ce,a as te,w as Pe,b as _e,r as Ie}from"./chapterStory-CFpIgc-I.js";import{S as _,M as x}from"./Scene-CdJM5Keo.js";import{A as Me}from"./Assemble-AGzofEAC.js";import{c as pe,d as $e}from"./concierge-u51xvn3n.js";import{C as De}from"./ConciergeGreeting-Ci6otbaj.js";import{R as Ue}from"./RecommendationCard-DJVvo1S8.js";import{V as qe}from"./verbIcons-BnCRhW9A.js";import{A as me}from"./AskCard-CBibybTo.js";import{J as he}from"./JumpBar-f4sJYw3Z.js";import{J as Ne}from"./JumpResultRow-B_-D67Tg.js";import{P as Ve}from"./PinnedCard-KpMYf2Pn.js";import{c as Fe}from"./concierge-CFpCju1p.js";import{A as Ge}from"./registry-Dm1g-4iX.js";import{m as Le}from"./copy-DPkId50G.js";import{I as Je}from"./reducer-C7bPglpv.js";import{t as ge}from"./then-JFpS9G1J.js";import{c as j}from"./costSentence-BaIgeJiz.js";import{r as Ke,e as Qe}from"./memberAnalytics-tPH-giHi.js";import{i as We}from"./groupAttributeIndex-BuDwZvlB.js";import{f as Ye}from"./ruleUtils-D89ADPfb.js";import{d as ze,D as z,g as we,c as ne,h as Xe,e as fe,j as Ze,f as ie,G as ce}from"./memberships-Cd9vTj_G.js";import{c as et,e as tt,D as nt}from"./snapshot-CcW3L-sh.js";import{s as at}from"./sceneRegistry-CY69Myqs.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-B2QnSBoC.js";import"./InstallCta-BEikTIAL.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-tucVCR_u.js";import"./useRevealOnView-S6iiQ_8T.js";import"./motion-BHuXImUL.js";import"./Dock-C2yLCSm9.js";import"./useStaggerReveal-B8AfVumu.js";/* empty css              */import"./Stage-Cjomzbog.js";import"./motion-DWPTjLhl.js";import"./GuideInvite-D_pp1wv2.js";import"./Orb-DQZsh7BJ.js";import"./VerbStrip-CFQur6FV.js";import"./Sentence-f34hhmJK.js";import"./SlotPill-eK_fGwgC.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./PinDetailCard-TDIpSHeo.js";import"./dateFormat-Db8QGh5_.js";import"./status-Bn0B6Ou-.js";import"./groupIdentity-DrhSobdh.js";import"./PinRail-Dr8sHgux.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./slots-kY_j0TaM.js";import"./SlotPicker-0ZR16Ogn.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./oktaId-BKuZMWJR.js";import"./AttributePicker-DcO3jn5g.js";import"./GrantingGroupPicker-BEsEc4BK.js";import"./HeldValuePicker-BwShd0te.js";import"./RunningLine-BJSVlGYi.js";import"./CompareAnswerView-BjeNLZd8.js";import"./AnswerHeadline-1rdFjlxA.js";import"./AccessAnswerView-BHrNNcuO.js";import"./AccessPathList-xYLLiYDM.js";import"./BuildAnswerView-BHoBH5yx.js";import"./ComposeAnswerView-CFFjt3lz.js";import"./ComposeAttributeRow-FpGF-y2V.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./FindAnswerView-BXotIyHx.js";import"./ThenChips-Bh2ZPFuf.js";import"./EarlierList-xEe-rROv.js";const o=()=>{},T=(e,t,n)=>`${e.toLocaleString()} ${e===1?t:n}`;function y(e,t){if(e==null)throw new Error(`Demo ${t} is missing`);return e}const P=et(),U=e=>{const t=y(P.get(e),`group ${e}`);return{kind:"group",id:e,name:t.profile?.name??e}},ae=e=>({kind:"user",id:e.id,name:`${e.profile.firstName} ${e.profile.lastName}`}),m=U(nt),ye=y(ne.get(fe.left),"user Amara"),h=ae(ye),st=y(ne.get(Xe),"user Priya"),u=ae(st),ot=ae(y(ne.get(fe.right),"user Tomas")),ke=e=>tt.filter(t=>t.actions?.assignUserToGroups?.groupIds.includes(e)).map(t=>Ye(t)),be=()=>p.useState(()=>new Date().getHours())[0],ve=(ze().get(m.id)??[]).map(e=>y(we(e),`user ${e}`)),rt=We(ke(m.id)),de=Ke(Qe(ve),e=>(rt.get(e)??[]).length),X={verb:"compose",group:m,completeness:"complete",memberCount:ve.length,signals:de.filter(e=>e.flagged),quiet:de.filter(e=>!e.flagged),ruleCoupling:"checked",established:[m]},le={grp:m},se=e=>(Ze().get(e.id)??[]).map(U);function xe(e){const t=new Map;for(const{id:n}of se(e)){const s=P.get(n)?.source;s&&!t.has(s.id)&&t.set(s.id,{kind:"app",id:s.id,name:s.name??s.id})}return[...t.values()]}const C=(e,t)=>{const n=new Set(t.map(s=>s.id));return e.filter(s=>!n.has(s.id))},Ae=(e,t)=>e.length-C(e,t).length,L=se(u),J=se(h),K=xe(u),Q=xe(h),M={onlyA:C(L,J),onlyB:C(J,L),shared:Ae(L,J)},$={onlyA:C(K,Q),onlyB:C(Q,K),shared:Ae(K,Q)},ue={verb:"compare",a:u,b:h,groups:M,completeness:"complete",apps:$,focus:null,established:[u,h,...M.onlyA,...M.onlyB,...$.onlyA,...$.onlyB]},Z={u1:u,u2:h},q=(e,t,n=[])=>Ge[e].cost(t,$e(n)),it=[{kind:"group-members",groupId:m.id},{kind:"group-rules"}],ct=[u,h].flatMap(e=>[{kind:"user-groups",userId:e.id},{kind:"user-apps",userId:e.id}]),Se=q("compare",Z),dt=(Se.walks??[]).reduce((e,t)=>e+t.count,0);function D(e,t={}){return{state:{...Je,...e},verbs:Le,ready:!1,cost:j({requests:0,writes:0}),chips:[],history:[],suggestions:[],attributes:{status:"loading"},retryAttributes:o,scoped:{kind:"none"},unscope:o,pickVerb:o,fill:o,clear:o,focusSlot:o,run:o,ask:o,tap:o,...t}}const lt=[{ref:h,source:"pin"},{ref:ot,source:"recent"}];function ut(e){const t={u1:"page",u2:"reader"};if(e===2)return D({verb:"compare",slots:{u1:u},provenance:{u1:"page"},activeSlot:"u2"},{suggestions:lt,cost:j(q("compare",{u1:u}))});const n={verb:"compare",slots:Z,provenance:t};return e===3?D(n,{ready:!0,cost:j(Se)}):D({...n,run:{status:"done",answer:ue},runId:1},{ready:!0,cost:j(q("compare",Z,ct)),chips:ge(ue)})}const Re=p.createContext({hot:null,setHot:o}),I=({children:e})=>{const[t,n]=p.useState(null),s=p.useMemo(()=>({hot:t,setHot:n}),[t]);return a.jsx(Re.Provider,{value:s,children:e})};function Ee(e){const{hot:t,setHot:n}=p.useContext(Re);return{isHot:t===e,handlers:{onPointerEnter:()=>n(e),onPointerLeave:()=>n(s=>s===e?null:s),onFocus:()=>n(e),onBlur:s=>{s.currentTarget.contains(s.relatedTarget)||n(c=>c===e?null:c)}}}}const A=({n:e,children:t})=>{const{isHot:n,handlers:s}=Ee(e);return a.jsx("div",{"data-guide-target":e,"data-hot":n||void 0,className:"rounded-md ring-primary-highlight ring-offset-1 ring-offset-canvas transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-hot:ring-2 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight",...s,children:t})},v=({n:e,children:t})=>{const{isHot:n,handlers:s}=Ee(e);return a.jsx("span",{"data-guide-legend":e,"data-hot":n||void 0,className:"-mx-1.5 -my-0.5 block box-decoration-clone rounded px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-hot:bg-primary-light",...s,children:t})},pt=e=>e.kind==="pin"?"pin":qe[e.ask.verb],Be=({page:e,cards:t})=>{const n=be(),s=p.useMemo(()=>pe(e,n),[e,n]);return a.jsx(De,{concierge:t?s:{...s,cards:[]},connected:!0,show:!1,onShowDone:o,invite:!1,onOpenGuide:o,onDismissInvite:o,onChoose:o})},Oe=(e,t)=>({query:e,setQuery:t,mode:"idle",results:[],error:null,isIdQuery:!1,resolution:null,submit:o,clear:()=>t("")}),W=y(ke(m.id)[0],"rule for Engineering - All"),mt=[{kind:"group",id:m.id,name:m.name,secondary:P.get(m.id)?.profile?.description},{kind:"rule",id:W.id,name:W.name,secondary:W.conditionExpression},{kind:"user",id:h.id,name:h.name,secondary:ye.profile.login}],ht={stageLabel:"Home",minHeight:900,beats:[{caption:`Home opens on the page you are on. Here, ${u.name}.`,hold:2},{caption:`Three questions about ${u.name}, each saying what you still choose.`,hold:3},{caption:`Choose Compare and it lands in Ask with ${u.name} filled in. You choose who with.`,hold:3},{caption:`${h.name} chosen, Ask states what Run will spend before you press it: ${T(dt,"walk","walks")}.`,hold:3},{caption:`${h.name} is in ${T(M.onlyB.length,"group","groups")} ${u.name} is not, and has ${T($.onlyB.length,"app","apps")} she has not.`}],render:e=>a.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[a.jsx(Be,{page:u,cards:e>=1}),a.jsx(he,{jump:Oe("",o),onSelect:o,canReach:()=>!0,oktaOrigin:z}),e>=2?a.jsx(Me,{children:a.jsx(me,{ask:ut(e),searchers:{},isActive:!0})}):null]})},gt=()=>{const e=be(),{cards:t}=p.useMemo(()=>pe(m,e),[e]);return a.jsxs("div",{className:"flex flex-col gap-4",children:[a.jsx(x,{n:1,align:"top",children:a.jsx(A,{n:1,children:a.jsx(Be,{page:m,cards:!1})})}),a.jsx(x,{n:2,align:"top",children:a.jsx(A,{n:2,children:a.jsx("ul",{"aria-label":"Suggested questions",className:"space-y-2",children:t.map(({key:n,card:s,text:c,how:g})=>a.jsx("li",{children:a.jsx(Ue,{text:c,how:g,icon:pt(s),onChoose:o})},n))})})})]})},wt=()=>{const[e,t]=p.useState("");return a.jsxs("div",{className:"flex flex-col gap-2",children:[a.jsx(x,{n:1,children:a.jsx(A,{n:1,children:a.jsx(he,{jump:Oe(e,t),onSelect:o,canReach:()=>!0,oktaOrigin:z})})}),a.jsx(x,{n:2,align:"top",children:a.jsx(A,{n:2,children:a.jsx("ul",{className:"space-y-1",children:mt.map(n=>a.jsx("li",{children:a.jsx(Ne,{result:n,onSelect:o,oktaOrigin:z})},n.id))})})})]})},ft=()=>{const[e,t]=p.useState(void 0),n=D({verb:"compose",slots:le,provenance:{grp:"page"},run:{status:"done",answer:X,tapped:e},runId:1},{ready:!0,cost:j(q("compose",le,it)),chips:ge(X,e),tap:s=>t(s??void 0)});return a.jsx(x,{n:1,align:"top",children:a.jsx(A,{n:1,children:a.jsx(me,{ask:n,searchers:{},isActive:!0})})})},Y=3600*1e3,yt=[{...U(ie("00g",ce.awsProdAdmin)),lastSeenAt:Date.now()-3*Y},{...h,lastSeenAt:Date.now()-26*Y},{...U(ie("00g",ce.security)),lastSeenAt:Date.now()-50*Y}],kt=Date.now()-60*1e3;function bt(e){if(e.kind==="group"){const t=y(P.get(e.id),`group ${e.id}`);return{kind:"group",name:e.name,type:t.type,memberCount:t._embedded?.stats?.usersCount??null,membershipChanged:t.lastMembershipUpdated??null}}if(e.kind==="user"){const t=y(we(e.id),`user ${e.id}`);return{kind:"user",name:e.name,status:t.status,department:t.profile.department??null,lastSignIn:t.lastLogin?{kind:"at",at:t.lastLogin}:{kind:"never"},textAttributes:Object.fromEntries(Object.entries(t.profile).filter(n=>typeof n[1]=="string"))}}throw new Error(`The demo pins hold no ${e.kind}`)}const f=e=>`${e.kind}:${e.id}`;function vt(){const[e,t]=p.useState(yt),[n,s]=p.useState("all"),[c,g]=p.useState(null),[d,b]=p.useState(null),oe=[...new Set(e.map(r=>r.kind))],F=n!=="all"&&!oe.includes(n)?"all":n,k=F==="all"?e:e.filter(r=>r.kind===F),w=k.find(r=>f(r)===c)??k[0]??null,He={lookup:w?{kind:"found",facts:bt(w)}:null,isLoading:!1,failed:!1,readAt:w?kt:null,refresh:o},je=w&&w.kind!=="rule"?Fe({kind:w.kind,id:w.id,name:w.name}).flatMap(r=>r.kind==="ask"?[r.ask]:[]):[];return{total:e.length,kinds:oe,filter:F,setFilter:r=>{s(r),g(null)},shown:k,selected:w,select:r=>g(f(r)),detail:He,readable:!0,asks:je,unpin:{released:d?.pin??null,unpin:r=>{const Te=e.findIndex(G=>f(G)===f(r)),re=k[k.indexOf(r)+1]??k[k.indexOf(r)-1];g(re?f(re):null),t(e.filter(G=>f(G)!==f(r))),b({pin:r,at:Te})},undo:()=>{d&&(t(r=>[...r.slice(0,d.at),d.pin,...r.slice(d.at)]),g(f(d.pin)),b(null))},dismiss:()=>b(null)}}}const xt=()=>{const e=vt();return a.jsx(x,{n:1,align:"top",children:a.jsx(A,{n:1,children:a.jsx(Ve,{pinned:e,onAsk:o,canOpen:()=>!0,onOpen:o})})})},At=P.get(m.id)?._embedded?.stats?.usersCount??0,ee=()=>a.jsxs(Ce,{id:"home",show:ht,children:[a.jsx(I,{children:a.jsx(_,{title:"Concierge",intro:"The top of Home knows where you are. Open a user, a group or an app in the Okta admin console and the panel greets you, names it, and offers three questions about it. Rest on a number to light the sentence beside it.",legend:[{text:a.jsxs(v,{n:1,children:["The line names the page you are on. For a group it adds the member count once Okta has reported it: here, ",T(At,"member","members"),"."]})},{text:a.jsx(v,{n:2,children:"Each card is a question with this page already in it. A card ready to run says what it will spend; one with a blank left says what you choose. Pin keeps the page on Home and sends nothing."})}],outro:"The first time Home opens, the greeting types itself once, and an invitation to this guide waits under it until you open the guide or dismiss it. A page no question can take, a policy or the dashboard, gets the greeting and no cards.",children:a.jsx(gt,{})})}),a.jsx(I,{children:a.jsx(_,{title:"Search",intro:"Under the greeting is one field for the whole org. It searches names and emails as you type, and resolves a pasted Okta id exactly.",legend:[{text:a.jsx(v,{n:1,children:"Type three characters and your org is searched; type fewer and nothing is sent. Paste an id instead, press Enter, and only that entity is resolved."})},{text:a.jsx(v,{n:2,children:"One search, three kinds of answer: the group, the rule that fills it, the person. Each row wears its kind on the left and names the tab it opens on the right."})}],children:a.jsx(wt,{})})}),a.jsx(I,{children:a.jsx(_,{title:"Sentence and Answer",intro:"Ask is a sentence with blanks. Pick one of five verbs (Compare, Access, Compose, Build, Find) and fill its blanks; each takes one kind of thing, and tapping it opens a picker under the sentence. Here the concierge's first card has landed and run: what is inside Engineering - All.",legend:[{text:a.jsxs(v,{n:1,children:["The page filled its own blank and nothing else. The answer reads all"," ",T(X.memberCount,"member","members")," and names what stands out, with the reason. Open an attribute and tap a value: the questions under Then carry that value, and nothing the answer did not establish."]})}],outro:"Before Run, the line under the sentence states what it will spend; while the roster and the rules are still in memory, running it again costs nothing. Run reads through the same queue as everything else in the panel, so a long walk shows in the activity bar with its own Cancel. An answer that could not read everything it needs says what it is missing instead of answering.",children:a.jsx(ft,{})})}),a.jsx(I,{children:a.jsx(_,{title:"Pins",intro:"Pin a group or a user from the corner of its header, or a group from the concierge's Pin card, and it stays on Home until you unpin it. Until you pin something, this card is not there.",legend:[{text:a.jsx(v,{n:1,children:"Pins sit on a rail; with more than one kind pinned, the filter above it narrows the rail. The selected pin is read once and described below it, with the time of the read and the questions it can start. Unpin offers Undo."})}],children:a.jsx(xt,{})})})]});try{ee.displayName="home",ee.__docgenInfo={description:"",displayName:"home",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/home.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:i,userEvent:l,within:N}=__STORYBOOK_MODULE_TEST__;function V(e,t){const n=e.querySelector(`#${at(t)}`);if(!n)throw new Error(`No scene titled ${t}`);return n}const Vn={title:"Guide/Chapters/home",component:ee,decorators:[Pe("home")],parameters:te,parameters:{docs:{description:{component:"The Home chapter, in the shell, rail on Home."}}}},S={},R={parameters:{...te,motion:"on"},play:async({canvasElement:e})=>{await _e(e);const t=e.querySelector("[data-show-state]");if(await i(t).not.toBeNull(),!t)return;const n=N(t);await i(n.getByTestId("guide-caption")).toHaveTextContent("Amara Okonkwo is in 4 groups Priya Achterberg is not, and has 3 apps she has not."),await i(n.getByRole("list",{name:"Suggested questions"})).toBeVisible();const s=n.getByRole("region",{name:"Ask"});await i(s).toHaveTextContent("Priya Achterberg is in none Amara Okonkwo isn’t; Amara Okonkwo is in 4 groups Priya Achterberg isn’t."),await i(s).toHaveTextContent("Groups only Amara Okonkwo is in")}},E={play:async({canvasElement:e})=>{const t=N(V(e,"Sentence and Answer"));await i(t.queryByRole("button",{name:/^Find users where /})).toBeNull();const[n]=t.getAllByRole("button",{name:"Values"});await l.click(n);const s=t.getByRole("group",{name:/^Ask about one .* value/});await l.click(N(s).getAllByRole("button")[0]),await i(await t.findByRole("button",{name:/^Find users where .+ = .+/})).toBeVisible()}},B={play:async({canvasElement:e})=>{const t=N(V(e,"Pins"));await l.click(t.getByRole("button",{name:"Amara Okonkwo"})),await i(t.getByRole("heading",{name:"Amara Okonkwo"})).toBeVisible(),await l.click(t.getByRole("button",{name:"Unpin"})),await i(t.getByText("Unpinned Amara Okonkwo.")).toBeVisible(),await l.click(t.getByRole("button",{name:"Undo"})),await i(t.getByRole("button",{name:"Amara Okonkwo"})).toHaveAttribute("aria-pressed","true")}},O={parameters:{...te,motion:"on"},play:async({canvasElement:e})=>{const t=V(e,"Concierge"),n=d=>{const b=t.querySelector(d);if(!b)throw new Error(`Missing ${d}`);return b},s=d=>n(`[data-guide-target="${d}"]`),c=d=>n(`[data-guide-legend="${d}"]`);await l.hover(s(2)),await i(c(2)).toHaveAttribute("data-hot","true"),await i(c(1)).not.toHaveAttribute("data-hot"),await l.unhover(s(2)),await i(c(2)).not.toHaveAttribute("data-hot"),await l.hover(c(1)),await i(s(1)).toHaveAttribute("data-hot","true"),await i(s(2)).not.toHaveAttribute("data-hot"),await l.unhover(c(1)),await i(s(1)).not.toHaveAttribute("data-hot");const g=V(e,"Search").querySelector('[data-guide-target="1"]');if(!g)throw new Error("Missing the Search scene target");await l.hover(g),await i(c(1)).not.toHaveAttribute("data-hot"),await l.unhover(g)}},H={play:async({canvasElement:e})=>{const t=Ie(e),n=await t.findByRole("textbox",{name:"Search groups, apps, users, rules"});await l.type(n,"amara"),await i(n).toHaveValue("amara"),await l.click(t.getByRole("button",{name:"Clear"})),await i(n).toHaveValue("")}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:"{}",...S.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...S.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent('Amara Okonkwo is in 4 groups Priya Achterberg is not, and has 3 apps she has not.');
    await expect(stage.getByRole('list', {
      name: 'Suggested questions'
    })).toBeVisible();
    const ask = stage.getByRole('region', {
      name: 'Ask'
    });
    await expect(ask).toHaveTextContent('Priya Achterberg is in none Amara Okonkwo isn’t; Amara Okonkwo is in 4 groups Priya Achterberg isn’t.');
    await expect(ask).toHaveTextContent('Groups only Amara Okonkwo is in');
  }
}`,...R.parameters?.docs?.source},description:{story:`The show, played through: the still is Priya's page with its three cards,
and Compare answered under them, Amara's extra groups and apps listed, with
the follow-ups. The headless runner loads no motion scale, so the still is up
at once; the play is the gate for the pose.`,...R.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const ask = within(scene(canvasElement, 'Sentence and Answer'));
    await expect(ask.queryByRole('button', {
      name: /^Find users where /
    })).toBeNull();
    const [values] = ask.getAllByRole('button', {
      name: 'Values'
    });
    await userEvent.click(values);
    const split = ask.getByRole('group', {
      name: /^Ask about one .* value/
    });
    await userEvent.click(within(split).getAllByRole('button')[0]);
    await expect(await ask.findByRole('button', {
      name: /^Find users where .+ = .+/
    })).toBeVisible();
  }
}`,...E.parameters?.docs?.source},description:{story:`Tapping a value in the answer moves the follow-ups: before, only Build is
offered; after, Find and Build both carry the tapped value.`,...E.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const pinned = within(scene(canvasElement, 'Pins'));
    await userEvent.click(pinned.getByRole('button', {
      name: 'Amara Okonkwo'
    }));
    await expect(pinned.getByRole('heading', {
      name: 'Amara Okonkwo'
    })).toBeVisible();
    await userEvent.click(pinned.getByRole('button', {
      name: 'Unpin'
    }));
    await expect(pinned.getByText('Unpinned Amara Okonkwo.')).toBeVisible();
    await userEvent.click(pinned.getByRole('button', {
      name: 'Undo'
    }));
    await expect(pinned.getByRole('button', {
      name: 'Amara Okonkwo'
    })).toHaveAttribute('aria-pressed', 'true');
  }
}`,...B.parameters?.docs?.source},description:{story:"Pins select, unpin with an Undo, and come back where they were.",...B.parameters?.docs?.description}}};O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const concierge = scene(canvasElement, 'Concierge');
    const find = (selector: string): Element => {
      const hit = concierge.querySelector(selector);
      if (!hit) throw new Error(\`Missing \${selector}\`);
      return hit;
    };
    const target = (n: number) => find(\`[data-guide-target="\${n}"]\`);
    const sentence = (n: number) => find(\`[data-guide-legend="\${n}"]\`);
    await userEvent.hover(target(2));
    await expect(sentence(2)).toHaveAttribute('data-hot', 'true');
    await expect(sentence(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(target(2));
    await expect(sentence(2)).not.toHaveAttribute('data-hot');
    await userEvent.hover(sentence(1));
    await expect(target(1)).toHaveAttribute('data-hot', 'true');
    await expect(target(2)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(sentence(1));
    await expect(target(1)).not.toHaveAttribute('data-hot');
    const elsewhere = scene(canvasElement, 'Search').querySelector('[data-guide-target="1"]');
    if (!elsewhere) throw new Error('Missing the Search scene target');
    await userEvent.hover(elsewhere);
    await expect(sentence(1)).not.toHaveAttribute('data-hot');
    await userEvent.unhover(elsewhere);
  }
}`,...O.parameters?.docs?.source},description:{story:`The marker-to-legend tie, with motion on so the ring and tint ease in.
Resting on the framed cards lights their sentence; resting on a sentence
rings its frame. Leaving clears both, and one scene's tie never lights another.`,...O.parameters?.docs?.description}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source},description:{story:"The search field takes typing and clears itself; nothing is fetched.",...H.parameters?.docs?.description}}};const Fn=["Default","Show","AnswerValueTapped","PinsHandled","MarkerTied","SearchTyped"];export{E as AnswerValueTapped,S as Default,O as MarkerTied,B as PinsHandled,H as SearchTyped,R as Show,Fn as __namedExportsOrder,Vn as default};
