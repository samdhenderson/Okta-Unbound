import{j as c}from"./iframe-mmN7AxbW.js";import{D as m}from"./Dock-sH4aoIM4.js";import{C as h}from"./chapters-aeC6fZDy.js";/* empty css              */import"./preload-helper-PPVm8Dsz.js";import"./githubLinks-BfCtNl-2.js";import"./InstallCta-wq3hO1J-.js";import"./motion-BaDhWFVg.js";import"./useStaggerReveal-CSztixYY.js";import"./sceneRegistry-BbOWuDWO.js";const{expect:a,userEvent:p,within:e}=__STORYBOOK_MODULE_TEST__,f={title:"Guide/Shell/Dock",component:m,parameters:{layout:"fullscreen",docs:{description:{component:`The contents as a dock: one row per chapter with the glyph the panel's rail
gives that section, the current one marked. Wide, it is a white sidebar the
full height of the window, closed by one rule, the shape the Okta admin
console's own nav has; narrow, a strip along the bottom edge with the names
on hover or focus.`}}},args:{chapter:"groups"},decorators:[t=>c.jsx("div",{className:"flex min-h-screen bg-canvas",children:c.jsx("div",{className:"lg:h-screen lg:w-72 lg:shrink-0",children:c.jsx(t,{})})})]},o={play:async({canvasElement:t})=>{const n=e(t).getByRole("navigation",{name:"Contents"}),i=e(n).getByRole("link",{name:"Groups"});await a(i).toHaveAttribute("aria-current","page"),await a(e(n).getAllByRole("link")).toHaveLength(h.length+1),await a(e(n).getByRole("link",{name:"Rules"})).toHaveAttribute("href","#/rules")}},s={args:{install:!0},play:async({canvasElement:t})=>{const n=e(t).getByRole("navigation",{name:"Contents"});await a(e(n).getAllByRole("link")).toHaveLength(h.length+2);const i=e(n).getByRole("link",{name:/Chrome Web Store/});await a(new URL(i.getAttribute("href")??"").hostname).toBe("chromewebstore.google.com")}},r={play:async({canvasElement:t})=>{const n=e(t).getByRole("navigation",{name:"Contents"});await p.tab(),await a(e(n).getByRole("link",{name:"Welcome"})).toHaveFocus()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', {
      name: 'Contents'
    });
    const current = within(nav).getByRole('link', {
      name: 'Groups'
    });
    await expect(current).toHaveAttribute('aria-current', 'page');
    // One row per chapter, and the source link at the foot.
    await expect(within(nav).getAllByRole('link')).toHaveLength(CHAPTERS.length + 1);
    await expect(within(nav).getByRole('link', {
      name: 'Rules'
    })).toHaveAttribute('href', '#/rules');
  }
}`,...o.parameters?.docs?.source},description:{story:"The current chapter is marked and every chapter is reachable by name.",...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    install: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', {
      name: 'Contents'
    });
    // One row per chapter, the source link, and the store link.
    await expect(within(nav).getAllByRole('link')).toHaveLength(CHAPTERS.length + 2);
    const store = within(nav).getByRole('link', {
      name: /Chrome Web Store/
    });
    await expect(new URL(store.getAttribute('href') ?? '').hostname).toBe('chromewebstore.google.com');
  }
}`,...s.parameters?.docs?.source},description:{story:`The hosted build's foot: the install link above the source link. The flag is
unset in Storybook, so this is the only place the hosted layout is seen, and
the only place axe reviews it.`,...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', {
      name: 'Contents'
    });
    await userEvent.tab();
    await expect(within(nav).getByRole('link', {
      name: 'Welcome'
    })).toHaveFocus();
  }
}`,...r.parameters?.docs?.source},description:{story:"Tabbing into the dock opens every label.",...r.parameters?.docs?.description}}};const x=["Default","Hosted","Focused"];export{o as Default,r as Focused,s as Hosted,x as __namedExportsOrder,f as default};
