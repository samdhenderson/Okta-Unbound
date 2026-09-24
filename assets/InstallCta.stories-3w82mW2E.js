import{I as i}from"./InstallCta-wq3hO1J-.js";/* empty css              */import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./githubLinks-BfCtNl-2.js";const{expect:n,within:s}=__STORYBOOK_MODULE_TEST__,h={title:"Guide/Shell/InstallCta",component:i,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"The hosted guide's install link, in both the shapes it is used in. Neither\nstory sets the host flag: the component is flag-free, and its two call sites\ndecide whether it renders at all (`guide/host`)."}}}},e={args:{variant:"rail"},play:async({canvasElement:a})=>{const o=s(a).getByRole("link",{name:/Chrome Web Store/});await n(new URL(o.getAttribute("href")??"").hostname).toBe("chromewebstore.google.com"),await n(o).toHaveAttribute("rel","noopener noreferrer")}},t={args:{variant:"band"},play:async({canvasElement:a})=>{const r=s(a);await n(r.getByRole("link",{name:/Chrome Web Store/})).toHaveAttribute("target","_blank")}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'rail'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', {
      name: /Chrome Web Store/
    });
    await expect(new URL(link.getAttribute('href') ?? '').hostname).toBe('chromewebstore.google.com');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
}`,...e.parameters?.docs?.source},description:{story:"The dock's foot.",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'band'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', {
      name: /Chrome Web Store/
    })).toHaveAttribute('target', '_blank');
  }
}`,...t.parameters?.docs?.source},description:{story:"Inside a chapter's section, at reading size.",...t.parameters?.docs?.description}}};const g=["Rail","Band"];export{t as Band,e as Rail,g as __namedExportsOrder,h as default};
