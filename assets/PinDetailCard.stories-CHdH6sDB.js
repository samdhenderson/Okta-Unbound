import{P as w}from"./PinDetailCard-TDIpSHeo.js";import{p as h}from"./then-JFpS9G1J.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./dateFormat-Db8QGh5_.js";import"./status-Bn0B6Ou-.js";import"./groupIdentity-DrhSobdh.js";const{expect:n,fn:m,userEvent:g,within:s}=__STORYBOOK_MODULE_TEST__,y={kind:"group",id:"00gFAKE0000000000001",name:"Engineering",lastSeenAt:1},B={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park",lastSeenAt:1},R={kind:"rule",id:"0prFAKE0000000000001",name:"Sales NA",lastSeenAt:1},v={kind:"group",id:y.id,name:y.name},o=(e,a={})=>({lookup:e,isLoading:!1,failed:!1,readAt:e?new Date(2026,9,2,14,30).getTime():null,refresh:m(),...a}),S={title:"Home/Pinned/PinDetailCard",component:w,tags:["autodocs"],parameters:{docs:{description:{component:"The selected pin: its facts from one read and when that read happened, the questions it can start, and Open / Unpin. A fact the read did not report is left off; a pin Okta reports gone keeps only Unpin."}}},args:{pin:y,detail:o({kind:"found",facts:{kind:"group",name:"Engineering",type:"OKTA_GROUP",memberCount:1284,membershipChanged:null}}),asks:[h("compose",{grp:v}),h("build",{grp:v})],readable:!0,onAsk:m(),onOpen:m(),onUnpin:m()}},i={play:async({args:e,canvasElement:a})=>{const t=s(a);await n(t.getByRole("heading",{name:"Engineering"})).toBeInTheDocument(),await n(t.getByText("1,284")).toBeInTheDocument(),await n(t.getByRole("status")).toHaveTextContent(/^Read at /),await g.click(t.getByRole("button",{name:"What’s inside Engineering?"})),await n(e.onAsk).toHaveBeenCalledWith(e.asks[0]),await g.click(t.getByRole("button",{name:"Read this group again"})),await n(e.detail.refresh).toHaveBeenCalled()}},r={args:{pin:B,asks:[],detail:o({kind:"found",facts:{kind:"user",name:"Joe Park",status:"PROVISIONED",department:null,lastSignIn:{kind:"never"},textAttributes:{}}})},play:async({canvasElement:e})=>{const a=s(e);await n(a.getByText("Never signed in")).toBeInTheDocument(),await n(a.getByText("No department set")).toBeInTheDocument()}},c={args:{pin:R,asks:[],detail:o({kind:"found",facts:{kind:"rule",name:"Sales NA",status:"INVALID",targetGroupCount:1}})},play:async({canvasElement:e})=>{await n(s(e).getByText("INVALID")).toBeInTheDocument()}},d={args:{detail:o(null,{isLoading:!0})},play:async({canvasElement:e})=>{const a=s(e);await n(a.getByRole("status")).toHaveTextContent("Reading the group…"),await n(a.getByRole("button",{name:"Read this group again"})).toBeDisabled()}},l={args:{detail:o(null,{failed:!0})},play:async({canvasElement:e})=>{await n(s(e).getByRole("alert")).toHaveTextContent("This group couldn’t be read just now.")}},p={args:{readable:!1,detail:o(null)},play:async({canvasElement:e})=>{await n(s(e).getByRole("status")).toHaveTextContent("Open an Okta admin tab to read this group.")}},u={args:{detail:o({kind:"missing"})},play:async({args:e,canvasElement:a})=>{const t=s(a);await n(t.getByRole("status")).toHaveTextContent("Okta reports no group with this id."),await n(t.queryByRole("button",{name:"Open"})).not.toBeInTheDocument(),await n(t.queryByRole("list")).not.toBeInTheDocument(),await g.click(t.getByRole("button",{name:"Unpin"})),await n(e.onUnpin).toHaveBeenCalled()}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', {
      name: 'Engineering'
    })).toBeInTheDocument();
    await expect(canvas.getByText('1,284')).toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent(/^Read at /);
    await userEvent.click(canvas.getByRole('button', {
      name: 'What’s inside Engineering?'
    }));
    await expect(args.onAsk).toHaveBeenCalledWith(args.asks[0]);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Read this group again'
    }));
    await expect(args.detail.refresh).toHaveBeenCalled();
  }
}`,...i.parameters?.docs?.source},description:{story:"A read group: its count, the read time, its questions, Open and Unpin.",...i.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    pin: USER,
    asks: [],
    detail: detail({
      kind: 'found',
      facts: {
        kind: 'user',
        name: 'Joe Park',
        status: 'PROVISIONED',
        department: null,
        lastSignIn: {
          kind: 'never'
        },
        textAttributes: {}
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Never signed in')).toBeInTheDocument();
    await expect(canvas.getByText('No department set')).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"A user who has never signed in, with no department on their profile.",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    pin: RULE,
    asks: [],
    detail: detail({
      kind: 'found',
      facts: {
        kind: 'rule',
        name: 'Sales NA',
        status: 'INVALID',
        targetGroupCount: 1
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText('INVALID')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"An invalid rule: the status is the badge. No question takes a rule.",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    detail: detail(null, {
      isLoading: true
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Reading the group…');
    await expect(canvas.getByRole('button', {
      name: 'Read this group again'
    })).toBeDisabled();
  }
}`,...d.parameters?.docs?.source},description:{story:"Before the read arrives: the stored name and id, and a line saying it is reading.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    detail: detail(null, {
      failed: true
    })
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('alert')).toHaveTextContent('This group couldn’t be read just now.');
  }
}`,...l.parameters?.docs?.source},description:{story:"The read failed: said as an alert, with the refresh as the way to try again.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    readable: false,
    detail: detail(null)
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Open an Okta admin tab to read this group.');
  }
}`,...p.parameters?.docs?.source},description:{story:"No Okta tab is connected: nothing can be read, and the card says what would let it.",...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    detail: detail({
      kind: 'missing'
    })
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent('Okta reports no group with this id.');
    await expect(canvas.queryByRole('button', {
      name: 'Open'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: 'Unpin'
    }));
    await expect(args.onUnpin).toHaveBeenCalled();
  }
}`,...u.parameters?.docs?.source},description:{story:"Okta reports the group gone: no question and no Open, only Unpin.",...u.parameters?.docs?.description}}};const C=["Group","UserNeverSignedIn","InvalidRule","Reading","ReadFailed","NoOktaTab","Gone"];export{u as Gone,i as Group,c as InvalidRule,p as NoOktaTab,l as ReadFailed,d as Reading,r as UserNeverSignedIn,C as __namedExportsOrder,S as default};
