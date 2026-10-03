import{j as k,r as E}from"./iframe-Pee757m_.js";import{P as B}from"./PinnedCard-KpMYf2Pn.js";import{u as R}from"./useHomePinned-_hJ7nIvc.js";import"./preload-helper-PPVm8Dsz.js";import"./PinDetailCard-TDIpSHeo.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./dateFormat-Db8QGh5_.js";import"./status-Bn0B6Ou-.js";import"./groupIdentity-DrhSobdh.js";import"./PinRail-Dr8sHgux.js";import"./jumpDestinations-db1xhCJ2.js";import"./tabs-2VIodLff.js";import"./concierge-CFpCju1p.js";import"./then-JFpS9G1J.js";import"./entityCache-DjpWgwt1.js";import"./keys-CD32im_j.js";import"./useEntityQuery-D64bDfY8.js";import"./okta-DAa4Z-vW.js";import"./types-D54cNL3h.js";import"./oktaId-BKuZMWJR.js";import"./profileFields-BZvCtc6D.js";const{expect:o,fn:e,userEvent:d,within:u}=__STORYBOOK_MODULE_TEST__,l={kind:"group",id:"00gFAKE0000000000001",name:"Engineering",lastSeenAt:1},y={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park",lastSeenAt:1},w=(n={})=>({total:2,kinds:["group","user"],filter:"all",setFilter:e(),shown:[l,y],selected:l,select:e(),detail:{lookup:null,isLoading:!0,failed:!1,readAt:null,refresh:e()},readable:!0,asks:[],unpin:{released:null,unpin:e(),undo:e(),dismiss:e()},...n}),Y={title:"Home/Pinned/PinnedCard",component:B,tags:["autodocs"],parameters:{docs:{description:{component:"Home’s Pinned section: the pins as a rail, the selected one described below, and Undo after an unpin. It does not exist until something is pinned, and stays while an Undo is on offer."}}},args:{pinned:w(),onAsk:e(),canOpen:()=>!0,onOpen:e()}},s={play:async({args:n,canvasElement:t})=>{const a=u(t);await o(a.getByRole("region",{name:"Pinned"})).toHaveTextContent("2"),await d.click(a.getByRole("button",{name:"Open"})),await o(n.onOpen).toHaveBeenCalledWith(l),await d.click(a.getByRole("button",{name:"Unpin"})),await o(n.pinned.unpin.unpin).toHaveBeenCalledWith(l)}},i={args:{canOpen:()=>!1},play:async({canvasElement:n})=>{await o(u(n).queryByRole("button",{name:"Open"})).not.toBeInTheDocument()}},r={args:{pinned:w({total:0,kinds:[],shown:[],selected:null,unpin:{released:y,unpin:e(),undo:e(),dismiss:e()}})},play:async({args:n,canvasElement:t})=>{const a=u(t);await o(a.getByRole("status")).toHaveTextContent("Unpinned Joe Park."),await d.click(a.getByRole("button",{name:"Undo"})),await o(n.pinned.unpin.undo).toHaveBeenCalled()}},b=()=>{const[n,t]=E.useState([l,y]),a=R({api:{makeApiRequest:e()},oktaOrigin:"https://example.okta.com",workingSet:{pinned:n,forget:(v,m)=>t(g=>g.filter(h=>h.kind!==v||h.id!==m)),restorePin:(v,m)=>t(g=>[...g.slice(0,m),v,...g.slice(m)])},enabled:!1});return k.jsx(B,{pinned:a,onAsk:e(),canOpen:()=>!0,onOpen:e()})},c={render:()=>k.jsx(b,{}),play:async({canvasElement:n})=>{const t=u(n);await d.click(t.getByRole("button",{name:"Unpin"}));const a=await t.findByRole("button",{name:"Undo"});await o(a).toHaveFocus(),await o(t.getByRole("button",{name:"Joe Park"})).toHaveAttribute("aria-pressed","true"),await d.click(a),await o(t.getByRole("button",{name:"Joe Park"})).toHaveFocus(),await o(t.getByRole("button",{name:"Engineering"})).toBeInTheDocument()}},p={args:{pinned:w({total:0,kinds:[],shown:[],selected:null})},play:async({canvasElement:n})=>{await o(u(n).queryByRole("region")).not.toBeInTheDocument()}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', {
      name: 'Pinned'
    })).toHaveTextContent('2');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Open'
    }));
    await expect(args.onOpen).toHaveBeenCalledWith(ENGINEERING);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Unpin'
    }));
    await expect(args.pinned.unpin.unpin).toHaveBeenCalledWith(ENGINEERING);
  }
}`,...s.parameters?.docs?.source},description:{story:"Two pins, the first selected and being read.",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    canOpen: () => false
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('button', {
      name: 'Open'
    })).not.toBeInTheDocument();
  }
}`,...i.parameters?.docs?.source},description:{story:"A kind this build cannot open: Open is omitted, not disabled.",...i.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    pinned: state({
      total: 0,
      kinds: [],
      shown: [],
      selected: null,
      unpin: {
        released: JOE,
        unpin: fn(),
        undo: fn(),
        dismiss: fn()
      }
    })
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Unpinned Joe Park.');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Undo'
    }));
    await expect(args.pinned.unpin.undo).toHaveBeenCalled();
  }
}`,...r.parameters?.docs?.source},description:{story:"The last pin was just unpinned: the section stays for its Undo.",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <LivePinned />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Unpin'
    }));
    const undo = await canvas.findByRole('button', {
      name: 'Undo'
    });
    await expect(undo).toHaveFocus();
    await expect(canvas.getByRole('button', {
      name: 'Joe Park'
    })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(undo);
    await expect(canvas.getByRole('button', {
      name: 'Joe Park'
    })).toHaveFocus();
    await expect(canvas.getByRole('button', {
      name: 'Engineering'
    })).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Unpin moves focus to Undo; Undo moves it back to the rail, so the keyboard keeps its place.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    pinned: state({
      total: 0,
      kinds: [],
      shown: [],
      selected: null
    })
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).queryByRole('region')).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Nothing pinned and nothing to undo: no section at all.",...p.parameters?.docs?.description}}};const z=["Pins","CannotOpen","UndoTheLastPin","FocusSurvivesUnpin","Nothing"];export{i as CannotOpen,c as FocusSurvivesUnpin,p as Nothing,s as Pins,r as UndoTheLastPin,z as __namedExportsOrder,Y as default};
