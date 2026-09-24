import{j as o}from"./iframe-mmN7AxbW.js";import{K as p}from"./KeysMark-wm56dPTz.js";import{N as r,C as u,g as y,h as g}from"./keysGeometry-Dy-WEHSr.js";import{c as w}from"./chapters-aeC6fZDy.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./motion-BaDhWFVg.js";const{expect:t}=__STORYBOOK_MODULE_TEST__,k=w("welcome").headline,N={component:p,title:"Guide/Show/KeysMark",decorators:[e=>o.jsxs("div",{className:"guide-show guide-show-card flex flex-col justify-center gap-6 bg-canvas px-6",style:{inlineSize:"390px"},children:[o.jsx(e,{}),o.jsx("h2",{className:"text-4xl font-semibold leading-none tracking-tight text-balance text-neutral-900",children:k})]})],parameters:{docs:{description:{component:`The overture's title where the card cannot go: the mark building itself above
the headline, on a phone.

\`KeysTitle\` is a landscape composition, the logo with the sentence set beside
it, and it is hidden below \`64rem\` because a narrow screen cannot hold it at a
legible size. This is what narrow gets instead. It is the card's own first
scene and nothing more: the same eighteen keys descending the same track and
taken up one at a time by the rolling circle, at the centre the logo settles
on. The slide left, the wordmark and the railroad all belonged to the
sentence, and the sentence is the plain display type underneath.

It draws no text, which is deliberate rather than incidental: the card once
shipped an \`IndexSizeError\` to every phone by measuring SVG text in a subtree
the browser was not drawing (\`KeysTitle.test.tsx\`). Nothing here measures
anything.

The decorator is the overture's own screen, headline included, so what the
explorer shows is the arrangement a reader gets and not the mark on its own.
The explorer's canvas is wide, so \`guide.css\` would hide it here; the
decorator's inline width is what puts it below the breakpoint, and an inline
width is also the only kind the headless runner can see
(\`docs/storybook-infra.md\`).`}}}},n={play:async({canvasElement:e})=>{const i=e.querySelectorAll(".guide-keys-mark path");await t(i).toHaveLength(r);const h=new Set;for(const d of i){const s=d.getAttribute("transform");if(!s)throw new Error("A key was never posed");const[,c,l]=/^translate\((-?[\d.]+) (-?[\d.]+)\)/.exec(s)??[],[,m]=/rotate\((-?[\d.]+)\)/.exec(s)??[];await t(Math.hypot(Number(c)-u,Number(l)-y)).toBeCloseTo(g,0),h.add(Math.round(Number(m)))}await t(h.size).toBe(r),await t(e.querySelector(".guide-keys-mark")).toHaveAttribute("aria-hidden","true"),await t(e.querySelector(".guide-keys-mark")?.textContent).toBe("")}},a={parameters:{motion:"on"},play:async({canvasElement:e})=>{await t(e.querySelectorAll(".guide-keys-mark path")).toHaveLength(r)}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const keys = canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-mark path');
    await expect(keys).toHaveLength(N);

    // Every key is one spoke of the finished mark: at the spoke radius from the
    // logo's centre, and no two on the same bearing.
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

    // It says nothing. The headline beside it is the sentence, and the mark is
    // hidden from the reader who is listening rather than looking.
    await expect(canvasElement.querySelector('.guide-keys-mark')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvasElement.querySelector('.guide-keys-mark')?.textContent).toBe('');
  }
}`,...n.parameters?.docs?.source},description:{story:`Motion off: the settled mark, which is both the first paint and the
reduced-motion pose. The finished picture is the logo, so a reader who gets no
motion gets the logo.`,...n.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.querySelectorAll<SVGPathElement>('.guide-keys-mark path')).toHaveLength(N);
  }
}`,...a.parameters?.docs?.source},description:{story:`Motion on. The headless runner loads no motion scale, so the gate skips the
clock and this asserts the still too; watch it in the explorer, where the mark
assembles as soon as it is half in view, once, and holds.`,...a.parameters?.docs?.description}}};const A=["Still","Plays"];export{a as Plays,n as Still,A as __namedExportsOrder,N as default};
