import{r as f,j as t,i as F,x as ie,u as le}from"./iframe-mmN7AxbW.js";import{C as ce,a as Y,w as de,b as pe,r as x}from"./chapterStory-BJBxwv1h.js";import{S as A,M as d}from"./Scene-D2nzHScN.js";import{A as q}from"./Assemble-BfsBqw6B.js";import{m as he,r as ue}from"./motion-BaDhWFVg.js";import{u as me}from"./useTyped-CRITGoQX.js";import{E as N}from"./EntityPicker-CxWL5lqm.js";import{E as we}from"./ExportContextBar-cyHPd9H_.js";import{E as z}from"./ExportFilterBox-BDxWBYO-.js";import{C as J}from"./ColumnPicker-Bhr9Sw4l.js";import{E as X}from"./ExportPreviewTable-DkKRuxA5.js";import{G as ge}from"./GroupExportModal-CRQiWLi0.js";import{t as ye}from"./groupSummary-DeRt4Uax.js";import{u as r,g as D}from"./groupMemberships-B1v4SxhR.js";import{b as Z,D as ee}from"./memberships-DTz2buzd.js";import{c as V,D as fe}from"./snapshot-D1CIyPrl.js";import{u as ve}from"./useCountUp-DBR4-HMR.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./InstallCta-wq3hO1J-.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./csvUtils-DgNWYp8m.js";import"./types-D54cNL3h.js";const H=r.filter.kind==="none"?null:r.filter,$=D.context.kind==="search-to-select"?D.context:null,xe='status eq "ACTIVE" and profile.department eq "Legal"',L=Z.filter(e=>e.status==="ACTIVE"&&e.profile.department==="Legal"),M={count:L.length,hasMore:L.length>Number(r.defaultQuery.limit)},te=V().map(e=>({id:e.id,label:e.profile?.name??e.id,sublabel:e.type})),be=te.find(e=>e.id===fe)??null,Ee=e=>{const a=e.trim().toLowerCase();return Promise.resolve(a?te.filter(o=>o.label.toLowerCase().includes(a)):[])},P=V().filter(e=>e.type==="OKTA_GROUP").slice(0,3).map(ye),K=V().length,ae=new Set(r.columnCatalog.filter(e=>e.defaultEnabled).map(e=>e.id)),c=()=>{},W='profile.department eq "Legal"',_=Z.filter(e=>e.profile.department==="Legal"),Q=["department","title"],Be='[role="button"]';function ke(e){const a=le(),o=e>=2,n=!a&&he(),[u,m]=f.useState(!1);f.useEffect(()=>{if(!o||!n)return;const g=window.setTimeout(()=>m(!0),ue("--dur-tell"));return()=>window.clearTimeout(g)},[o,n]);const l=new Set(ae);return o&&(l.add(Q[0]),(u||!n)&&l.add(Q[1])),l}const Re=({beat:e})=>{const a=me(W,e>=1),o=a.length===W.length,n=ve(o?_.length:0).value,u=ke(e),m=r.columnCatalog.filter(l=>u.has(l.id));return e===0?t.jsx(q,{selector:Be,children:t.jsx(N,{descriptors:[r,D],onSelect:c})}):t.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[t.jsxs(q,{className:"flex flex-col gap-(--sp-rung)",children:[t.jsx(z,{value:a,onChange:c,help:H?.help??"",placeholder:H?.placeholder??"",matchCount:n>0?{count:n,hasMore:!1}:null,matchCountLoading:n===0}),t.jsx(J,{catalog:r.columnCatalog,enabled:u,onToggle:c})]}),e>=3?t.jsx("div",{className:"animate-rise-in",children:t.jsx(X,{columns:m,rows:_,fetched:_.length,dropped:0,capped:!1,linkify:r.linkify,oktaOrigin:ee})}):null]})},Ce={stageLabel:"Export",minHeight:840,beats:[{caption:"The tab opens on every export it offers. A card says what one row holds.",hold:2},{caption:"Narrow Users with an Okta search expression. The first page is counted as you type.",hold:10},{caption:"Tick Department and Title on. The figure beside Columns follows every chip.",hold:3},{caption:"Preview lays out the first rows in the columns you left on."}],render:e=>t.jsx(Re,{beat:e})};function O(){const[e,a]=f.useState(null);return{hot:e,setHot:a}}const p=({n:e,link:a,children:o})=>{const n=a.hot===e;return t.jsx("div",{"data-hot":n?"true":void 0,className:`rounded-md transition-shadow duration-(--dur-instant) ease-(--ease-standard) ${n?"ring-2 ring-primary/40 ring-offset-2 ring-offset-canvas":""}`,onPointerEnter:()=>a.setHot(e),onPointerLeave:()=>a.setHot(null),onFocus:()=>a.setHot(e),onBlur:()=>a.setHot(null),children:o})};function h(e,a,o){const n=e.hot===a;return{text:t.jsx("span",{"data-hot":n?"true":void 0,className:`-mx-1.5 rounded px-1.5 py-0.5 box-decoration-clone transition-colors duration-(--dur-instant) ease-(--ease-standard) ${n?"bg-primary-light":""}`,onPointerEnter:()=>e.setHot(a),onPointerLeave:()=>e.setHot(null),children:o})}}const G=()=>{const[e,a]=f.useState(ae),[o,n]=f.useState(1),[u,m]=f.useState(!1),l=O(),g=O(),y=O(),I=O(),oe=w=>a(re=>{const S=new Set(re);return S.has(w)?S.delete(w):S.add(w),S}),U=r.columnCatalog.filter(w=>e.has(w.id)),ne=[{id:"export-list",label:"Export list",icon:"download",variant:"primary",onClick:()=>m(!0),title:"Export the current groups list as CSV"}],se=[{id:"compare",label:"Compare",icon:"chart",onClick:c,title:`Compare the ${P.length} selected groups`},{id:"export-selection",label:"Export",icon:"download",onClick:()=>m(!0),title:`Export the ${P.length} selected groups`,priority:"tier"}];return t.jsxs(ce,{id:"export",show:Ce,children:[t.jsx(A,{title:"Pick an Export",intro:"Sooner or later someone asks for the list. The Export tab turns any answer the panel can give into a CSV, and it opens on everything it can export. A card carries the icon, the name, and one line saying what a row of that export holds.",legend:[h(l,1,"Users reads the whole org, so there is nothing to pick first. A filter is the only thing that narrows it."),h(l,2,"Group Memberships has no rows until you name a group, so choosing it opens a group search before anything else.")],children:t.jsxs("div",{className:"flex flex-col gap-3",children:[t.jsx(d,{n:1,children:t.jsx(p,{n:1,link:l,children:t.jsx(N,{descriptors:[r],onSelect:c})})}),t.jsx(d,{n:2,children:t.jsx(p,{n:2,link:l,children:t.jsx(N,{descriptors:[D],onSelect:c})})})]})}),t.jsx(A,{title:"Scope",intro:"A whole-org export takes an optional filter. A search-to-select export takes a parent entity first. One of each is shown here.",legend:[h(g,1,"Search the group by name and pick it. The rows are its members and nobody else."),h(g,2,t.jsxs(t.Fragment,{children:["Type an Okta search expression and it reaches Okta as you wrote it. The line under the box counted ",M.count," rows on the first page, so a typo reads No matches before you download."]}))],children:t.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[t.jsx(d,{n:1,children:t.jsx(p,{n:1,link:g,children:t.jsx(we,{label:$?.label??"Group",placeholder:$?.placeholder??"Search groups by name",search:Ee,onSelect:c,initialSelected:be})})}),t.jsx(d,{n:2,children:t.jsx(p,{n:2,link:g,children:t.jsx(z,{value:xe,onChange:c,help:H?.help??"",placeholder:H?.placeholder??"",matchCount:M,matchCountLoading:!1})})})]})}),t.jsx(A,{title:"Columns and Run",intro:"Columns are chips, grouped by where the value lives. Tick a chip and the preview under it redraws in the columns that are on.",outro:"Every cell is escaped on the way out, so a value that starts with an equals sign opens as text in a spreadsheet, not as a formula. The filename carries the export, the scope and the date, so the file explains itself after it has left your downloads folder. A row that Okta returned in a shape the panel does not recognise is counted as skipped, never silently dropped.",legend:[h(y,1,t.jsxs(t.Fragment,{children:["Identity chips read the user record. Profile chips read the profile, including any attribute your org added. The figure beside Columns is how many are on,"," ",U.length," right now."]})),h(y,2,"Preview reads the rows and lays out the first hundred. Download CSV writes every row it matched to a file."),h(y,3,t.jsxs(t.Fragment,{children:["The line above the table says how many rows the file will hold: the ",M.count," ","the filter matched, in the columns you left on. An export that reaches the cap of 50,000 rows says so here and stops there."]}))],children:t.jsxs("div",{className:"flex flex-col gap-(--sp-rung)",children:[t.jsx(d,{n:1,align:"top",children:t.jsx(p,{n:1,link:y,children:t.jsx(J,{catalog:r.columnCatalog,enabled:e,onToggle:oe})})}),t.jsx(d,{n:2,children:t.jsx(p,{n:2,link:y,children:t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx(F,{variant:"secondary",onClick:()=>n(w=>w+1),children:"Preview"}),t.jsx(F,{variant:"primary",icon:"download",onClick:c,children:"Download CSV"})]})})}),t.jsx(d,{n:3,align:"top",children:t.jsx(p,{n:3,link:y,children:t.jsx("div",{className:"animate-rise-in",children:t.jsx(X,{columns:U,rows:L,fetched:L.length,dropped:0,capped:!1,linkify:r.linkify,oktaOrigin:ee})},o)})})]})}),t.jsxs(A,{title:"Tab Exports",stageLabel:"Groups, selection",intro:`Three of the ${K} groups on the list are ticked, so the strip has grown the verbs that act on them. Open More and click Export to open the same modal here, where Include member list adds a second CSV holding every member of every ticked group.`,legend:[h(I,1,t.jsxs(t.Fragment,{children:["Export list writes the ",K," groups the filter left on screen. Export, behind More, writes only the ",P.length," you ticked."]}))],minHeight:u?760:160,children:[t.jsx(d,{n:1,align:"top",children:t.jsx(p,{n:1,link:I,children:t.jsx(ie,{ariaLabel:"Actions for the groups list",sticky:!1,actions:ne,register:{ariaLabel:"Selection actions for the groups list",actions:se}})})}),t.jsx(ge,{isOpen:u,onClose:()=>m(!1),groups:P,targetTabId:null,exportType:"selection",onFetchMembers:()=>Promise.resolve([])})]})]})};try{G.displayName="export",G.__docgenInfo={description:"",displayName:"export",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/export.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:s,userEvent:i,within:v}=__STORYBOOK_MODULE_TEST__,ot={title:"Guide/Chapters/export",component:G,decorators:[de("export")],parameters:Y,parameters:{docs:{description:{component:"The Export chapter, in the shell, rail on Export."}}}},b={},E={parameters:{...Y,motion:"on"},play:async({canvasElement:e})=>{await pe(e);const a=v(e.querySelector(".guide-show"));await s(a.getByText("Preview lays out the first rows in the columns you left on.")).toBeInTheDocument(),await s(a.getByRole("searchbox",{name:"Filter"})).toHaveValue('profile.department eq "Legal"'),await s(a.getByText("7 matching")).toBeInTheDocument(),await s(a.getByRole("button",{name:"Department"})).toHaveAttribute("aria-pressed","true"),await s(a.getByRole("button",{name:"Title"})).toHaveAttribute("aria-pressed","true");const o=a.getByRole("table");await s(v(o).getByRole("columnheader",{name:"Department"})).toBeVisible()}},B={play:async({canvasElement:e})=>{const o=await x(e).findByRole("button",{name:"Department"});await s(o).toHaveAttribute("aria-pressed","false"),await i.click(o),await s(o).toHaveAttribute("aria-pressed","true")}},k={play:async({canvasElement:e})=>{const a=x(e);await i.click(await a.findByRole("button",{name:"Preview"}));const o=await a.findByRole("table");await s(v(o).getByRole("columnheader",{name:"Email"})).toBeVisible()}},R={play:async({canvasElement:e})=>{const a=x(e),o=await a.findByRole("table");await s(v(o).queryByRole("columnheader",{name:"Department"})).toBeNull(),await i.click(await a.findByRole("button",{name:"Department"})),await s(v(await a.findByRole("table")).getByRole("columnheader",{name:"Department"})).toBeVisible()}},C={parameters:{motion:"on"},play:async({canvasElement:e})=>{const a=x(e),o=await a.findByRole("button",{name:"Preview"});await i.click(o);const n=await a.findByRole("table");await s(v(n).getByRole("columnheader",{name:"Email"})).toBeVisible(),await i.click(o),await s(await a.findByRole("table")).toBeVisible()}},T={play:async({canvasElement:e})=>{const a=x(e),o=await a.findByRole("button",{name:/^Users/}),n=a.getByText(/Users reads the whole org/);await i.hover(o),await s(n).toHaveAttribute("data-hot","true"),await i.unhover(o),await s(n).not.toHaveAttribute("data-hot"),await i.hover(n),await s(o.closest('[data-hot="true"]')).not.toBeNull(),await i.unhover(n),await s(n).not.toHaveAttribute("data-hot")}},j={play:async({canvasElement:e})=>{const a=x(e);await i.click(await a.findByRole("button",{name:"More"})),await i.click(await a.findByRole("button",{name:"Export"}));const o=await a.findByRole("dialog");await s(o).toHaveAccessibleName(/Export Groups/)}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:"{}",...b.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...b.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const show = within(canvasElement.querySelector<HTMLElement>('.guide-show') as HTMLElement);
    await expect(show.getByText('Preview lays out the first rows in the columns you left on.')).toBeInTheDocument();
    await expect(show.getByRole('searchbox', {
      name: 'Filter'
    })).toHaveValue('profile.department eq "Legal"');
    await expect(show.getByText('7 matching')).toBeInTheDocument();
    await expect(show.getByRole('button', {
      name: 'Department'
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(show.getByRole('button', {
      name: 'Title'
    })).toHaveAttribute('aria-pressed', 'true');
    const table = show.getByRole('table');
    await expect(within(table).getByRole('columnheader', {
      name: 'Department'
    })).toBeVisible();
  }
}`,...E.parameters?.docs?.source},description:{story:`The show plays through to its still: the Users export configured, the
clause in the filter box with its match count under it, Department and
Title ticked on, and the preview table in the columns that are on. Motion
on, so the beats actually step; the play waits for the last one before it
looks.`,...E.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const department = await canvas.findByRole('button', {
      name: 'Department'
    });
    await expect(department).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(department);
    await expect(department).toHaveAttribute('aria-pressed', 'true');
  }
}`,...B.parameters?.docs?.source},description:{story:"A column chip toggles on click and the picker's count follows.",...B.parameters?.docs?.description}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Preview'
    }));
    const table = await canvas.findByRole('table');
    await expect(within(table).getByRole('columnheader', {
      name: 'Email'
    })).toBeVisible();
  }
}`,...k.parameters?.docs?.source},description:{story:"Preview reads the rows again; the table comes back and nothing is downloaded.",...k.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const table = await canvas.findByRole('table');
    await expect(within(table).queryByRole('columnheader', {
      name: 'Department'
    })).toBeNull();
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Department'
    }));
    await expect(within(await canvas.findByRole('table')).getByRole('columnheader', {
      name: 'Department'
    })).toBeVisible();
  }
}`,...R.parameters?.docs?.source},description:{story:`Ticking a column chip redraws the preview under it: Department joins the
table's header row without a second Preview.`,...R.parameters?.docs?.description}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const preview = await canvas.findByRole('button', {
      name: 'Preview'
    });
    await userEvent.click(preview);
    const table = await canvas.findByRole('table');
    await expect(within(table).getByRole('columnheader', {
      name: 'Email'
    })).toBeVisible();
    await userEvent.click(preview);
    await expect(await canvas.findByRole('table')).toBeVisible();
  }
}`,...C.parameters?.docs?.source},description:{story:"The reveal with motion on: the table rises in again each time Preview is\nclicked. Same assertions as `PreviewOpened`; the choreography is the subject.",...C.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const usersCard = await canvas.findByRole('button', {
      name: /^Users/
    });
    const row = canvas.getByText(/Users reads the whole org/);
    await userEvent.hover(usersCard);
    await expect(row).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(usersCard);
    await expect(row).not.toHaveAttribute('data-hot');
    await userEvent.hover(row);
    await expect(usersCard.closest('[data-hot="true"]')).not.toBeNull();
    await userEvent.unhover(row);
    await expect(row).not.toHaveAttribute('data-hot');
  }
}`,...T.parameters?.docs?.source},description:{story:"Resting the pointer on a marked element lights its legend row, and resting on\nthe row rings the element. Both halves are asserted through the `data-hot`\nattribute each side sets, not through a class.",...T.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {
      name: 'More'
    }));
    await userEvent.click(await canvas.findByRole('button', {
      name: 'Export'
    }));
    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName(/Export Groups/);
  }
}`,...j.parameters?.docs?.source},description:{story:`The selection export lives behind the strip's tier, as it does on the Groups
tab: More opens it, and Export opens the modal inside the frame.`,...j.parameters?.docs?.description}}};const nt=["Default","Show","ColumnToggled","PreviewOpened","ColumnReachesPreview","PreviewRevealed","LegendLinked","ModalOpened"];export{R as ColumnReachesPreview,B as ColumnToggled,b as Default,T as LegendLinked,j as ModalOpened,k as PreviewOpened,C as PreviewRevealed,E as Show,nt as __namedExportsOrder,ot as default};
