import{j as n,u as X,r as h}from"./iframe-Pee757m_.js";import{C as Z,a as L,w as ee,b as te,r as $}from"./chapterStory-CFpIgc-I.js";import{S as N}from"./Scene-CdJM5Keo.js";import{A as ne}from"./Assemble-AGzofEAC.js";import{T as oe}from"./TabNavigation-BJvgWlzD.js";import{T as _}from"./TabJumpPalette-CriBu3sk.js";import{C as ae}from"./ConciergeGreeting-Ci6otbaj.js";import{c as se}from"./concierge-u51xvn3n.js";import{T as O}from"./tabs-2VIodLff.js";import{D as F,c as ie,e as re}from"./memberships-Cd9vTj_G.js";import{c as ce,d as le,e as de,D as q}from"./snapshot-CcW3L-sh.js";import"./preload-helper-PPVm8Dsz.js";import"./chapters-B2QnSBoC.js";import"./InstallCta-BEikTIAL.js";import"./githubLinks-BfCtNl-2.js";import"./StatusChip-tucVCR_u.js";import"./useRevealOnView-S6iiQ_8T.js";import"./motion-BHuXImUL.js";import"./Dock-C2yLCSm9.js";import"./useStaggerReveal-B8AfVumu.js";import"./sceneRegistry-CY69Myqs.js";/* empty css              */import"./Stage-Cjomzbog.js";import"./PaletteRow-BUv90omL.js";import"./paletteRowStyles-BGppIMfv.js";import"./jumpDestinations-db1xhCJ2.js";import"./motion-DWPTjLhl.js";import"./verbIcons-BnCRhW9A.js";import"./GuideInvite-D_pp1wv2.js";import"./Orb-DQZsh7BJ.js";import"./RecommendationCard-DJVvo1S8.js";import"./concierge-CFpCju1p.js";import"./then-JFpS9G1J.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./registry-Dm1g-4iX.js";import"./oktaPagination-DbhZcGD1.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./costSentence-BaIgeJiz.js";const r=()=>{},d=ce().get(q),I=de.find(e=>e.actions?.assignUserToGroups?.groupIds.includes(q)),x=le[0],B=ie.get(re.left),J=[{kind:"group",id:d.id,name:d.profile?.name??d.id,secondary:d.profile?.description},{kind:"app",id:x.id,name:x.label??x.id,appName:x.name},{kind:"rule",id:I.id,name:I.name,secondary:"Active"},{kind:"user",id:B.id,name:`${B.profile.firstName} ${B.profile.lastName}`,secondary:B.profile.email}],U={group:{fromSnapshot:!0,complete:!0},app:{fromSnapshot:!0,complete:!0},rule:{fromSnapshot:!0,complete:!0},user:{fromSnapshot:!1,complete:!0}},E=[{id:"open-guide",label:"Open the user guide",icon:"book",run:r},{id:"replay-welcome",label:"Replay the welcome",icon:"sparkles",run:r}],K=()=>!0,H=3,he={kind:"group",id:d.id,name:d.profile?.name??d.id},pe=()=>{const[e]=h.useState(()=>new Date().getHours()),o=h.useMemo(()=>se(he,e),[e]);return n.jsx(ae,{concierge:o,connected:!0,show:!1,onShowDone:r,invite:!1,onOpenGuide:r,onDismissInvite:r,onChoose:r})},me="ul > li:not(:has(button, a)):has(> span), ul > li:has(> [aria-label])",ue=e=>e>=3?"results":e===2?"searching":"idle",ge={stageLabel:"Command palette",minHeight:1120,beats:[{caption:"You are on Home. Press Command K, or Ctrl K off a Mac.",hold:3},{caption:"It opens over Home without leaving it, every section listed.",hold:3},{caption:"The field spins while your org is searched. The sections never wait.",hold:3},{caption:"Rows from your org, under their kind, each heading saying where it came from."}],render:e=>n.jsxs("div",{className:"flex flex-col gap-3",children:[n.jsx("div",{className:"-mx-3 -mt-3",children:n.jsx(oe,{activeTab:"home",onTabChange:r,onOpenCommandPalette:r,shortcutPlatform:"apple"})}),n.jsx(pe,{}),n.jsx(ne,{selector:me,children:n.jsx(_,{isOpen:e>=1,onClose:r,activeTab:"home",onSelect:r,onEntityQueryChange:r,entityMode:ue(e),entityResults:e>=3?J:[],sectionMeta:U,commands:E,canReach:K,onEntitySelect:r,oktaOrigin:F,entityMinChars:H})})]})};function we(e){if(e||typeof document>"u"||typeof window.getComputedStyle!="function"||document.querySelector('[data-motion="off"]'))return 0;const o=window.getComputedStyle(document.documentElement).getPropertyValue("--dur-tell").trim(),t=Number.parseFloat(o);return Number.isFinite(t)?o.endsWith("ms")?t:t*1e3:0}const ye=()=>{const e=X(),[o,t]=h.useState("results"),s=h.useRef(void 0);h.useEffect(()=>()=>window.clearTimeout(s.current),[]);const c=h.useCallback(m=>{if(window.clearTimeout(s.current),m.trim().length<H){t("idle");return}const v=we(e);if(v===0){t("results");return}t("searching"),s.current=window.setTimeout(()=>t("results"),v)},[e]);return n.jsx(_,{isOpen:!0,onClose:r,activeTab:"home",onSelect:r,onEntityQueryChange:c,entityMode:o,entityResults:J,sectionMeta:U,commands:E,canReach:K,onEntitySelect:r,oktaOrigin:F,entityMinChars:H})},A=e=>`ul > li:nth-child(${e})`,V=O.map((e,o)=>e.railHidden?o+1:null).filter(e=>e!==null).map(A),fe=A(O.length+1),be=E.map((e,o)=>A(O.length+2+o)),D=':has(input[type="search"]:placeholder-shown)',ve=[{hint:"current",targets:['[aria-current="page"]'],dot:'ul > li:has(> [aria-current="page"])'},{hint:"hidden",targets:V,dot:V.join(", "),when:D},{hint:"commands",targets:be,dot:fe,when:D},{hint:"keys",targets:['[role="dialog"] p:has(kbd)'],dot:'[role="dialog"] p:has(kbd)',on:[':has([role="dialog"] p:hover kbd)']}],xe=[{hint:"source",targets:["ul > li:not(:has(button, a)):has(> span)"],dot:"ul > li:nth-child(1 of :not(:has(button, a)):has(> span))",on:[":has(ul > li:hover > span)"]},{hint:"edge",targets:["ul > li > [aria-label] > span:last-of-type"],dot:"ul > li:nth-child(1 of :has(> [aria-label]))",on:[":has(ul > li > [aria-label]:is(:hover, :focus-visible))"]},{hint:"field",targets:['[role="dialog"] input[type="search"]'],dot:'[role="dialog"] div:has(> input[type="search"])'}],k=".guide-palette-scene",R=".guide-legend > li",Be=["position: absolute","left: calc(var(--spacing) * -5.5)","top: 50%","translate: 0 -50%","z-index: 10","display: flex","align-items: center","justify-content: center","width: calc(var(--spacing) * 5)","height: calc(var(--spacing) * 5)","border-radius: 9999px","background-color: var(--color-primary)","color: var(--color-white)","font-size: 11px","font-weight: 600","line-height: 1","box-shadow: var(--shadow-dock)","pointer-events: none"].join(`;
  `);function P(e,o){const t=`${k}[data-scene="${e}"]`;return o.flatMap(({hint:s,targets:c,dot:m,on:v,when:S=""},W)=>{const Y=W+1,M=`[data-guide-hint="${s}"]`,Q=v??c.map(u=>`:has(${u}:hover, ${u}:focus-visible, ${u} :focus-visible)`),C=`${t}${S}:is(${[`:has(${R}:hover ${M})`,...Q].join(", ")})`,z=c.map(u=>`${C} ${u}`).join(`,
`);return[`${t}${S} :is(${m}) {
  position: relative;
}`,`${t}${S} :is(${m})::before {
  content: "${Y}";
  ${Be};
}`,`${z} {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md, 0.375rem);
}`,`${C} ${R}:has(${M}) {
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 6px var(--color-primary-light);
}`,`${C} :is(${m})::before {
  box-shadow: 0 0 0 4px var(--color-primary-light);
}`]}).join(`
`)}const Te=[`${k} ${R} {
  border-radius: var(--radius-md, 0.375rem);
  transition:
    background-color var(--dur-instant) var(--ease-standard),
    box-shadow var(--dur-instant) var(--ease-standard);
}`,`${k} ${R}:hover {
  background-color: var(--color-primary-light);
  box-shadow: 0 0 0 6px var(--color-primary-light);
}`,P("open",ve),P("search",xe)].join(`
`),l=({name:e,children:o})=>n.jsx("span",{"data-guide-hint":e,children:o}),T=({children:e})=>n.jsx("kbd",{className:"font-sans",children:e}),j=()=>n.jsxs(Z,{id:"palette",show:ge,children:[n.jsx("style",{children:Te}),n.jsx("div",{className:"guide-palette-scene","data-scene":"open",children:n.jsx(N,{title:"Sections",stageLabel:"Command palette",intro:n.jsxs(n.Fragment,{children:["Press ",n.jsx(T,{children:"Cmd"})," ",n.jsx(T,{children:"K"})," on a Mac, or ",n.jsx(T,{children:"Ctrl"})," ",n.jsx(T,{children:"K"})," elsewhere, and the palette opens over the tab you were reading. Press the chord again to close it. Every section is listed the moment it opens, and the field already has the caret. Rest on a numbered line, or on the thing it describes, and both light."]}),legend:[{text:n.jsx(l,{name:"current",children:"Home is marked Current, so the palette says where you are before it takes you anywhere."})},{text:n.jsx(l,{name:"hidden",children:"History and Selection have no seat on the rail. This is how you reach them."})},{text:n.jsx(l,{name:"commands",children:"Under the sections sit the two commands: open this guide, or replay the welcome."})},{text:n.jsx(l,{name:"keys",children:"The foot of the palette names the keys: arrows to walk the list, Enter to jump, Esc to close."})}],outro:"Sections filter on the first keystroke. The org search waits for three characters, then looks across groups, apps, rules, policies and people at once. The section rows never wait on it.",minHeight:720,children:n.jsx(_,{isOpen:!0,onClose:r,activeTab:"home",onSelect:r,commands:E})})}),n.jsx("div",{className:"guide-palette-scene","data-scene":"search",children:n.jsx(N,{title:"Org Search",stageLabel:"Command palette, searching",intro:"Three characters in, rows from your org arrive under the sections, grouped by kind. Type in this frame: the four rows are fixed, the search behaves the way the panel does.",legend:[{text:n.jsx(l,{name:"source",children:"Each heading says where its rows came from. Groups, apps and rules come from the snapshot you already hold; people are searched live, because the snapshot never holds them."})},{text:n.jsx(l,{name:"edge",children:"The right edge of every row names the tab it opens, so you know where Enter is about to put you."})},{text:n.jsx(l,{name:"field",children:"A spinner sits in the field while your org is searched, and the rows you already have stay put, so the list never empties mid word."})}],outro:"The two commands at the foot of the list go nowhere in the panel. Open the user guide brings this page up in a new tab, and Replay the welcome takes you to Home, where the greeting plays again and the offer of this guide comes back. They filter on the same letters as the sections.",minHeight:1120,children:n.jsx(ye,{})})})]});try{j.displayName="palette",j.__docgenInfo={description:"",displayName:"palette",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/palette.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:a,userEvent:p,waitFor:G,within:i}=__STORYBOOK_MODULE_TEST__,ht={title:"Guide/Chapters/palette",component:j,decorators:[ee("palette")],parameters:L,parameters:{docs:{description:{component:"The Command palette chapter, in the shell, rail on Command palette."}}}},g={},w={parameters:{...L,motion:"on"},play:async({canvasElement:e})=>{await te(e);const o=e.querySelector("[data-show-state]");if(await a(o).not.toBeNull(),!o)return;const t=i(o);await a(t.getByTestId("guide-caption")).toHaveTextContent("Rows from your org, under their kind, each heading saying where it came from.");const s=t.getByRole("dialog",{name:"Jump to section"});await a(i(s).getByRole("button",{name:/^Engineering .* open in Groups$/})).toBeVisible(),await a(i(s).getAllByText("from snapshot",{exact:!1})).toHaveLength(3),await a(i(s).getByText("live",{exact:!1})).toBeVisible(),await a(i(s).getByRole("status")).toHaveTextContent("4 results"),await a(i(s).getByRole("button",{name:"Open the user guide"})).toBeVisible(),await a(t.getByRole("tablist",{name:"Main sections"})).toBeVisible(),await a(t.getByRole("region",{name:"Welcome"})).toBeVisible()}},y={play:async({canvasElement:e})=>{const o=$(e),[t,s]=await o.findAllByRole("dialog",{name:"Jump to section"}),c=i(t).getByRole("searchbox",{name:"Search sections"});await p.type(c,"hist"),await a(i(t).getByRole("status")).toHaveTextContent("1 section available"),await a(i(t).getByRole("button",{name:/^History/})).toBeVisible(),await a(i(t).queryByRole("button",{name:/^Home/})).not.toBeInTheDocument(),await a(i(s).getByRole("button",{name:/^Home/})).toBeVisible(),await a(i(s).getByRole("button",{name:/^Engineering .* open in Groups$/})).toBeVisible()}},f={parameters:{motion:"on"},play:async({canvasElement:e})=>{const o=$(e),[,t]=await o.findAllByRole("dialog",{name:"Jump to section"}),s=()=>i(t).queryByRole("button",{name:/^Engineering .* open in Groups$/});await a(s()).toBeVisible();const c=i(t).getByRole("searchbox",{name:"Search sections"});await p.type(c,"en"),await a(s()).not.toBeInTheDocument(),await a(i(t).getByText("Type 3 characters to search the org.")).toBeVisible(),await p.type(c,"g"),await G(()=>a(s()).toBeVisible()),await G(()=>a(i(t).getByRole("status")).toHaveTextContent("0 sections available, 4 results")),await a(i(t).getByRole("status")).not.toHaveTextContent("searching")}},b={parameters:{motion:"on"},play:async({canvasElement:e})=>{const o=$(e),[t]=await o.findAllByRole("dialog",{name:"Jump to section"}),s=i(t).getByRole("button",{name:/^Home/});await a(s).toHaveAttribute("aria-current","page");const c=e.querySelector('[data-guide-hint="current"]');await a(c).not.toBeNull(),c&&await p.hover(c),await p.click(i(t).getByRole("searchbox",{name:"Search sections"})),await p.tab(),await a(s).toHaveFocus()}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:"{}",...g.parameters?.docs?.source},description:{story:"The chapter as a reader sees it: both palettes open inside their frames.",...g.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
    // The panel the palette opened over: the rail, and Home's greeting.
    await expect(stage.getByRole('tablist', {
      name: 'Main sections'
    })).toBeVisible();
    await expect(stage.getByRole('region', {
      name: 'Welcome'
    })).toBeVisible();
  }
}`,...w.parameters?.docs?.source},description:{story:`The show, played through: the still is the palette over Home, a row of each
kind under its heading, and the last caption under the stage. The headless
runner loads no motion scale, so the still is up at once; the play is the
gate for the pose.`,...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source},description:{story:"Typing in the first frame filters its sections; the second frame is untouched.",...y.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source},description:{story:`The second frame's stand-in search. Two characters and the org rows step
aside; the third brings them back, after the spinner's beat when motion is
on. The rows never depend on what was typed.`,...f.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source},description:{story:`The legend ties, with motion on: resting on the first legend row outlines
the Current row in the frame, resting on that row tints the legend row, and
so does tabbing to it, so the tie is reachable without a pointer. The tie is
CSS, so the play only puts the pointer and the focus where a reader would.`,...b.parameters?.docs?.description}}};const pt=["Default","Show","SectionsFiltered","SearchBeat","LegendTied"];export{g as Default,b as LegendTied,f as SearchBeat,y as SectionsFiltered,w as Show,pt as __namedExportsOrder,ht as default};
