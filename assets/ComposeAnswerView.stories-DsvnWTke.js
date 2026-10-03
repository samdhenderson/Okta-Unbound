import{C as w}from"./ComposeAnswerView-CFFjt3lz.js";import{r as v,e as b}from"./memberAnalytics-tPH-giHi.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./AnswerHeadline-1rdFjlxA.js";import"./ComposeAttributeRow-FpGF-y2V.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./copy-DPkId50G.js";import"./slots-kY_j0TaM.js";const{expect:n,fn:f,userEvent:u,within:i}=__STORYBOOK_MODULE_TEST__,l={kind:"group",id:"00gFAKE0000000000001",name:"Engineering"},m=["Austin","Boston","Chicago","Denver","Seattle","Toronto","Dublin","Lisbon"],d=Array.from({length:40},(e,t)=>({id:`00uFAKE00000000000${String(t).padStart(2,"0")}`,status:"ACTIVE",profile:{login:`member${t}@example.com`,email:`member${t}@example.com`,firstName:"Member",lastName:String(t),department:t%5===0?"engineering":"Engineering",city:m[t%m.length],costCenter:"CC-100"}})),c=v(b(d),e=>e==="costCenter"?1:0),g={verb:"compose",group:l,completeness:"complete",memberCount:d.length,signals:c.filter(e=>e.flagged),quiet:c.filter(e=>!e.flagged),ruleCoupling:"checked",established:[l]},S={title:"Home/Ask/ComposeAnswerView",component:w,tags:["autodocs"],parameters:{docs:{description:{component:"A settled Compose: the attributes that stand out across the whole roster, each with the evidence it was flagged on. Nothing is charted until the reader opens one, and a value they tap is what the follow-up questions may carry."}}},args:{answer:g,tapped:null,onTap:f()}},a={play:async({canvasElement:e})=>{const t=i(e);await n(t.getByText("2 values differ only in case or spacing: engineering, Engineering.")).toBeInTheDocument(),await n(t.getByText("A rule feeding this group reads it.")).toBeInTheDocument(),await n(t.queryByRole("group")).not.toBeInTheDocument()}},s={play:async({args:e,canvasElement:t})=>{const p=i(t),[h]=p.getAllByRole("button",{name:"Values"});await u.click(h),await n(p.getAllByRole("button",{name:"Values"})[0]).toHaveAttribute("aria-expanded","true");const y=p.getByRole("group",{name:/Ask about one Department value/});await u.click(i(y).getAllByRole("button")[0]),await n(e.onTap).toHaveBeenCalledWith({attr:"department",op:"eq",value:"Engineering"})}},r={args:{answer:{...g,ruleCoupling:"unavailable",signals:c.filter(e=>e.signals.some(t=>t.kind!=="rule")),quiet:c.filter(e=>!e.signals.some(t=>t.kind!=="rule"))}},play:async({canvasElement:e})=>{await n(i(e).getByText(/whether a rule reads an attribute isn’t checked/)).toBeInTheDocument()}},o={args:{answer:{verb:"compose",group:l,completeness:{partial:"walk-failed"},established:[l]}},play:async({canvasElement:e})=>{await n(e.textContent).toContain("member list didn’t finish loading"),await n(i(e).queryByRole("list")).not.toBeInTheDocument()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // First-seen order: member 0 holds the lower-case spelling.
    await expect(canvas.getByText('2 values differ only in case or spacing: engineering, Engineering.')).toBeInTheDocument();
    await expect(canvas.getByText('A rule feeding this group reads it.')).toBeInTheDocument();
    await expect(canvas.queryByRole('group')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Every reason is stated from its evidence; nothing is charted yet.",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('button', {
      name: 'Values'
    });
    await userEvent.click(first);
    // Opening wraps the header for the body, so the control is a fresh element.
    await expect(canvas.getAllByRole('button', {
      name: 'Values'
    })[0]).toHaveAttribute('aria-expanded', 'true');
    const values = canvas.getByRole('group', {
      name: /Ask about one Department value/
    });
    await userEvent.click(within(values).getAllByRole('button')[0]);
    await expect(args.onTap).toHaveBeenCalledWith({
      attr: 'department',
      op: 'eq',
      value: 'Engineering'
    });
  }
}`,...s.parameters?.docs?.source},description:{story:"Opening an attribute shows its split; tapping a value reports it.",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      ...answer,
      ruleCoupling: 'unavailable',
      signals: ranked.filter(entry => entry.signals.some(s => s.kind !== 'rule')),
      quiet: ranked.filter(entry => !entry.signals.some(s => s.kind !== 'rule'))
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText(/whether a rule reads an attribute isn’t checked/)).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source},description:{story:"With the rules unread, the answer says the rule signal was not checked.",...r.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'compose',
      group: engineering,
      completeness: {
        partial: 'walk-failed'
      },
      established: [engineering]
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toContain('member list didn’t finish loading');
    await expect(within(canvasElement).queryByRole('list')).not.toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"A roster that did not finish: no attribute claims at all.",...o.parameters?.docs?.description}}};const q=["StandsOut","TapAValue","RulesUnread","Withheld"];export{r as RulesUnread,a as StandsOut,s as TapAValue,o as Withheld,q as __namedExportsOrder,S as default};
