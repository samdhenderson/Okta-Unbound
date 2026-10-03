import{r as B,j as E}from"./iframe-Pee757m_.js";import{C as v}from"./ConciergeGreeting-Ci6otbaj.js";import{c as k}from"./concierge-CFpCju1p.js";import{p as x,g as R,c as T,a as f}from"./copy-DPkId50G.js";import"./preload-helper-PPVm8Dsz.js";import"./motion-DWPTjLhl.js";import"./verbIcons-BnCRhW9A.js";import"./GuideInvite-D_pp1wv2.js";import"./Orb-DQZsh7BJ.js";import"./RecommendationCard-DJVvo1S8.js";import"./then-JFpS9G1J.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:a,fn:d,userEvent:g,within:s}=__STORYBOOK_MODULE_TEST__,w={kind:"group",id:"00gFAKE0000000000001",name:"Engineering"},D={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"};function h(t,e=null){return{greeting:R(9),line:x(t,t!==null,e),settled:!0,cards:k(t).map((n,o)=>n.kind==="pin"?{key:`pin:${n.entity.id}`,card:n,text:`Pin ${n.entity.name}`,how:"Keeps it on Home until you unpin it. No request."}:{key:`${n.ask.verb}:${o}`,card:n,text:f(n.ask),how:T(n.ask,"One request.")})}}const y={ignore:'[aria-hidden="true"], script, style'},_={title:"Home/Concierge/ConciergeGreeting",component:v,tags:["autodocs"],parameters:{docs:{description:{component:"The top of Home: a greeting, where the reader is, three questions about the page, and for a new reader the invitation to the guide. The typed show plays once; with motion off it lands whole at once."}}},args:{concierge:h(w,1284),connected:!0,show:!1,onShowDone:d(),invite:!1,onOpenGuide:d(),onDismissInvite:d(),onChoose:d()}},i={play:async({args:t,canvasElement:e})=>{const n=s(e);await a(n.getByText("You’re on Engineering, a group of 1,284 members. What would you like to know?",y)).toBeInTheDocument();const o=s(n.getByRole("list",{name:"Suggested questions"}));await a(o.getAllByRole("listitem")).toHaveLength(3),await g.click(o.getByRole("button",{name:"Pin Engineering"})),await a(t.onChoose).toHaveBeenCalledWith({kind:"pin",entity:w}),await a(t.onShowDone).not.toHaveBeenCalled()}},r={args:{concierge:h(D)},play:async({canvasElement:t})=>{const e=s(t);await a(e.getByRole("button",{name:"Find users who share Joe Park’s…"})).toHaveAccessibleDescription("You pick the attribute; the value is Joe Park’s own.")}},c={args:{show:!0,invite:!0},play:async({args:t,canvasElement:e})=>{const n=s(e);await a(t.onShowDone).toHaveBeenCalledTimes(1),await a(n.getByRole("list",{name:"Suggested questions"})).toBeInTheDocument(),await a(n.getByText(/^New to Okta Unbound\?/)).toBeInTheDocument()}},u={args:{invite:!0},play:async({args:t,canvasElement:e})=>{const n=s(e);await g.click(n.getByRole("button",{name:"Open the user guide"})),await a(t.onOpenGuide).toHaveBeenCalled(),await g.click(n.getByRole("button",{name:"Dismiss"})),await a(t.onDismissInvite).toHaveBeenCalled()}},p={args:{invite:!0},render:function(e){const[n,o]=B.useState(e.invite);return E.jsx(v,{...e,invite:n,onDismissInvite:()=>o(!1)})},play:async({canvasElement:t})=>{const e=s(t);await g.click(e.getByRole("button",{name:"Dismiss"})),await a(e.queryByRole("button",{name:"Dismiss"})).toBeNull(),await a(e.getByRole("region",{name:"Welcome"})).toHaveFocus()}},l={args:{concierge:h(null),connected:!1},play:async({canvasElement:t})=>{const e=s(t);await a(e.getByText(/^Open a user, a group or an app/,y)).toBeInTheDocument(),await a(e.queryByRole("list",{name:"Suggested questions"})).toBeNull()}},m={args:{show:!0},parameters:{motion:"on"}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('You’re on Engineering, a group of 1,284 members. What would you like to know?', SPOKEN)).toBeInTheDocument();
    const cards = within(canvas.getByRole('list', {
      name: 'Suggested questions'
    }));
    await expect(cards.getAllByRole('listitem')).toHaveLength(3);
    await userEvent.click(cards.getByRole('button', {
      name: 'Pin Engineering'
    }));
    await expect(args.onChoose).toHaveBeenCalledWith({
      kind: 'pin',
      entity: ENGINEERING
    });
    await expect(args.onShowDone).not.toHaveBeenCalled();
  }
}`,...i.parameters?.docs?.source},description:{story:"Every open after the first: the words at once, and a card starts its question.",...i.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    concierge: conciergeFor(JOE)
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: 'Find users who share Joe Park’s…'
    })).toHaveAccessibleDescription('You pick the attribute; the value is Joe Park’s own.');
  }
}`,...r.parameters?.docs?.source},description:{story:"A user's page: each card says what the reader still chooses.",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    show: true,
    invite: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(args.onShowDone).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('list', {
      name: 'Suggested questions'
    })).toBeInTheDocument();
    await expect(canvas.getByText(/^New to Okta Unbound\\?/)).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"The first run, with motion off: the show lands whole and is reported played.",...c.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    invite: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Open the user guide'
    }));
    await expect(args.onOpenGuide).toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Dismiss'
    }));
    await expect(args.onDismissInvite).toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source},description:{story:"The invitation stays until it is answered: open the guide, or dismiss it.",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    invite: true
  },
  render: function Render(args) {
    const [invite, setInvite] = useState(args.invite);
    return <ConciergeGreeting {...args} invite={invite} onDismissInvite={() => setInvite(false)} />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Dismiss'
    }));
    await expect(canvas.queryByRole('button', {
      name: 'Dismiss'
    })).toBeNull();
    await expect(canvas.getByRole('region', {
      name: 'Welcome'
    })).toHaveFocus();
  }
}`,...p.parameters?.docs?.source},description:{story:"Answering the invitation removes the pressed button; focus lands on the greeting.",...p.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    concierge: conciergeFor(null),
    connected: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/^Open a user, a group or an app/, SPOKEN)).toBeInTheDocument();
    await expect(canvas.queryByRole('list', {
      name: 'Suggested questions'
    })).toBeNull();
  }
}`,...l.parameters?.docs?.source},description:{story:"No Okta tab: the orb dims, the line says where questions come from, and no card shows.",...l.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    show: true
  },
  parameters: {
    motion: 'on'
  }
}`,...m.parameters?.docs?.source},description:{story:"The typed show with motion on — watch it here; Escape or a tap finishes it.\nNo `play`: an animating story is a showcase, not a test.",...m.parameters?.docs?.description}}};const J=["AtRest","OnAUser","FirstRun","GuideInvitation","DismissKeepsFocus","NoOktaTab","TypedShow"];export{i as AtRest,p as DismissKeepsFocus,c as FirstRun,u as GuideInvitation,l as NoOktaTab,r as OnAUser,m as TypedShow,J as __namedExportsOrder,_ as default};
