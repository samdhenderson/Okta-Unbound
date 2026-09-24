import{j as i}from"./iframe-mmN7AxbW.js";import{K as g}from"./KeysTitle-ASBjWD5u.js";import{N as c,C as f,g as w,h as k}from"./keysGeometry-Dy-WEHSr.js";import{c as v}from"./chapters-aeC6fZDy.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./motion-BaDhWFVg.js";const{expect:e}=__STORYBOOK_MODULE_TEST__,d=v("welcome").headline,x=i.jsx("p",{className:"text-base leading-7 text-pretty text-neutral-800",children:"Okta Unbound is a side panel that sits beside the Okta admin console. It answers the questions the console makes you work for, without leaving the page you are on."}),H={component:g,title:"Guide/Show/KeysTitle",args:{text:d,passage:x},decorators:[t=>i.jsx("div",{className:"guide-show guide-show-card flex flex-col justify-center bg-canvas px-10",children:i.jsx(t,{})})],parameters:{docs:{description:{component:`The overture's title card: the mark as 18 keys, with the sentence beside it.

The keys arrive as a track descending the right of the logo's place, taken up
one at a time by the right spoke as the circle rolls; the sentence lands; then
the circle sheds its bottom spoke as a tie on each step and the track runs off
to the left, taking the first half of the sentence with it. What is left is one
word, and the passage arrives under it. The keys themselves are 18 changing
formation and nothing else: none is created, destroyed, or faded.

Geometry and timing come from the design handoff in
\`designDocs/Animation Title\`, and \`keysGeometry.ts\` is the transcription.

It is a wide screen treatment, so \`guide.css\` shows it only from \`64rem\`. On
a narrower canvas the card is absent by design and the overture's heading is
plain display type instead.`}}}},n={play:async({canvasElement:t})=>{const h=t.querySelectorAll(".guide-keys-title path");await e(h).toHaveLength(c);const l=new Set;for(const a of h){const r=a.getAttribute("transform");if(!r)throw new Error("A key was never posed");const[,m,y]=/^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(r)??[],[,u]=/rotate\((-?[\d.]+)\)/.exec(r)??[];await e(Math.hypot(Number(m)-f,Number(y)-w)).toBeCloseTo(k,0),l.add(Math.round(Number(u)))}await e(l.size).toBe(c);const o=t.querySelectorAll(".guide-keys-title-half");await e(o).toHaveLength(2);const p=Array.from(o,a=>a.textContent).join(" ");await e(p).toBe(d);for(const a of o)await e(a).toHaveAttribute("opacity","1.000");await e(t.querySelector(".guide-card")).toHaveAttribute("data-passage","in"),await e(t.querySelector(".guide-card-passage")).toHaveTextContent("sits beside the Okta admin console")}},s={parameters:{motion:"on"},play:async({canvasElement:t})=>{await e(t.querySelectorAll(".guide-keys-title path")).toHaveLength(c)}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const keys = canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-title path');
    await expect(keys).toHaveLength(N);

    // Every key is one spoke of the finished mark: at the spoke radius from the
    // logo's settled centre, and no two on the same bearing.
    const bearings = new Set<number>();
    for (const key of keys) {
      const transform = key.getAttribute('transform');
      if (!transform) throw new Error('A key was never posed');
      const [, x, y] = /^translate\\((-?[\\d.]+) (-?[\\d.]+)\\)/.exec(transform) ?? [];
      const [, deg] = /rotate\\((-?[\\d.]+)\\)/.exec(transform) ?? [];
      await expect(Math.hypot(Number(x) - CX1, Number(y) - CY)).toBeCloseTo(R, 0);
      bearings.add(Math.round(Number(deg)));
    }
    await expect(bearings.size).toBe(N);

    // Both halves of the sentence are up, and between them they are the whole of
    // it: the split is a setting, never a rewrite.
    const halves = canvasElement.querySelectorAll('.guide-keys-title-half');
    await expect(halves).toHaveLength(2);
    const spoken = Array.from(halves, half => half.textContent).join(' ');
    await expect(spoken).toBe(SENTENCE);
    for (const half of halves) await expect(half).toHaveAttribute('opacity', '1.000');
    await expect(canvasElement.querySelector('.guide-card')).toHaveAttribute('data-passage', 'in');
    await expect(canvasElement.querySelector('.guide-card-passage')).toHaveTextContent('sits beside the Okta admin console');
  }
}`,...n.parameters?.docs?.source},description:{story:`Motion off: the settled logo with the whole sentence beside it and the passage
already under it. This is the still, the first paint and the reduced-motion
pose. It is the title rather than the resolution on purpose: a reader who gets
no motion should see the mark and its whole name, not the one word that only
reads because the rest of it left.`,...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-title path')).toHaveLength(N);
  }
}`,...s.parameters?.docs?.source},description:{story:`Motion on. The headless runner loads no motion scale, so the gate skips the
clock and this asserts the still too; watch it in the explorer, where the card
plays as soon as it is half in view, once, and holds where it resolves.`,...s.parameters?.docs?.description}}};const q=["Still","Plays"];export{s as Plays,n as Still,q as __namedExportsOrder,H as default};
