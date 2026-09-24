import{j as t,r as p,I as j}from"./iframe-mmN7AxbW.js";import{C as R,a as v,w as O,b as _,r as M}from"./chapterStory-BJBxwv1h.js";import{B as b}from"./Band-DluAEd5K.js";import"./InstallCta-wq3hO1J-.js";import{S as B,M as P}from"./Scene-D2nzHScN.js";import{A as q,H as L}from"./Assemble-BfsBqw6B.js";import{K as D}from"./KeysTitle-ASBjWD5u.js";import{K as I}from"./KeysMark-wm56dPTz.js";import{C as m,h as U,c as $}from"./chapters-aeC6fZDy.js";import{T as G}from"./TabNavigation-B636rhG9.js";import{T as K,R as S}from"./tabs-2VIodLff.js";import"./preload-helper-PPVm8Dsz.js";import"./StatusChip-CSLqKHGq.js";import"./useRevealOnView-CpkDDsmJ.js";import"./motion-BaDhWFVg.js";import"./Dock-sH4aoIM4.js";import"./githubLinks-BfCtNl-2.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";/* empty css              */import"./Stage-BOcHwKLL.js";import"./keysGeometry-Dy-WEHSr.js";const H=()=>{},F=e=>S.find(a=>a.id===e)?.label??e,g=S.length,z=["no","one","two","three","four","five","six","seven","eight"],k=e=>z[e]??String(e),A=e=>{const a=k(e);return a.charAt(0).toUpperCase()+a.slice(1)},i=K.filter(e=>e.railHidden).map(e=>e.label),W=i.length>1?`${i.slice(0,-1).join(", ")} and ${i[i.length-1]}`:i[0]??"",N=p.createContext({hot:null,setHot:H}),Y=({children:e})=>{const[a,s]=p.useState(null),n=p.useMemo(()=>({hot:a,setHot:s}),[a]);return t.jsx(N.Provider,{value:n,children:e})};function C(e){const{hot:a,setHot:s}=p.useContext(N);return{isHot:a===e,handlers:{onPointerEnter:()=>s(e),onPointerLeave:()=>s(n=>n===e?null:n),onFocus:()=>s(e),onBlur:n=>{n.currentTarget.contains(n.relatedTarget)||s(r=>r===e?null:r)}}}}const V=({n:e,children:a})=>{const{isHot:s,handlers:n}=C(e);return t.jsx("div",{"data-guide-target":e,"data-hot":s||void 0,className:"ring-primary-highlight ring-offset-1 ring-offset-canvas transition-shadow duration-(--dur-instant) ease-(--ease-standard) data-hot:ring-2 [&+span]:transition-shadow [&+span]:duration-(--dur-instant) [&[data-hot]+span]:ring-4 [&[data-hot]+span]:ring-primary-highlight",...n,children:a})},J=({n:e,children:a})=>{const{isHot:s,handlers:n}=C(e);return t.jsx("span",{"data-guide-legend":e,"data-hot":s||void 0,className:"-mx-1.5 -my-0.5 block rounded px-1.5 py-0.5 transition-colors duration-(--dur-instant) ease-(--ease-standard) data-hot:bg-primary-light",...n,children:a})},Q=({active:e,onChange:a})=>t.jsx(G,{activeTab:e,onTabChange:a,onOpenCommandPalette:H}),X=()=>{const[e,a]=p.useState("home");return t.jsxs("div",{className:"flex flex-col gap-2",children:[t.jsx(P,{n:1,children:t.jsx(V,{n:1,children:t.jsx(Q,{active:e,onChange:a})})}),t.jsx("p",{className:"mt-1 h-5 text-xs leading-5 text-neutral-600","aria-live":"polite",children:t.jsxs("span",{className:"inline-block animate-rise-in",children:[t.jsx("span",{className:"font-medium text-neutral-900",children:F(e)})," is the active seat, so it is the one wearing its name."]},e)})]})},Z="flex items-center gap-3.5 py-2",ee="flex shrink-0 items-center justify-center rounded-lg",te=()=>t.jsx("div",{"aria-hidden":"true",children:t.jsx(q,{as:"ul",selector:"[data-guide-seat]",className:"flex flex-col",children:m.map(e=>{const a=e.id==="welcome";return t.jsx("li",{"data-guide-tile":!0,children:t.jsxs("span",{"data-guide-seat":e.title,className:Z,children:[t.jsx("span",{"data-overture-glyph":!0,className:`${ee} h-10 w-10 ${a?"bg-primary-light text-primary-text":"text-neutral-500"}`,children:t.jsx(j,{type:e.icon,size:"lg"})}),t.jsx("span",{className:`text-xl leading-6 tracking-tight ${a?"font-semibold text-neutral-900":"text-neutral-700"}`,children:e.title})]})},e.id)})})}),x=$("welcome"),ae=t.jsx("p",{className:"text-base leading-7 text-pretty text-neutral-800",children:"Okta Unbound is a side panel that sits beside the Okta admin console. It answers the questions the console makes you work for: why does this person have this, who breaks if I change it, prove it, and now fix it. You never leave the page you are on."}),ne=()=>t.jsxs("div",{className:"flex flex-col gap-8",children:[t.jsx("p",{className:"guide-eyebrow text-sm text-neutral-600",children:"Okta Unbound user guide"}),t.jsx(L,{size:"hero",text:x.title,subline:x.subline}),t.jsxs("p",{className:"guide-subline flex items-center gap-1.5 text-sm text-neutral-500",style:{"--guide-i":3},children:["Scroll to begin",t.jsx(j,{type:"chevron-down",size:"sm",className:"shrink-0"})]})]}),se={hero:!0,opening:{greeting:t.jsx(ne,{}),card:t.jsx(D,{text:x.headline,passage:ae}),mark:t.jsx(I,{})},beats:[{caption:`Every section of the panel, and every page of this guide. ${A(g)} of them have a seat on the rail.`,hold:4},{caption:"Scroll. They move to the edge and stay with you."}],render:()=>t.jsx(te,{})},oe=m.filter(e=>e.id!=="welcome"),E="max-w-(--guide-prose-w) text-sm leading-relaxed text-neutral-700",re="max-w-(--guide-prose-w) text-base leading-7 text-neutral-800",ie="press-subtle -mx-3 flex flex-col gap-0.5 rounded-md px-3 py-2 no-underline transition-colors duration-(--dur-instant) hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",w=()=>t.jsxs(R,{id:"welcome",show:se,children:[t.jsxs(b,{title:"Open the Panel",children:[t.jsxs("p",{className:re,children:["Pin the extension from the puzzle-piece menu in the toolbar, then click its icon. Or right-click anywhere on an Okta admin page and choose ",t.jsx("strong",{children:"Open Okta Unbound"}),"."]}),t.jsx("p",{className:E,children:"The panel reads the Okta admin tab in front of it and stays open while you move between tabs in that window. It works through the session you are already signed in with, so there is no token to paste and nothing of yours is stored."}),null]}),t.jsx(Y,{children:t.jsx(B,{title:"Navigating Unbound",intro:"The panel's own rail, live. Click a seat to move the selection, or rest on the number to see what it points at.",legend:[{text:t.jsxs(J,{n:1,children:[A(g)," seats, in the order the panel keeps them. The seat you are on unfurls its name and the rest stay down to a glyph, so all ",k(g)," still fit when you drag the panel in to 360px."]})}],outro:t.jsxs(t.Fragment,{children:["The button at the trailing end prints the chord your own keyboard listens for, Command K on a Mac and Ctrl K everywhere else. It opens the command palette, which is how you reach ",W,", the sections that keep no seat."]}),children:t.jsx(X,{})})}),t.jsxs(b,{title:"Contents",children:[t.jsx("p",{className:E,children:"One chapter per section, in the order the rail seats them, each built around the one question that section answers. Open any of them now, or take them in order from the contents."}),t.jsx("ol",{className:"flex max-w-(--guide-prose-w) flex-col gap-1",children:oe.map(e=>t.jsx("li",{children:t.jsxs("a",{href:U(e.id),className:ie,children:[t.jsx("span",{className:"text-sm font-medium text-primary",children:e.title}),t.jsx("span",{className:"text-sm leading-snug text-neutral-600",children:e.question})]})},e.id))})]})]});try{w.displayName="welcome",w.__docgenInfo={description:"",displayName:"welcome",filePath:"/home/runner/work/Okta-Unbound-Dev/Okta-Unbound-Dev/src/guide/chapters/welcome.tsx",methods:[],props:{},tags:{}}}catch{}const{expect:o,userEvent:u,within:T}=__STORYBOOK_MODULE_TEST__,Ce={title:"Guide/Chapters/welcome",component:w,decorators:[O("welcome")],parameters:v,parameters:{docs:{description:{component:"The Welcome chapter, in the shell, rail on Welcome."}}}},l={},c={parameters:{...v,motion:"on"},play:async({canvasElement:e})=>{await _(e);const a=e.querySelector("[data-show-state]");if(!a)throw new Error("No show on the page");await o(a).toHaveAttribute("data-show-state","done"),await o(a.querySelectorAll("[data-guide-seat]")).toHaveLength(m.length);for(const s of m){const n=a.querySelector(`[data-guide-seat="${s.title}"]`);await o(n).toBeInTheDocument(),await o(n?.parentElement).toHaveTextContent(s.title)}}},d={play:async({canvasElement:e})=>{const a=M(e),s=await a.findByRole("tablist",{name:"Main sections"});await o(a.queryByRole("tablist",{name:"Main sections, off a Mac"})).toBeNull();const n=T(s).getByRole("tab",{name:"Groups"});await u.click(n),await o(n).toHaveAttribute("aria-selected","true"),await o(T(s).getByRole("tab",{name:"Home"})).toHaveAttribute("aria-selected","false"),await o(a.getByText("is the active seat",{exact:!1})).toHaveTextContent("Groups is the active seat, so it is the one wearing its name.")}},h={parameters:{...v,motion:"on"},play:async({canvasElement:e})=>{const a=e.querySelector('[data-testid="guide-body"] section[aria-labelledby="scene-navigating-unbound"]');if(!a)throw new Error("Missing the rail scene");const s=y=>{const f=a.querySelector(y);if(!f)throw new Error(`Missing ${y}`);return f},n=s('[data-guide-target="1"]'),r=s('[data-guide-legend="1"]');await u.hover(n),await o(r).toHaveAttribute("data-hot","true"),await u.unhover(n),await o(r).not.toHaveAttribute("data-hot"),await u.hover(r),await o(n).toHaveAttribute("data-hot","true"),await u.unhover(r),await o(n).not.toHaveAttribute("data-hot")}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"{}",...l.parameters?.docs?.source},description:{story:"The chapter as a reader sees it, the show already on its still.",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await awaitShow(canvasElement);
    const stage = canvasElement.querySelector<HTMLElement>('[data-show-state]');
    if (!stage) throw new Error('No show on the page');
    await expect(stage).toHaveAttribute('data-show-state', 'done');
    await expect(stage.querySelectorAll('[data-guide-seat]')).toHaveLength(CHAPTERS.length);
    for (const def of CHAPTERS) {
      const tile = stage.querySelector(\`[data-guide-seat="\${def.title}"]\`);
      await expect(tile).toBeInTheDocument();
      await expect(tile?.parentElement).toHaveTextContent(def.title);
    }
  }
}`,...c.parameters?.docs?.source},description:{story:`The overture, with motion on: the headline's words arrive, then every
chapter lands under it as a tile, one at a time. The play waits for the
show to finish so axe sees settled pixels, then reads the still, which is
also the contract with the dock: one \`data-guide-seat\` per chapter, named
by its title, because that is what \`Dock.formFromRail\` flies from on the
reader's first scroll.`,...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = readerCanvas(canvasElement);
    const rail = await canvas.findByRole('tablist', {
      name: 'Main sections'
    });
    await expect(canvas.queryByRole('tablist', {
      name: 'Main sections, off a Mac'
    })).toBeNull();
    const groups = within(rail).getByRole('tab', {
      name: 'Groups'
    });
    await userEvent.click(groups);
    await expect(groups).toHaveAttribute('aria-selected', 'true');
    await expect(within(rail).getByRole('tab', {
      name: 'Home'
    })).toHaveAttribute('aria-selected', 'false');
    await expect(canvas.getByText('is the active seat', {
      exact: false
    })).toHaveTextContent('Groups is the active seat, so it is the one wearing its name.');
  }
}`,...d.parameters?.docs?.source},description:{story:`Clicking a seat moves the selection and the readout under the rail names the
new seat. One rail, because the chord on its palette button is the one this
reader's keyboard listens for, so there is no second strip to keep in step.`,...d.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    ...CHAPTER_PARAMETERS,
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const scene = canvasElement.querySelector('[data-testid="guide-body"] section[aria-labelledby="scene-navigating-unbound"]');
    if (!scene) throw new Error('Missing the rail scene');
    const find = (selector: string): Element => {
      const hit = scene.querySelector(selector);
      if (!hit) throw new Error(\`Missing \${selector}\`);
      return hit;
    };
    const target = find('[data-guide-target="1"]');
    const sentence = find('[data-guide-legend="1"]');
    await userEvent.hover(target);
    await expect(sentence).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(target);
    await expect(sentence).not.toHaveAttribute('data-hot');
    await userEvent.hover(sentence);
    await expect(target).toHaveAttribute('data-hot', 'true');
    await userEvent.unhover(sentence);
    await expect(target).not.toHaveAttribute('data-hot');
  }
}`,...h.parameters?.docs?.source},description:{story:`The marker-to-legend tie, with motion on so the ring and tint ease in.
Resting on the rail lights its sentence; resting on the sentence rings the
rail. Leaving clears both.`,...h.parameters?.docs?.description}}};const Re=["Default","Overture","SeatClicked","MarkerTied"];export{l as Default,h as MarkerTied,c as Overture,d as SeatClicked,Re as __namedExportsOrder,Ce as default};
