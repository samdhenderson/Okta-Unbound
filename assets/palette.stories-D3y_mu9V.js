import{j as n,u as re,r as b}from"./iframe-mmN7AxbW.js";import{C as ce,a as W,w as le,b as de,r as O}from"./chapterStory-BJBxwv1h.js";import{S as V}from"./Scene-D2nzHScN.js";import{A as he}from"./Assemble-BfsBqw6B.js";import{T as pe}from"./TabNavigation-B636rhG9.js";import{T as A}from"./TabJumpPalette-Cwl0YQjq.js";import{O as ue}from"./OrgSnapshotCard-DpYaYYPJ.js";import{b as D,a as G,c as P}from"./orgFigures-Z-hvuRoQ.js";import{T as N}from"./tabs-2VIodLff.js";import{D as Y,c as me,e as ge}from"./memberships-DTz2buzd.js";import{b as we,d as ye,e as E,c as fe,D as Q}from"./snapshot-D1CIyPrl.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-aeC6fZDy.js";import"./InstallCta-wq3hO1J-.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./PaletteRow-smZnTizP.js";import"./paletteRowStyles-ldxw9afL.js";import"./jumpDestinations-db1xhCJ2.js";import"./dateFormat-C9yVDsck.js";const r=()=>{},v=we().get(Q),L=E.find(e=>e.actions?.assignUserToGroups?.groupIds.includes(Q)),x=ye[0],B=me.get(ge.left),z=[{kind:"group",id:v.id,name:v.profile?.name??v.id,secondary:v.profile?.description},{kind:"app",id:x.id,name:x.label??x.id,appName:x.name},{kind:"rule",id:L.id,name:L.name,secondary:"Active"},{kind:"user",id:B.id,name:`${B.profile.firstName} ${B.profile.lastName}`,secondary:B.profile.email}],X={group:{fromSnapshot:!0,complete:!0},app:{fromSnapshot:!0,complete:!0},rule:{fromSnapshot:!0,complete:!0},user:{fromSnapshot:!1,complete:!0}},S=[{id:"open-guide",label:"Open the user guide",icon:"book",run:r},{id:"show-welcome",label:"Show the welcome screen again",icon:"sparkles",run:r}],Z=()=>!0,$=3,ee=Date.now()-1200*1e3,te=e=>({isReading:!1,complete:!0,lastFullWalkAt:ee,count:e,error:null}),ne=fe(),be=new Set(E.flatMap(e=>e.actions?.assignUserToGroups?.groupIds??[])),ve=ne.filter(e=>(e._embedded?.stats?.usersCount??0)===0&&!be.has(e.id)).length,xe=E.filter(e=>e.status==="INACTIVE").length,F={source:te(ne.length),noun:"groups"},k={source:te(E.length),noun:"group rules"},Be=[D(P("groups","Groups","users",F.source),"groups","groups",[G({key:"groups-empty-unfilled",label:"Groups with no members that no rule fills",icon:"users",counted:F,gates:[k],count:ve,request:{tab:"groups",view:"empty-no-rules"}})]),D(P("rules","Group rules","bolt",k.source),"rules","group rules",[G({key:"rules-paused",label:"Group rules paused",icon:"pause",counted:k,count:xe,request:{tab:"rules",view:"paused"}})])],Te="ul > li:not(:has(button, a)):has(> span), ul > li:has(> [aria-label])",Re=e=>e>=3?"results":e===2?"searching":"idle",Ee={stageLabel:"Command palette",minHeight:1120,beats:[{caption:"You are on Home. Press Command K, or Ctrl K off a Mac.",hold:3},{caption:"It opens over Home without leaving it, every section listed.",hold:3},{caption:"The field spins while your org is searched. The sections never wait.",hold:3},{caption:"Rows from your org, under their kind, each heading saying where it came from."}],render:e=>n.jsxs("div",{className:"flex flex-col gap-3",children:[n.jsx("div",{className:"-mx-3 -mt-3",children:n.jsx(pe,{activeTab:"home",onTabChange:r,onOpenCommandPalette:r,shortcutPlatform:"apple"})}),n.jsx(ue,{boxes:Be,readAt:ee,isRefreshing:!1,onRefresh:r,canRefresh:!0,onOpenTab:r,onOpenListView:r}),n.jsx(he,{selector:Te,children:n.jsx(A,{isOpen:e>=1,onClose:r,activeTab:"home",onSelect:r,onEntityQueryChange:r,entityMode:Re(e),entityResults:e>=3?z:[],sectionMeta:X,commands:S,canReach:Z,onEntitySelect:r,oktaOrigin:Y,entityMinChars:$})})]})};function Se(e){if(e||typeof document>"u"||typeof window.getComputedStyle!="function"||document.querySelector('[data-motion="off"]'))return 0;const o=window.getComputedStyle(document.documentElement).getPropertyValue("--dur-tell").trim(),t=Number.parseFloat(o);return Number.isFinite(t)?o.endsWith("ms")?t:t*1e3:0}const Ce=()=>{const e=re(),[o,t]=b.useState("results"),s=b.useRef(void 0);b.useEffect(()=>()=>window.clearTimeout(s.current),[]);const c=b.useCallback(h=>{if(window.clearTimeout(s.current),h.trim().length<$){t("idle");return}const f=Se(e);if(f===0){t("results");return}t("searching"),s.current=window.setTimeout(()=>t("results"),f)},[e]);return n.jsx(A,{isOpen:!0,onClose:r,activeTab:"home",onSelect:r,onEntityQueryChange:c,entityMode:o,entityResults:z,sectionMeta:X,commands:S,canReach:Z,onEntitySelect:r,oktaOrigin:Y,entityMinChars:$})},M=e=>`ul > li:nth-child(${e})`,q=N.map((e,o)=>e.railHidden?o+1:null).filter(e=>e!==null).map(M),He=M(N.length+1),ke=S.map((e,o)=>M(N.length+2+o)),U=':has(input[type="search"]:placeholder-shown)',$e=[{hint:"current",targets:['[aria-current="page"]'],dot:'ul > li:has(> [aria-current="page"])'},{hint:"hidden",targets:q,dot:q.join(", "),when:U},{hint:"commands",targets:ke,dot:He,when:U},{hint:"keys",targets:['[role="dialog"] p:has(kbd)'],dot:'[role="dialog"] p:has(kbd)',on:[':has([role="dialog"] p:hover kbd)']}],je=[{hint:"source",targets:["ul > li:not(:has(button, a)):has(> span)"],dot:"ul > li:nth-child(1 of :not(:has(button, a)):has(> span))",on:[":has(ul > li:hover > span)"]},{hint:"edge",targets:["ul > li > [aria-label] > span:last-of-type"],dot:"ul > li:nth-child(1 of :has(> [aria-label]))",on:[":has(ul > li > [aria-label]:is(:hover, :focus-visible))"]},{hint:"field",targets:['[role="dialog"] input[type="search"]'],dot:'[role="dialog"] div:has(> input[type="search"])'}],j=".guide-palette-scene",R=".guide-legend > li",_e=["position: absolute","left: calc(var(--spacing) * -5.5)","top: 50%","translate: 0 -50%","z-index: 10","display: flex","align-items: center","justify-content: center","width: calc(var(--spacing) * 5)","height: calc(var(--spacing) * 5)","border-radius: 9999px","background-color: var(--color-primary)","color: var(--color-white)","font-size: 11px","font-weight: 600","line-height: 1","box-shadow: var(--shadow-dock)","pointer-events: none"].join(`;
  `);function J(e,o){const t=`${j}[data-scene="${e}"]`;return o.flatMap(({hint:s,targets:c,dot:h,on:f,when:C=""},ae)=>{const oe=ae+1,I=`[data-guide-hint="${s}"]`,se=f??c.map(p=>`:has(${p}:hover, ${p}:focus-visible, ${p} :focus-visible)`),H=`${t}${C}:is(${[`:has(${R}:hover ${I})`,...se].join(", ")})`,ie=c.map(p=>`${H} ${p}`).join(`,
`);return[`${t}${C} :is(${h}) {
  position: relative;
}`,`${t}${C} :is(${h})::before {
  content: "${oe}";
  ${_e};
}`,`${ie} {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md, 0.375rem);
}`,`${H} ${R}:has(${I}) {
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 6px var(--color-primary-light);
}`,`${H} :is(${h})::before {
  box-shadow: 0 0 0 4px var(--color-primary-light);
}`]}).join(`
`)}const Oe=[`${j} ${R} {
  border-radius: var(--radius-md, 0.375rem);
  transition:
    background-color var(--dur-instant) var(--ease-standard),
    box-shadow var(--dur-instant) var(--ease-standard);
}`,`${j} ${R}:hover {
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 6px var(--color-primary-light);
}`,J("open",$e),J("search",je)].join(`
`),l=({name:e,children:o})=>n.jsx("span",{"data-guide-hint":e,children:o}),T=({children:e})=>n.jsx("kbd",{className:"font-sans",children:e}),_=()=>n.jsxs(ce,{id:"palette",show:Ee,children:[n.jsx("style",{children:Oe}),n.jsx("div",{className:"guide-palette-scene","data-scene":"open",children:n.jsx(V,{title:"Sections",stageLabel:"Command palette",intro:n.jsxs(n.Fragment,{children:["Press ",n.jsx(T,{children:"Cmd"})," ",n.jsx(T,{children:"K"})," on a Mac, or ",n.jsx(T,{children:"Ctrl"})," ",n.jsx(T,{children:"K"})," elsewhere, and the palette opens over the tab you were reading. Press the chord again to close it. Every section is listed the moment it opens, and the field already has the caret. Rest on a numbered line, or on the thing it describes, and both light."]}),legend:[{text:n.jsx(l,{name:"current",children:"Home is marked Current, so the palette says where you are before it takes you anywhere."})},{text:n.jsx(l,{name:"hidden",children:"History and Selection have no seat on the rail. This is how you reach them."})},{text:n.jsx(l,{name:"commands",children:"Under the sections sit the two commands: open this guide, or replay the welcome screen."})},{text:n.jsx(l,{name:"keys",children:"The foot of the palette names the keys: arrows to walk the list, Enter to jump, Esc to close."})}],outro:"Sections filter on the first keystroke. The org search waits for three characters, then looks across groups, apps, rules, policies and people at once. The section rows never wait on it.",minHeight:720,children:n.jsx(A,{isOpen:!0,onClose:r,activeTab:"home",onSelect:r,commands:S})})}),n.jsx("div",{className:"guide-palette-scene","data-scene":"search",children:n.jsx(V,{title:"Org Search",stageLabel:"Command palette, searching",intro:"Three characters in, rows from your org arrive under the sections, grouped by kind. Type in this frame: the four rows are fixed, the search behaves the way the panel does.",legend:[{text:n.jsx(l,{name:"source",children:"Each heading says where its rows came from. Groups, apps and rules come from the snapshot you already hold; people are searched live, because the snapshot never holds them."})},{text:n.jsx(l,{name:"edge",children:"The right edge of every row names the tab it opens, so you know where Enter is about to put you."})},{text:n.jsx(l,{name:"field",children:"A spinner sits in the field while your org is searched, and the rows you already have stay put, so the list never empties mid word."})}],outro:"The two commands at the foot of the list go nowhere in the panel. Open the user guide brings this page up in a new tab, and Show the welcome screen again puts the first run screen back on the panel. They filter on the same letters as the sections.",minHeight:1120,children:n.jsx(Ce,{})})})]});try{_.displayName="palette",_.__docgenInfo={description:"",displayName:"palette",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/palette.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:a,userEvent:d,waitFor:K,within:i}=__STORYBOOK_MODULE_TEST__,rt={title:"Guide/Chapters/palette",component:_,decorators:[le("palette")],parameters:W,parameters:{docs:{description:{component:"The Command palette chapter, in the shell, rail on Command palette."}}}},u={},m={parameters:{...W,motion:"on"},play:async({canvasElement:e})=>{await de(e);const o=e.querySelector("[data-show-state]");if(await a(o).not.toBeNull(),!o)return;const t=i(o);await a(t.getByTestId("guide-caption")).toHaveTextContent("Rows from your org, under their kind, each heading saying where it came from.");const s=t.getByRole("dialog",{name:"Jump to section"});await a(i(s).getByRole("button",{name:/^Engineering .* open in Groups$/})).toBeVisible(),await a(i(s).getAllByText("from snapshot",{exact:!1})).toHaveLength(3),await a(i(s).getByText("live",{exact:!1})).toBeVisible(),await a(i(s).getByRole("status")).toHaveTextContent("4 results"),await a(i(s).getByRole("button",{name:"Open the user guide"})).toBeVisible(),await a(t.getByRole("tablist",{name:"Main sections"})).toBeVisible(),await a(t.getByRole("heading",{name:"This org"})).toBeVisible()}},g={play:async({canvasElement:e})=>{const o=O(e),[t,s]=await o.findAllByRole("dialog",{name:"Jump to section"}),c=i(t).getByRole("searchbox",{name:"Search sections"});await d.type(c,"hist"),await a(i(t).getByRole("status")).toHaveTextContent("1 section available"),await a(i(t).getByRole("button",{name:/^History/})).toBeVisible(),await a(i(t).queryByRole("button",{name:/^Home/})).not.toBeInTheDocument(),await a(i(s).getByRole("button",{name:/^Home/})).toBeVisible(),await a(i(s).getByRole("button",{name:/^Engineering .* open in Groups$/})).toBeVisible()}},w={parameters:{motion:"on"},play:async({canvasElement:e})=>{const o=O(e),[,t]=await o.findAllByRole("dialog",{name:"Jump to section"}),s=()=>i(t).queryByRole("button",{name:/^Engineering .* open in Groups$/});await a(s()).toBeVisible();const c=i(t).getByRole("searchbox",{name:"Search sections"});await d.type(c,"en"),await a(s()).not.toBeInTheDocument(),await a(i(t).getByText("Type 3 characters to search the org.")).toBeVisible(),await d.type(c,"g"),await K(()=>a(s()).toBeVisible()),await K(()=>a(i(t).getByRole("status")).toHaveTextContent("0 sections available, 4 results")),await a(i(t).getByRole("status")).not.toHaveTextContent("searching")}},y={parameters:{motion:"on"},play:async({canvasElement:e})=>{const o=O(e),[t]=await o.findAllByRole("dialog",{name:"Jump to section"}),s=i(t).getByRole("button",{name:/^Home/});await a(s).toHaveAttribute("aria-current","page");const c=e.querySelector('[data-guide-hint="current"]');await a(c).not.toBeNull(),c&&await d.hover(c),await d.click(i(t).getByRole("searchbox",{name:"Search sections"})),await d.tab(),await a(s).toHaveFocus()}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:"{}",...u.parameters?.docs?.source},description:{story:"The chapter as a reader sees it: both palettes open inside their frames.",...u.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
    await expect(stage.getByTestId('guide-caption')).toHaveTextContent('Rows from your org, under their kind, each heading saying where it came from.');
    const dialog = stage.getByRole('dialog', {
      name: 'Jump to section'
    });
    await expect(within(dialog).getByRole('button', {
      name: /^Engineering .* open in Groups$/
    })).toBeVisible();
    // Groups, apps and rules each say so; people are searched live.
    await expect(within(dialog).getAllByText('from snapshot', {
      exact: false
    })).toHaveLength(3);
    await expect(within(dialog).getByText('live', {
      exact: false
    })).toBeVisible();
    await expect(within(dialog).getByRole('status')).toHaveTextContent('4 results');
    // The two commands the panel always hands the palette.
    await expect(within(dialog).getByRole('button', {
      name: 'Open the user guide'
    })).toBeVisible();
    // The panel the palette opened over: the rail, and Home's snapshot card.
    await expect(stage.getByRole('tablist', {
      name: 'Main sections'
    })).toBeVisible();
    await expect(stage.getByRole('heading', {
      name: 'This org'
    })).toBeVisible();
  }
}`,...m.parameters?.docs?.source},description:{story:`The show, played through: the still is the palette over Home, a row of each
kind under its heading, and the last caption under the stage. The headless
runner loads no motion scale, so the still is up at once; the play is the
gate for the pose.`,...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const [first, second] = await canvas.findAllByRole('dialog', {
      name: 'Jump to section'
    });
    const field = within(first).getByRole('searchbox', {
      name: 'Search sections'
    });
    await userEvent.type(field, 'hist');
    await expect(within(first).getByRole('status')).toHaveTextContent('1 section available');
    await expect(within(first).getByRole('button', {
      name: /^History/
    })).toBeVisible();
    await expect(within(first).queryByRole('button', {
      name: /^Home/
    })).not.toBeInTheDocument();
    await expect(within(second).getByRole('button', {
      name: /^Home/
    })).toBeVisible();
    await expect(within(second).getByRole('button', {
      name: /^Engineering .* open in Groups$/
    })).toBeVisible();
  }
}`,...g.parameters?.docs?.source},description:{story:"Typing in the first frame filters its sections; the second frame is untouched.",...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const [, second] = await canvas.findAllByRole('dialog', {
      name: 'Jump to section'
    });
    const engineering = () => within(second).queryByRole('button', {
      name: /^Engineering .* open in Groups$/
    });
    await expect(engineering()).toBeVisible();
    const field = within(second).getByRole('searchbox', {
      name: 'Search sections'
    });
    await userEvent.type(field, 'en');
    await expect(engineering()).not.toBeInTheDocument();
    await expect(within(second).getByText('Type 3 characters to search the org.')).toBeVisible();
    await userEvent.type(field, 'g');
    await waitFor(() => expect(engineering()).toBeVisible());
    await waitFor(() => expect(within(second).getByRole('status')).toHaveTextContent('0 sections available, 4 results'));
    await expect(within(second).getByRole('status')).not.toHaveTextContent('searching');
  }
}`,...w.parameters?.docs?.source},description:{story:`The second frame's stand-in search. Two characters and the org rows step
aside; the third brings them back, after the spinner's beat when motion is
on. The rows never depend on what was typed.`,...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const [first] = await canvas.findAllByRole('dialog', {
      name: 'Jump to section'
    });
    const current = within(first).getByRole('button', {
      name: /^Home/
    });
    await expect(current).toHaveAttribute('aria-current', 'page');
    const hint = canvasElement.querySelector<HTMLElement>('[data-guide-hint="current"]');
    await expect(hint).not.toBeNull();
    if (hint) await userEvent.hover(hint);
    await userEvent.click(within(first).getByRole('searchbox', {
      name: 'Search sections'
    }));
    await userEvent.tab();
    await expect(current).toHaveFocus();
  }
}`,...y.parameters?.docs?.source},description:{story:`The legend ties, with motion on: resting on the first legend row outlines
the Current row in the frame, resting on that row tints the legend row, and
so does tabbing to it, so the tie is reachable without a pointer. The tie is
CSS, so the play only puts the pointer and the focus where a reader would.`,...y.parameters?.docs?.description}}};const ct=["Default","Show","SectionsFiltered","SearchBeat","LegendTied"];export{u as Default,y as LegendTied,w as SearchBeat,g as SectionsFiltered,m as Show,ct as __namedExportsOrder,rt as default};
