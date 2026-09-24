import{r as d,j as g}from"./iframe-mmN7AxbW.js";import{W as p}from"./WelcomeView-NY3FfK9P.js";import"./preload-helper-PPVm8Dsz.js";const{expect:n,fn:l,userEvent:y,within:r}=__STORYBOOK_MODULE_TEST__,m=900,x={title:"Sidepanel/Welcome/WelcomeView",component:p,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Shown instead of the shell until the reader presses one of its two buttons. Pure render: `useWelcomeGate` decides whether it shows and records the press. The line at the foot has exactly two states, driven by `connectionStatus` and `oktaOrigin`: not connected, or connected to a named hostname."}}},argTypes:{connectionStatus:{description:"Whether the panel has a live Okta tab. Only `connected` names a host."},oktaOrigin:{description:"Origin of the connected org. Its hostname is parsed with the URL API."},onOpenGuide:{description:'Pressed "Open the user guide".'},onDismiss:{description:'Pressed "Start using it".'}},args:{connectionStatus:"connected",oktaOrigin:"https://example.okta.com",onOpenGuide:l(),onDismiss:l()}},o={play:async({args:t,canvasElement:e})=>{const a=r(e);await n(a.getByText("Connected to example.okta.com. You're set.")).toBeVisible(),await y.click(a.getByRole("button",{name:"Start using it"})),await n(t.onDismiss).toHaveBeenCalledTimes(1),await n(t.onOpenGuide).not.toHaveBeenCalled()}},s={args:{connectionStatus:"connecting",oktaOrigin:null},play:async({canvasElement:t})=>{const e=r(t);await n(e.getByText("Open an Okta admin tab to connect.")).toBeVisible()}},c={parameters:{motion:"on"},play:async({canvasElement:t})=>{const e=r(t);await n(e.getByRole("heading",{name:"Welcome to Okta Unbound"})).toBeVisible(),await n(e.getByText("Connected to example.okta.com. You're set.")).toBeVisible()}},i={parameters:{motion:"on"},args:{connectionStatus:"connecting",oktaOrigin:null},render:function(e){const[a,u]=d.useState(!1);return d.useEffect(()=>{const h=setTimeout(()=>u(!0),m);return()=>clearTimeout(h)},[]),g.jsx(p,{...e,connectionStatus:a?"connected":e.connectionStatus,oktaOrigin:a?"https://example.okta.com":e.oktaOrigin})},play:async({canvasElement:t})=>{const e=r(t);await n(e.getByText("Open an Okta admin tab to connect.")).toBeVisible(),await n(await e.findByText("Connected to example.okta.com. You're set.",void 0,{timeout:m*4})).toBeVisible()}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Connected to example.okta.com. You're set.")).toBeVisible();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Start using it'
    }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(args.onOpenGuide).not.toHaveBeenCalled();
  }
}`,...o.parameters?.docs?.source},description:{story:'A live Okta tab: the foot names the org. "Start using it" reports the dismissal.',...o.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    connectionStatus: 'connecting',
    oktaOrigin: null
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Open an Okta admin tab to connect.')).toBeVisible();
  }
}`,...s.parameters?.docs?.source},description:{story:"No Okta tab yet: the foot says what to open.",...s.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', {
      name: 'Welcome to Okta Unbound'
    })).toBeVisible();
    await expect(canvas.getByText("Connected to example.okta.com. You're set.")).toBeVisible();
  }
}`,...c.parameters?.docs?.source},description:{story:`The arrival, with motion on: the icon's disc settles from small, then the
heading, sentence, buttons and connection line rise in one after another.
Stories run motion-off by default, so this is the one place the cascade
plays. The assertion is the same as \`Connected\`; the order is the subject.`,...c.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  parameters: {
    motion: 'on'
  },
  args: {
    connectionStatus: 'connecting',
    oktaOrigin: null
  },
  render: function ConnectsHarness(args) {
    const [connected, setConnected] = useState(false);
    useEffect(() => {
      const timer = setTimeout(() => setConnected(true), CONNECT_AFTER);
      return () => clearTimeout(timer);
    }, []);
    return <WelcomeView {...args} connectionStatus={connected ? 'connected' : args.connectionStatus} oktaOrigin={connected ? 'https://example.okta.com' : args.oktaOrigin} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Open an Okta admin tab to connect.')).toBeVisible();
    await expect(await canvas.findByText("Connected to example.okta.com. You're set.", undefined, {
      timeout: CONNECT_AFTER * 4
    })).toBeVisible();
  }
}`,...i.parameters?.docs?.source},description:{story:`The panel connects while the welcome is up. Starts with no Okta tab, then
flips to a connected org one beat later: the dot fills and grows on the affirm
curve, and the new line rises in where the old one stood. Motion on, so the
change is visible rather than a cut.`,...i.parameters?.docs?.description}}};const k=["Connected","NotConnected","Arrival","Connects"];export{c as Arrival,o as Connected,i as Connects,s as NotConnected,k as __namedExportsOrder,x as default};
