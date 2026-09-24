import{j as n,r as c,u as ke,i as Ce,E as Z,B as Se,d as Ae}from"./iframe-mmN7AxbW.js";import{C as De,a as F,w as Ie,b as Oe,r as m}from"./chapterStory-BJBxwv1h.js";import{S,M as u}from"./Scene-D2nzHScN.js";import{R as Pe}from"./RuleUserReport-Dw4FGkEi.js";import{U as Ne}from"./UserProfileAttributeList-DUuub1Bu.js";import{U as je}from"./UserProfilePaneHeader-Cv6HD2hq.js";import{P as _e}from"./ProfileSaveModal-DMg0Yvvf.js";import{U as Ue}from"./UserActionBar-D4hX_F1n.js";import{b as Le}from"./profileAttributeBlocks-X1_mS098.js";import{b as X}from"./qualification-cO_gjK9U.js";import{f as ee,g as He,c as te,G as ae,e as ne,b as oe,D as se}from"./memberships-DTz2buzd.js";import{b as Me}from"./snapshot-D1CIyPrl.js";import{A as Ge}from"./Assemble-BfsBqw6B.js";import{u as qe}from"./useTyped-CRITGoQX.js";import{U as re}from"./UserSearchBar-D7NR_6ke.js";import{U as ie}from"./UserSearchResults-Bu3jwf5V.js";import{G as ce}from"./GroupMembershipRow-DJVd71bX.js";import{u as Fe}from"./userDisplay-xpx41Abi.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./InstallCta-wq3hO1J-.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./MissingGroupChip-BPaj6mVy.js";import"./ProfileEditCell-77Em6DmJ.js";import"./BlastRadiusReport-BTyOLqd6.js";import"./BlastRadiusGroupRow-B8xJYwgF.js";import"./BlastRadiusCascade-DxSEtu1V.js";import"./membershipVerdict-DUrEZuW9.js";import"./sourceLine-6HOHdWfm.js";import"./membershipAnalysis-BZfvnwXl.js";import"./ruleExpression-YtJDU2CF.js";import"./BlastRadiusRuleRow-DdW4Ud-m.js";import"./ruleUtils-Vt2BA8lQ.js";import"./UserLifecycleActions-Dz_OlyWD.js";import"./PasswordChangeFields-CrZFAhNM.js";import"./ruleAssessment-CTkD-VAM.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";import"./MembershipRuleEvidence-6HIgEdU2.js";import"./GroupMembershipsListProof-Bws-X1xf.js";import"./provenance-C1K7H2p2.js";const p=te.get(ne.left),N=(He().get(p.id)??[]).map(e=>({id:e,name:Me().get(e)?.profile?.name??e})),V=new Map(N.map(e=>[e.id,e.name])),le=e=>V.get(e),de={id:"0prFAKE00000000000003",name:"Engineering into GitHub (excludes contractors)",status:"ACTIVE",conditionExpression:'user.department == "Engineering" && user.employeeType != "CONTRACTOR"',groupIds:[ee("00g",ae.githubEngineering)]},he={id:"0prFAKE00000000000005",name:"EMEA contractors",status:"ACTIVE",conditionExpression:'user.employeeType == "CONTRACTOR" && (user.countryCode == "GB" || user.countryCode == "DE" || user.countryCode == "IE")',groupIds:[ee("00g",ae.contractorsEmea)]},ue={user:p,groupContext:N},Ve=X(de,ue,V),$e=X(he,ue,V),w=(e,t,a,s,r=!1)=>({key:a==="system"?e:`profile.${e}`,name:e,label:t,kind:a,value:s,raw:s,isEmpty:s==="",...r?{mono:!0}:{}}),$=e=>[w("login","Login","base",p.profile.login),w("id","User ID","system",p.id,!0),w("department","Department","base",e),w("title","Title","base","Staff Engineer"),w("employeeType","Employee Type","base","FULL_TIME")],j={department:["Engineering by department","Engineering into GitHub","Datadog engineers"],employeeType:["Engineering into GitHub","EMEA contractors","AMER contractors"]},P={layout:"rows",showApiNames:!1,showRuleChips:!0,showEmpty:!1,categories:[{key:"identity",name:"Identity"},{key:"organization",name:"Organization"}],assign:{login:"identity",id:"identity",department:"organization",title:"organization",employeeType:"organization"},attrOrder:["login","id","department","title","employeeType"],hidden:{}},Ke=e=>Le($(e),P,j,{filter:"",onlyRuleRead:!1}),_=$("Engineering").length,Qe=$("Engineering").filter(e=>j[e.name]?.length).length,ze={status:"not-computed",groups:[],rules:[],counts:{added:0,removed:0,notPredicted:0,starts:0,stops:0,undetermined:0},cascades:[]},h=()=>{},pe=(e,t,a)=>({login:{name:"login",editability:{editable:!1,reason:"account-mastered",explanation:"Workday owns this attribute for this user, so Okta will not accept an edit.",source:"Workday"},dirty:!1},department:{name:"department",editability:{editable:!0,control:"text",required:!1},draft:e,dirty:e!==t,onChange:a},title:{name:"title",editability:{editable:!0,control:"text",required:!1},dirty:!1,onChange:h},employeeType:{name:"employeeType",editability:{editable:!0,control:"select",required:!1,options:[{value:"FULL_TIME",label:"Full time"},{value:"CONTRACTOR",label:"Contractor"},{value:"INTERN",label:"Intern"}]},dirty:!1,onChange:h},id:{name:"id",editability:{editable:!1,reason:"system",explanation:"This is a system field, not a profile attribute, so it cannot be edited here."},dirty:!1}}),We=Object.values(pe("Engineering","Engineering",h)).filter(e=>e.editability.editable).length,Ye=j.department?.length??0,me="rounded-md border border-neutral-200 bg-white",Je=`${me} overflow-hidden`,Ze="flex flex-col gap-(--sp-rung)",Xe="rounded-md outline outline-2 outline-offset-2 outline-transparent transition-[outline-color] duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:outline-primary/40 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot=true]+span]:ring-4 [&[data-hot=true]+span]:ring-primary/25",et="-mx-2 -my-1 block rounded-md px-2 py-1 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-[hot=true]:bg-primary-light/60";function K(){const[e,t]=c.useState(null);return c.useCallback(s=>({"data-hot":e===s?"true":"false",onPointerEnter:()=>t(s),onPointerLeave:()=>t(r=>r===s?null:r),onFocusCapture:()=>t(s),onBlurCapture:()=>t(r=>r===s?null:r)}),[e])}const A=({n:e,bind:t,children:a})=>n.jsx("div",{...t(e),className:Xe,children:a}),D=({n:e,bind:t,children:a})=>n.jsx("span",{...t(e),className:et,children:a}),tt=e=>e===1?"1 field":`${e} fields`,at=({department:e,cells:t})=>n.jsx("div",{children:Ke(e).map(a=>n.jsxs("section",{"aria-label":a.name,className:"border-t border-neutral-200 p-(--sp-card) first:border-t-0",children:[n.jsxs("div",{className:"mb-2 flex items-baseline justify-between gap-2",children:[n.jsx(Z,{children:a.name}),n.jsx(Se,{variant:"neutral",children:tt(a.attributes.length)})]}),n.jsx(Ne,{attributes:a.attributes,layout:P.layout,showApiNames:P.showApiNames,showRuleChips:P.showRuleChips,ruleReads:j,cells:t})]},a.key))}),nt=({rule:e,verdict:t,user:a,titled:s=!1,actions:r,open:l=!0})=>{const I=c.useId(),g=`Against rule: ${e.name}`;return n.jsxs("section",{className:`${me} px-4 py-3`,"aria-labelledby":s?I:void 0,"aria-label":s?void 0:g,children:[n.jsxs("div",{className:"flex items-start justify-between gap-3",children:[s?n.jsx("h4",{id:I,className:"min-w-0 text-xs font-semibold uppercase tracking-wide text-neutral-600",style:{fontFamily:"var(--font-heading)"},children:g}):n.jsx(Z,{className:"min-w-0",children:g}),r?n.jsx("div",{className:"shrink-0",children:r}):null]}),n.jsx("div",{className:"disclose mt-3","data-open":l?"true":"false",children:n.jsx("div",{inert:!l||void 0,children:n.jsx(Pe,{verdict:t,user:a,groupContext:N,resolveGroupName:le})})})]})},J=({rule:e,verdict:t})=>{const[a,s]=c.useState(!0);return n.jsx(nt,{rule:e,verdict:t,user:p,titled:!0,open:a,actions:n.jsx(Ce,{variant:"ghost",size:"sm",onClick:()=>s(r=>!r),children:a?"Clear":"Check again"})})},U=()=>{const e=K();return n.jsx(S,{title:"Check Rules",intro:"The Users tab also looks forward: would a rule pick this person up, and what happens to their access if you change their profile. Pick Check rule from the strip and choose a rule. The answer opens above her groups, with the evidence under it, because a group she is not in does not belong in the list of groups she is in. On the rung, Clear puts the answer away and you press Check rule to ask again. Here the same button does both, so you can try it without losing the frame.",legend:[{text:n.jsx(D,{n:1,bind:e,children:"Qualifies: every clause holds against her profile and the rule is active. Under the verdict, each group the rule fills carries Member or Not a member, and she already holds this one."})},{text:n.jsx(D,{n:2,bind:e,children:"Does not match: the ledger marks the clause that failed. Her employee type is FULL_TIME and this rule wants CONTRACTOR, so the three country clauses beside it never get a say."})}],outro:"Check membership asks the same question the other way round: pick a group, and the panel runs every rule that feeds it. If she is already in the group, or the group is owned by an app, it says that first.",children:n.jsxs("div",{className:Ze,children:[n.jsx(u,{n:1,align:"top",children:n.jsx(A,{n:1,bind:e,children:n.jsx(J,{rule:de,verdict:Ve})})}),n.jsx(u,{n:2,align:"top",children:n.jsx(A,{n:2,bind:e,children:n.jsx(J,{rule:he,verdict:$e})})})]})})},L=()=>{const[e,t]=c.useState("Engineering"),[a,s]=c.useState("Engineering"),[r,l]=c.useState(!1),[I,g]=c.useState(!1),[W,be]=c.useState(0),xe=ke(),O=K(),Te=c.useMemo(()=>pe(a,e,s),[a,e]),Y=a===e?[]:[{name:"department",label:"Department",beforeDisplay:e,afterDisplay:a,afterRaw:a,changesSignIn:!1}],Be=()=>{t(a),g(!1),l(!1),xe||be(Re=>Re+1)},Ee={canEdit:!0,isEditing:r,changeCount:Y.length,hasInvalid:!1,onBeginEdit:()=>l(!0),onCancelEdit:()=>{s(e),l(!1)},onSave:()=>g(!0)};return n.jsxs(S,{title:"Profile Edits",stageLabel:"Users, profile",intro:`Open the Profile pane and press Edit. ${We} of the ${_} rows become fields, and the strip along the top starts counting the ones you moved. Type Sales over Engineering, then press Save.`,legend:[{text:n.jsx(D,{n:1,bind:O,children:"The strip counts what is on screen and how much of it rules read. In edit mode it swaps Edit for the change count, Cancel and Save, and Save stays off until a value differs from the one Okta holds."})},{text:n.jsxs(D,{n:2,bind:O,children:["Department carries a chip saying ",Ye," rules read it, so this edit can move her group access. Login never becomes a field: Workday masters it for her, and the row names the owner rather than greying out in silence."]})}],outro:"Save writes nothing on its own. The confirm quotes both values, calls the write live against Okta, and offers Analyze blast radius, which names the groups she would gain and lose before you decide. Confirming here settles the row and flashes the card; your org is untouched.",minHeight:560,children:[n.jsxs("div",{className:`relative ${Je}`,children:[W>0?n.jsx("span",{"aria-hidden":"true","data-testid":"guide-save-flash",className:"pointer-events-none absolute inset-0 animate-affirm-flash rounded-md border"},W):null,n.jsx(u,{n:1,align:"top",children:n.jsx(A,{n:1,bind:O,children:n.jsx(je,{shown:_,total:_,ruleReadCount:Qe,edit:Ee})})}),n.jsx(u,{n:2,align:"top",children:n.jsx(A,{n:2,bind:O,children:n.jsx(at,{department:e,cells:r?Te:void 0})})})]}),n.jsx(_e,{changes:I?Y:null,userName:`${p.profile.firstName} ${p.profile.lastName}`,onCancel:()=>g(!1),onConfirm:Be,isSaving:!1,report:ze,onAnalyze:h,isAnalyzing:!1,resolveGroupName:le,groupContext:N})]})},H=()=>{const[e,t]=c.useState(!0),[a,s]=c.useState(null),r=K();return n.jsx(S,{title:"Password Reset",stageLabel:"Users, More",intro:"The verbs that change the account itself sit behind More on the strip, apart from the everyday ones. Press Reset password and the confirm asks what should happen before it asks for a value.",legend:[{text:n.jsx(D,{n:1,bind:r,children:"More opens one tier inside the strip, and the account verbs sit under Account state: Reset password, then Suspend user alone on its row with what it costs, Blocks sign-in until reversed, beside the button. The band says once that each one asks to confirm."})}],outro:"The reset confirm offers four operations, each with its consequence in one sentence: a reset link, a lasting password, a one-time password, or a value Okta generates. Pick one and the sentence changes with it, and so does the button you press. A generated value is shown to you once. Okta does not announce a password change to the person, so tell them yourself.",minHeight:460,children:n.jsx(u,{n:1,align:"top",children:n.jsx(A,{n:1,bind:r,children:n.jsx(Ue,{user:p,onCompare:h,onAddToGroup:h,onCheckRule:h,onWhyNotMember:h,isLoadingMemberships:!1,tierOpen:e,onTierOpenChange:t,isLifecycleLoading:!1,pendingLifecycleAction:a,onRequestLifecycleAction:s,onCancelLifecycleAction:()=>s(null),onConfirmLifecycleAction:()=>s(null),sticky:!1})})})})};try{U.displayName="CheckRulesScene",U.__docgenInfo={description:`Would a rule pick this person up? The rung's own Check rule answer, twice:
once where every clause holds, once where the first one does not.`,displayName:"CheckRulesScene",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/parts/userProfile.tsx",methods:[],props:{},tags:{}}}catch{}try{L.displayName="ProfileEditsScene",L.__docgenInfo={description:"The Profile pane, edited and saved. The one scene in this chapter that keeps\nits frame: the save confirm is a `Modal`, and a modal needs a box to open\ninside (`Stage`).",displayName:"ProfileEditsScene",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/parts/userProfile.tsx",methods:[],props:{},tags:{}}}catch{}try{H.displayName="PasswordResetScene",H.__docgenInfo={description:"The account verbs behind More. Framed: each of them opens a confirm, and a\nconfirm is a `Modal`.",displayName:"PasswordResetScene",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/parts/userProfile.tsx",methods:[],props:{},tags:{}}}catch{}const ge=te.get(ne.left),Q="Ama",ot=4,st=e=>`${Fe(e)} ${e.profile.email??""}`.toLowerCase();function ye(e){const t=e.trim().toLowerCase();if(t.length===0)return{rows:[],total:0};const a=oe.filter(s=>st(s).includes(t));return{rows:a.slice(0,ot),total:a.length}}const z=ye(Q),M=(e,t,a)=>({id:e,name:t,status:"ACTIVE",conditionExpression:a}),rt={group:{id:"00gFAKE00000000000101",type:"OKTA_GROUP",profile:{name:"Engineering Staff",description:"Everyone in Engineering"}},membershipType:"RULE_BASED",attribution:"exact",rules:[M("0prFAKE00000000000101","Engineers",'user.department == "Engineering"')]},it={group:{id:"00gFAKE00000000000102",type:"OKTA_GROUP",profile:{name:"Incident Commanders"}},membershipType:"DIRECT",attribution:"exact",rules:[]},we={group:{id:"00gFAKE00000000000103",type:"OKTA_GROUP",profile:{name:"VPN Access"}},membershipType:"RULE_BASED",attribution:"ambiguous",rules:[M("0prFAKE00000000000102","Engineers get VPN",'user.department == "Engineering"'),M("0prFAKE00000000000103","Seattle gets VPN",'user.city == "Seattle"')]},ct={group:{id:"00gFAKE00000000000104",type:"APP_GROUP",profile:{name:"GitHub Enterprise"}},membershipType:"RULE_BASED",attribution:"exact",rules:[]},fe=[rt,it,we,ct],y=()=>{},G=z.rows.map(e=>({...e,id:`show-${e.id}`})),lt=({beat:e})=>{const t=qe(Q,e>=1);return n.jsxs("div",{className:"space-y-(--sp-rung)",children:[n.jsx(re,{searchQuery:t,onSearchChange:y,onClear:y,isSearching:!1,showClearButton:t.length>0}),e>=2?n.jsx(ie,{results:G,truncated:z.total>G.length,onSelectUser:y}):null]})},dt=({beat:e})=>n.jsx(Ge,{className:"space-y-(--sp-rung)",children:fe.map(t=>n.jsx(ce,{membership:t,user:ge,isCurrentGroup:!1,expanded:e>=4&&t.group.id===we.group.id,onToggle:y,oktaOrigin:se,proofEnabled:!1,onProve:y},t.group.id))}),ht={stageLabel:"Users",minHeight:640,beats:[{caption:"Start with the person. The field takes a name, a login or an email.",hold:2},{caption:"Three letters are enough.",hold:2},{caption:`${z.total} people matched. The line says these ${G.length} are one page, not the total.`,hold:3},{caption:"Open her, and every group she is in says what put her there.",hold:3},{caption:"Two rules could have put her in VPN Access. The panel names both rather than picking one."}],render:e=>e>=3?n.jsx(dt,{beat:e}):n.jsx(lt,{beat:e})},ut=()=>{const[e,t]=c.useState(Q),a=c.useMemo(()=>ye(e),[e]);return n.jsxs("div",{className:"space-y-(--sp-rung)",children:[n.jsx(u,{n:1,children:n.jsx(re,{searchQuery:e,onSearchChange:t,onClear:()=>t(""),isSearching:!1,showClearButton:e.length>0})}),a.rows.length>0?n.jsx(u,{n:2,align:"top",children:n.jsx(ie,{results:a.rows,truncated:a.total>a.rows.length,onSelectUser:y})}):e.trim().length===0?n.jsx(Ae,{icon:"user",title:"User Membership Tracing",description:"Search for users to analyze their group memberships and understand why they're in specific groups"}):null]})},pt=()=>{const[e,t]=c.useState(null),a=s=>t(r=>r===s?null:s);return n.jsx("div",{className:"space-y-(--sp-rung)",children:fe.map((s,r)=>n.jsx(u,{n:r+1,align:"top",children:n.jsx(ce,{membership:s,user:ge,isCurrentGroup:!1,expanded:e===s.group.id,onToggle:a,oktaOrigin:se,proofEnabled:!1,onProve:y})},s.group.id))})},q=()=>n.jsxs(De,{id:"users",show:ht,children:[n.jsx(S,{title:"Search",intro:`Most questions about access start with a person. The Users tab takes you from a name to every group they are in, and for each one, what put them there. Type any part of a name, a login or an email: the field below searches a demo org of ${oe.length} people.`,legend:[{text:"The field. The list narrows on every keystroke, and the clear button empties it and puts the starting screen back."},{text:"One page of matches. The line above the rows counts what is on screen and says when Okta held the rest back, so a page is never passed off as a total. Each row carries the account status, so a deprovisioned person never reads as an active one."}],minHeight:320,children:n.jsx(ut,{})}),n.jsx(S,{title:"Memberships",intro:"Open a person and the Groups pane lists every membership with one badge and one source line. Click a row to open its evidence.",legend:[{text:"Rule on Engineering Staff: one rule names her, and every clause of its condition holds against her profile today."},{text:"Direct on Incident Commanders: someone added her by hand, and no rule targets this group."},{text:"Rule · 2 on VPN Access: two rules could have done it and nothing on file separates them, so the panel lists both rather than picking one. Open the row to read the pair."},{text:"App on GitHub Enterprise: the application owns this roster and Okta mirrors it, so there is no rule to name."}],outro:"An open row gives you the rule's condition checked clause by clause against the person, any apps the group also grants, and a link to the group in Okta. Where two rules tie, the row offers to ask Okta directly: one request, and the deduction is replaced by Okta's own answer.",minHeight:280,children:n.jsx(pt,{})}),n.jsx(U,{}),n.jsx(L,{}),n.jsx(H,{})]});try{q.displayName="users",q.__docgenInfo={description:"",displayName:"users",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/users.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:o,userEvent:i,waitFor:mt,within:d}=__STORYBOOK_MODULE_TEST__,da={title:"Guide/Chapters/users",component:q,decorators:[Ie("users")],parameters:F,parameters:{docs:{description:{component:"The Users chapter, in the shell, rail on Users."}}}},f={},v={parameters:{...F,motion:"on"},play:async({canvasElement:e})=>{await Oe(e);const t=e.querySelector("[data-show-state]");if(await o(t).not.toBeNull(),!t)return;const a=d(t);await o(a.getByTestId("guide-caption")).toHaveTextContent("Two rules could have put her in VPN Access. The panel names both rather than picking one."),await o(a.queryByRole("textbox")).not.toBeInTheDocument();const s=a.getByRole("button",{name:/VPN Access/});await o(s).toHaveAttribute("aria-expanded","true"),await o(a.getByRole("button",{name:/Engineering Staff/})).toHaveAttribute("aria-expanded","false"),await o(a.getByText("Engineers get VPN")).toBeInTheDocument(),await o(a.getByText("Seattle gets VPN")).toBeInTheDocument()}},b={play:async({canvasElement:e})=>{const t=m(e),a=await t.findByRole("textbox");await o(t.getByText("Amara Okonkwo")).toBeInTheDocument(),await o(t.getByText("Viktor Yamamoto")).toBeInTheDocument(),await i.clear(a),await i.type(a,"okonkwo"),await o(t.queryByText("Viktor Yamamoto")).not.toBeInTheDocument(),await o(t.getByText("Jolene Okonkwo")).toBeInTheDocument()}},x={play:async({canvasElement:e})=>{const t=m(e);await i.click(t.getByRole("button",{name:"Clear search"})),await o(t.queryByText("Amara Okonkwo")).not.toBeInTheDocument(),await o(t.getByText("User Membership Tracing")).toBeInTheDocument()}},T={play:async({canvasElement:e})=>{const a=await m(e).findByRole("button",{name:/VPN Access/});await i.click(a),await o(a).toHaveAttribute("aria-expanded","true")}};async function ve(e){await i.click(e.getByRole("button",{name:"Edit"}));const t=e.getByLabelText("Department");await i.clear(t),await i.type(t,"Sales")}const B={play:async({canvasElement:e})=>{const t=m(e);await o(t.getByText("Qualifies")).toBeInTheDocument(),await o(t.getByText("Does not match")).toBeInTheDocument(),await o(t.getByRole("heading",{level:3,name:"Check Rules"})).toBeInTheDocument(),await o(t.getAllByRole("heading",{level:4,name:/^Against rule:/})).toHaveLength(2),await o(t.getByText("5 of 5 attributes shown",{exact:!1})).toBeInTheDocument(),await o(t.getByRole("button",{name:"Edit"})).toBeInTheDocument(),await o(t.getByRole("button",{name:"Reset password"})).toBeInTheDocument(),await o(t.getByRole("button",{name:"Suspend user"})).toBeInTheDocument()}},E={play:async({canvasElement:e})=>{const t=m(e);await ve(t),await i.click(t.getByRole("button",{name:"Save"}));const a=await t.findByRole("dialog",{name:"Save profile changes?"});await o(a).toBeInTheDocument(),await o(d(a).getByText(/1 attribute on Amara Okonkwo will be overwritten/)).toBeInTheDocument(),await o(d(a).getByText("Sales")).toBeInTheDocument(),await o(d(a).getByRole("button",{name:"Analyze blast radius"})).toBeInTheDocument()}},R={play:async({canvasElement:e})=>{const t=m(e);await i.click(t.getByRole("button",{name:"Reset password"}));const a=await t.findByRole("dialog",{name:"Reset Password"});await i.selectOptions(d(a).getByRole("combobox",{name:"What should happen"}),"set-and-expire"),await o(d(a).getByLabelText("New password")).toBeInTheDocument(),await o(d(a).getByText(/makes them replace it at next sign-in/)).toBeInTheDocument(),await o(d(a).getByRole("button",{name:"Set One-Time Password"})).toBeInTheDocument()}},k={parameters:{...F,motion:"on"},play:async({canvasElement:e})=>{const t=m(e),a=t.getByText(/every clause holds against her profile/).closest("span");await i.hover(a);const s=t.getByText("Qualifies").closest("[data-hot]");await o(s).toHaveAttribute("data-hot","true"),await i.unhover(a),await o(s).toHaveAttribute("data-hot","false"),await i.hover(s),await o(a).toHaveAttribute("data-hot","true"),await i.unhover(s);const[r]=t.getAllByRole("button",{name:"Clear"});await i.click(r),await o(t.getByRole("button",{name:"Check again"})).toBeInTheDocument(),await o(t.getByText("Qualifies").closest(".disclose")).toHaveAttribute("data-open","false"),await i.click(t.getByRole("button",{name:"Check again"})),await o(t.getByText("Qualifies").closest(".disclose")).toHaveAttribute("data-open","true"),await i.click(t.getByRole("button",{name:"Edit"})),await o(t.getByText("No changes yet")).toBeInTheDocument(),await o(t.getByRole("button",{name:"Save"})).toBeDisabled();const l=t.getByLabelText("Department");await i.clear(l),await i.type(l,"Sales"),await o(t.getByText("1 change")).toBeInTheDocument(),await o(t.getByRole("button",{name:"Save"})).toBeEnabled(),await i.click(t.getByRole("button",{name:"Cancel"})),await o(t.getByRole("button",{name:"Edit"})).toBeInTheDocument(),await o(t.queryByText("1 change")).not.toBeInTheDocument()}},C={play:async({canvasElement:e})=>{const t=m(e);await ve(t),await i.click(t.getByRole("button",{name:"Save"}));const a=await t.findByRole("dialog",{name:"Save profile changes?"});await i.click(d(a).getByRole("button",{name:"Save changes"})),await mt(()=>o(t.queryByRole("dialog")).not.toBeInTheDocument()),await o(t.getByRole("button",{name:"Edit"})).toBeInTheDocument(),await o(t.getByText("Sales")).toBeInTheDocument(),await o(t.getByTestId("guide-save-flash")).toBeInTheDocument()}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:"{}",...f.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...f.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent('Two rules could have put her in VPN Access. The panel names both rather than picking one.');
    // The search is gone: she has been opened.
    await expect(stage.queryByRole('textbox')).not.toBeInTheDocument();
    // Four rows, and only the VPN row is open, on both of its rules.
    const vpn = stage.getByRole('button', {
      name: /VPN Access/
    });
    await expect(vpn).toHaveAttribute('aria-expanded', 'true');
    await expect(stage.getByRole('button', {
      name: /Engineering Staff/
    })).toHaveAttribute('aria-expanded', 'false');
    await expect(stage.getByText('Engineers get VPN')).toBeInTheDocument();
    await expect(stage.getByText('Seattle gets VPN')).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:`The show, played through: the still is the Groups pane with the VPN row
open on its two candidate rules, and the last caption under the stage. The
headless runner loads no motion scale, so the still is up at once; the play
is the gate for the pose.`,...v.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const field = await canvas.findByRole('textbox');
    // Opens on "Ama", which matches every Yamamoto in the demo org too.
    await expect(canvas.getByText('Amara Okonkwo')).toBeInTheDocument();
    await expect(canvas.getByText('Viktor Yamamoto')).toBeInTheDocument();
    await userEvent.clear(field);
    await userEvent.type(field, 'okonkwo');

    // The Yamamotos are gone and a name only this query reaches is on screen.
    await expect(canvas.queryByText('Viktor Yamamoto')).not.toBeInTheDocument();
    await expect(canvas.getByText('Jolene Okonkwo')).toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source},description:{story:`The search frame is live: typing narrows the page of matches, and the count
line above them answers for the rows on screen.`,...b.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear search'
    }));
    await expect(canvas.queryByText('Amara Okonkwo')).not.toBeInTheDocument();
    await expect(canvas.getByText('User Membership Tracing')).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source},description:{story:"Clearing the field puts the panel's pre-search screen back.",...x.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const row = await canvas.findByRole('button', {
      name: /VPN Access/
    });
    await userEvent.click(row);
    await expect(row).toHaveAttribute('aria-expanded', 'true');
  }
}`,...T.parameters?.docs?.source},description:{story:"A membership row opens on click and shows its evidence; the frame holds it.",...T.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await expect(canvas.getByText('Qualifies')).toBeInTheDocument();
    await expect(canvas.getByText('Does not match')).toBeInTheDocument();
    await expect(canvas.getByRole('heading', {
      level: 3,
      name: 'Check Rules'
    })).toBeInTheDocument();
    await expect(canvas.getAllByRole('heading', {
      level: 4,
      name: /^Against rule:/
    })).toHaveLength(2);
    // The pane opens read-only, the way the rung opens it, and its strip states
    // what is on screen before any verb is pressed.
    await expect(canvas.getByText('5 of 5 attributes shown', {
      exact: false
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Edit'
    })).toBeInTheDocument();
    // The account verbs are behind More, in the strip's open tier.
    await expect(canvas.getByRole('button', {
      name: 'Reset password'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Suspend user'
    })).toBeInTheDocument();
  }
}`,...B.parameters?.docs?.source},description:{story:`The three scenes that were the "Does this user qualify?" chapter, now on
this page: one match, one non-match, the profile at rest, the account verbs
behind More. Each checked rule is titled one rank under its scene, so the
outline reads chapter, scene, rule and never jumps back up inside a frame.`,...B.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await draftSales(canvas);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Save'
    }));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Save profile changes?'
    });
    await expect(dialog).toBeInTheDocument();
    await expect(within(dialog).getByText(/1 attribute on Amara Okonkwo will be overwritten/)).toBeInTheDocument();
    await expect(within(dialog).getByText('Sales')).toBeInTheDocument();
    await expect(within(dialog).getByRole('button', {
      name: 'Analyze blast radius'
    })).toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source},description:{story:"Save opens the confirm inside the frame, restating the change with both sides.",...E.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Reset password'
    }));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Reset Password'
    });
    await userEvent.selectOptions(within(dialog).getByRole('combobox', {
      name: 'What should happen'
    }), 'set-and-expire');
    await expect(within(dialog).getByLabelText('New password')).toBeInTheDocument();
    await expect(within(dialog).getByText(/makes them replace it at next sign-in/)).toBeInTheDocument();
    // The button names what pressing it will do, per mode.
    await expect(within(dialog).getByRole('button', {
      name: 'Set One-Time Password'
    })).toBeInTheDocument();
  }
}`,...R.parameters?.docs?.source},description:{story:"Reset password opens the confirm; a mode that takes a value reveals the field.",...R.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);

    // Legend to frame: hover the first sentence, the first card goes hot.
    const firstRow = canvas.getByText(/every clause holds against her profile/).closest('span')!;
    await userEvent.hover(firstRow);
    const firstCard = canvas.getByText('Qualifies').closest('[data-hot]')!;
    await expect(firstCard).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(firstRow);
    await expect(firstCard).toHaveAttribute('data-hot', 'false');

    // Frame to legend: hover the card, the sentence goes hot.
    await userEvent.hover(firstCard);
    await expect(firstRow).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(firstCard);

    // Clear folds the report and swaps the verb; Check again restores it.
    const [clear] = canvas.getAllByRole('button', {
      name: 'Clear'
    });
    await userEvent.click(clear);
    await expect(canvas.getByRole('button', {
      name: 'Check again'
    })).toBeInTheDocument();
    await expect(canvas.getByText('Qualifies').closest('.disclose')).toHaveAttribute('data-open', 'false');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Check again'
    }));
    await expect(canvas.getByText('Qualifies').closest('.disclose')).toHaveAttribute('data-open', 'true');

    // The pane's change count follows the draft: Save is off until one differs.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Edit'
    }));
    await expect(canvas.getByText('No changes yet')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Save'
    })).toBeDisabled();
    const field = canvas.getByLabelText('Department');
    await userEvent.clear(field);
    await userEvent.type(field, 'Sales');
    await expect(canvas.getByText('1 change')).toBeInTheDocument();
    await expect(canvas.getByRole('button', {
      name: 'Save'
    })).toBeEnabled();

    // Cancel drops the draft and leaves edit mode, as it does on the rung.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Cancel'
    }));
    await expect(canvas.getByRole('button', {
      name: 'Edit'
    })).toBeInTheDocument();
    await expect(canvas.queryByText('1 change')).not.toBeInTheDocument();
  }
}`,...k.parameters?.docs?.source},description:{story:`The response layer, with motion on: hovering a legend row lights the element
it describes, Clear folds a report away and Check again brings it back, and
the pane's own change count follows the draft. Under motion off, the same
states land in one frame.`,...k.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await draftSales(canvas);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Save'
    }));
    const dialog = await canvas.findByRole('dialog', {
      name: 'Save profile changes?'
    });
    await userEvent.click(within(dialog).getByRole('button', {
      name: 'Save changes'
    }));
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    // Out of edit mode, with the new value on the row and nothing left to save.
    await expect(canvas.getByRole('button', {
      name: 'Edit'
    })).toBeInTheDocument();
    await expect(canvas.getByText('Sales')).toBeInTheDocument();
    await expect(canvas.getByTestId('guide-save-flash')).toBeInTheDocument();
  }
}`,...C.parameters?.docs?.source},description:{story:"Confirming the save writes nothing, settles the row on the draft, and flashes the card once.",...C.parameters?.docs?.description}}};const ha=["Default","Show","SearchNarrowed","SearchCleared","RowOpened","ForwardScenes","SaveConfirmOpened","PasswordModePicked","LinkedHover","SaveConfirmed"];export{f as Default,B as ForwardScenes,k as LinkedHover,R as PasswordModePicked,T as RowOpened,E as SaveConfirmOpened,C as SaveConfirmed,x as SearchCleared,b as SearchNarrowed,v as Show,ha as __namedExportsOrder,da as default};
