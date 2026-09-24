import{r as N,j as t,F as L}from"./iframe-mmN7AxbW.js";import{B as I}from"./Band-DluAEd5K.js";import{C as D,F as M,a as j,w as G,b as U,r as T}from"./chapterStory-BJBxwv1h.js";import{a as F,S as $,s as k,C as H}from"./StatusChip-CSLqKHGq.js";import{H as K,A as W}from"./Assemble-BfsBqw6B.js";import{u as v}from"./useCountUp-DBR4-HMR.js";import{c as R,h as X,C as _}from"./chapters-aeC6fZDy.js";import{c as Y,E as q}from"./InstallCta-wq3hO1J-.js";import{G as z}from"./githubLinks-BfCtNl-2.js";import"./preload-helper-PPVm8Dsz.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./sceneRegistry-BbOWuDWO.js";import"./Dock-sH4aoIM4.js";import"./useStaggerReveal-CSztixYY.js";/* empty css              */import"./Stage-BOcHwKLL.js";const J=["in-progress","unresolved","capped"];function Q(){const a=[];for(const s of _){const n=k(s.id);n&&n.status!=="shipped"&&a.push({chapter:s,standing:n})}return a}function V(){return _.filter(a=>k(a.id)!==null).length}const A="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700",Z="rounded-sm font-medium text-primary-text underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",E=R("roadmap"),B=()=>{const a=Q(),s=V(),n=v(a.length).value,r=v(s).value,p=r-n,l=o=>a.filter(d=>d.standing.status===o).length,c={"in-progress":v(l("in-progress")).value,unresolved:v(l("unresolved")).value,capped:v(l("capped")).value},[g,h]=N.useState(null),[u,i]=N.useState(null),S=g??u;return t.jsxs(D,{id:"roadmap",show:null,children:[t.jsxs("div",{className:"flex min-w-0 flex-col gap-6",children:[t.jsx("p",{className:"guide-eyebrow text-sm text-neutral-600",children:E.title}),t.jsx(K,{id:"show-roadmap",text:E.headline,subline:E.subline})]}),t.jsxs(I,{title:"Still Moving",children:[t.jsx("p",{className:A,children:"Every chapter carries a chip saying how settled its subject is. The chapters below are the ones that chip does not call shipped, in the order the guide covers them, each with the reason it is still moving. To move something on this list, open an issue on it: say what you want it to do, and why."}),t.jsxs("div",{className:"flex flex-col gap-4",children:[t.jsxs("p",{className:"text-sm text-neutral-700 tabular-nums",children:[t.jsx("span",{className:"font-semibold text-neutral-900",children:n})," of ",r," ","chapters are still moving. The other ",p," are shipped and do not appear here."]}),t.jsx("ul",{className:"flex flex-wrap gap-2","aria-label":"Highlight chapters by status",children:J.map(o=>{if(l(o)===0)return null;const d=c[o],C=F[o];return t.jsx("li",{className:"inline-flex rounded-md ring-primary-highlight transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-lit:ring-2","data-lit":S===o?"":void 0,"data-testid":"roadmap-key-pill","data-status":o,onMouseEnter:()=>h(o),onMouseLeave:()=>h(null),onFocus:()=>h(o),onBlur:()=>h(null),children:t.jsxs(L,{active:u===o,onClick:()=>i(O=>O===o?null:o),title:`Keep the ${C.toLowerCase()} chapters highlighted`,children:[C," ",t.jsx("span",{className:"tabular-nums",children:d})]})},o)})})]}),t.jsx("div",{"data-testid":"roadmap-items",children:t.jsx(W,{as:"ul",className:"flex flex-col gap-2 border-l border-neutral-200",children:a.map(({chapter:o,standing:d})=>t.jsxs("li",{className:"-ml-px flex flex-col gap-2 rounded-r-md border-l-2 border-transparent py-3 pr-4 pl-5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-lit:border-primary data-lit:bg-neutral-50","data-testid":"roadmap-item","data-status":d.status,"data-lit":S===d.status?"":void 0,onMouseEnter:()=>h(d.status),onMouseLeave:()=>h(null),onFocus:()=>h(d.status),onBlur:()=>h(null),children:[t.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[t.jsx("h4",{className:"text-base font-semibold tracking-tight text-neutral-900",children:t.jsx("a",{href:X(o.id),className:"rounded-sm underline-offset-2 transition-colors duration-(--dur-instant) ease-(--ease-standard) hover:text-primary-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",children:o.title})}),t.jsx($,{status:d.status})]}),d.note?t.jsx("p",{className:A,children:d.note}):null,t.jsx("p",{className:"text-sm",children:t.jsx(M,{href:Y(o),children:"Weigh in"})})]},o.id))})})]}),t.jsxs(I,{title:"Held Back",children:[t.jsx("p",{className:A,children:"Two more parts are built and switched off: the API Explorer, and the SAML assertion reader it opens. A feature flag holds them back until they are ready, so the rail and the command palette do not offer them yet."}),t.jsxs("p",{className:A,children:["The code, the open issues and every release live at"," ",t.jsx("a",{href:z,...q,className:Z,children:"the project on GitHub"}),"."]})]})]})};try{B.displayName="roadmap",B.__docgenInfo={description:"",displayName:"roadmap",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/roadmap.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:e,userEvent:m,within:P}=__STORYBOOK_MODULE_TEST__,ft={title:"Guide/Chapters/roadmap",component:B,decorators:[G("roadmap")],parameters:j,parameters:{docs:{description:{component:"The closing chapter, in the shell, rail on the last row."}}}},f={},x={parameters:{...j,motion:"on"},play:async({canvasElement:a})=>{await U(a);const s=T(a),n=R("roadmap"),r=s.getByRole("heading",{level:2,name:n.headline});await e(r).toHaveAttribute("id","show-roadmap"),await e(s.getByText(n.subline)).toBeInTheDocument();const p=Object.values(H).filter(g=>g.status!=="shipped").length,l=Object.keys(H).length,c=s.getByText(/chapters are still moving/);await e(c).toHaveTextContent(`${p} of ${l} chapters are still moving. The other ${l-p} are shipped`)}},w={play:async({canvasElement:a})=>{const s=T(a),n=Object.values(H).filter(c=>c.status!=="shipped"),r=await s.findAllByTestId("roadmap-item");await e(r).toHaveLength(n.length);const p=s.getAllByRole("link",{name:/Weigh in/});await e(p).toHaveLength(n.length);const l=s.getAllByTestId("guide-status-chip");await e(l).toHaveLength(n.length);for(const c of r)await e(c.tagName).toBe("LI"),await e(P(c).getByTestId("guide-status-chip")).toBeInTheDocument()}},y={play:async({canvasElement:a})=>{const s=T(a),n=s.getByRole("heading",{level:3,name:"Held Back"});await e(n).toBeInTheDocument(),await e(s.getByText(/API Explorer/)).toHaveTextContent(/the rail and the command palette do not offer them yet/)}},b={parameters:{...j,motion:"on"},play:async({canvasElement:a})=>{const s=T(a),n=await s.findAllByTestId("roadmap-item"),r=s.getAllByTestId("roadmap-key-pill"),p=r[0].getAttribute("data-status"),l=n.filter(i=>i.getAttribute("data-status")===p),c=n.filter(i=>i.getAttribute("data-status")!==p);await e(l.length).toBeGreaterThan(0),await m.hover(r[0]);for(const i of l)await e(i).toHaveAttribute("data-lit");for(const i of c)await e(i).not.toHaveAttribute("data-lit");await m.unhover(r[0]);for(const i of l)await e(i).not.toHaveAttribute("data-lit");await m.hover(c[0]);const g=c[0].getAttribute("data-status"),h=r.find(i=>i.getAttribute("data-status")===g);await e(h).toHaveAttribute("data-lit"),await e(r[0]).not.toHaveAttribute("data-lit"),await m.unhover(c[0]);const u=P(r[0]).getByRole("button");await m.click(u),await m.unhover(r[0]),await e(u).toHaveAttribute("aria-pressed","true");for(const i of l)await e(i).toHaveAttribute("data-lit");await m.click(u),await e(u).toHaveAttribute("aria-pressed","false")}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:"{}",...f.parameters?.docs?.source},description:{story:"The chapter as a reader sees it.",...f.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const canvas = readerCanvas(canvasElement);
    const def = chapterById('roadmap');
    const heading = canvas.getByRole('heading', {
      level: 2,
      name: def.headline
    });
    await expect(heading).toHaveAttribute('id', 'show-roadmap');
    await expect(canvas.getByText(def.subline)).toBeInTheDocument();
    const expected = Object.values(CHAPTER_STANDING).filter(s => s.status !== 'shipped').length;
    const total = Object.keys(CHAPTER_STANDING).length;
    const line = canvas.getByText(/chapters are still moving/);
    await expect(line).toHaveTextContent(\`\${expected} of \${total} chapters are still moving. The other \${total - expected} are shipped\`);
  }
}`,...x.parameters?.docs?.source},description:{story:"The type-only opening, motion on. This chapter has no stage, so `awaitShow`\nresolves at once; the still is the settled opening: the registry headline\nunder the eyebrow, and the count line landed on its real figures.",...x.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const open = Object.values(CHAPTER_STANDING).filter(s => s.status !== 'shipped');
    const entries = await canvas.findAllByTestId('roadmap-item');
    await expect(entries).toHaveLength(open.length);
    const links = canvas.getAllByRole('link', {
      name: /Weigh in/
    });
    await expect(links).toHaveLength(open.length);
    const chips = canvas.getAllByTestId('guide-status-chip');
    await expect(chips).toHaveLength(open.length);
    for (const entry of entries) {
      await expect(entry.tagName).toBe('LI');
      await expect(within(entry).getByTestId('guide-status-chip')).toBeInTheDocument();
    }
  }
}`,...w.parameters?.docs?.source},description:{story:`One list entry per registry entry that is not shipped, each carrying the
chapter's own status chip and a "Weigh in" link. The entries are one list,
on the page's canvas, with no card of their own.`,...w.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 3,
      name: 'Held Back'
    });
    await expect(heading).toBeInTheDocument();
    await expect(canvas.getByText(/API Explorer/)).toHaveTextContent(/the rail and the command palette do not offer them yet/);
  }
}`,...y.parameters?.docs?.source},description:{story:"What is built but switched off, said once, with no file path to chase.",...y.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const entries: HTMLElement[] = await canvas.findAllByTestId('roadmap-item');
    const pills: HTMLElement[] = canvas.getAllByTestId('roadmap-key-pill');
    const status = pills[0].getAttribute('data-status');
    const matching = entries.filter(s => s.getAttribute('data-status') === status);
    const others = entries.filter(s => s.getAttribute('data-status') !== status);
    await expect(matching.length).toBeGreaterThan(0);

    // Status to entries.
    await userEvent.hover(pills[0]);
    for (const s of matching) await expect(s).toHaveAttribute('data-lit');
    for (const s of others) await expect(s).not.toHaveAttribute('data-lit');
    await userEvent.unhover(pills[0]);
    for (const s of matching) await expect(s).not.toHaveAttribute('data-lit');

    // Entry to status.
    await userEvent.hover(others[0]);
    const otherStatus = others[0].getAttribute('data-status');
    const otherPill = pills.find(p => p.getAttribute('data-status') === otherStatus);
    await expect(otherPill).toHaveAttribute('data-lit');
    await expect(pills[0]).not.toHaveAttribute('data-lit');
    await userEvent.unhover(others[0]);

    // A click holds it.
    const button = within(pills[0]).getByRole('button');
    await userEvent.click(button);
    await userEvent.unhover(pills[0]);
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    for (const s of matching) await expect(s).toHaveAttribute('data-lit');
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  }
}`,...b.parameters?.docs?.source},description:{story:`The status key and the entries light each other. Hover a status and every
entry in that state lights; hover an entry and its status lights; a click
holds the light. Motion on, so the entries' cascade and the colour steps run
as a reader sees them.`,...b.parameters?.docs?.description}}};const xt=["Default","Show","OneEntryPerOpenChapter","HeldBack","KeyAndEntriesLightEachOther"];export{f as Default,y as HeldBack,b as KeyAndEntriesLightEachOther,w as OneEntryPerOpenChapter,x as Show,xt as __namedExportsOrder,ft as default};
