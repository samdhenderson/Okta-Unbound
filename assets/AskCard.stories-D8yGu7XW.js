import{A as g}from"./AskCard-CBibybTo.js";import{I as k}from"./reducer-C7bPglpv.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./VerbStrip-CFQur6FV.js";import"./verbIcons-BnCRhW9A.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";import"./Sentence-f34hhmJK.js";import"./SlotPill-eK_fGwgC.js";import"./SlotPicker-0ZR16Ogn.js";import"./useDebouncedValue-CPDJ-sEe.js";import"./oktaId-BKuZMWJR.js";import"./AttributePicker-DcO3jn5g.js";import"./GrantingGroupPicker-BEsEc4BK.js";import"./HeldValuePicker-BwShd0te.js";import"./RunningLine-BJSVlGYi.js";import"./CompareAnswerView-BjeNLZd8.js";import"./AnswerHeadline-1rdFjlxA.js";import"./AccessAnswerView-BHrNNcuO.js";import"./AccessPathList-xYLLiYDM.js";import"./BuildAnswerView-BHoBH5yx.js";import"./ComposeAnswerView-CFFjt3lz.js";import"./ComposeAttributeRow-FpGF-y2V.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./FindAnswerView-BXotIyHx.js";import"./ThenChips-Bh2ZPFuf.js";import"./EarlierList-xEe-rROv.js";import"./dateFormat-Db8QGh5_.js";const{expect:d,fn:e,within:h}=__STORYBOOK_MODULE_TEST__,s={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},n={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"},m={kind:"group",id:"00gFAKE0000000000002",name:"Sales NA"};function r(l,u={}){return{state:{...k,...l},verbs:["compare"],ready:!1,cost:"Takes no requests.",chips:[],history:[],suggestions:[],attributes:{status:"loading"},retryAttributes:e(),scoped:{kind:"none"},unscope:e(),pickVerb:e(),fill:e(),clear:e(),focusSlot:e(),run:e(),ask:e(),tap:e(),...u}}const G={title:"Home/Ask/AskCard",component:g,tags:["autodocs"],parameters:{docs:{description:{component:"Home’s Ask card: pick a verb, complete the sentence, run it. The cost of running is printed under the sentence before Run is pressed (ADR-0007), and a scan line crosses the top edge while a run reads. The open page fills its own slot; every counterpart is left for the reader."}}},args:{ask:r({slots:{u1:s},activeSlot:"u2",provenance:{u1:"page"}},{suggestions:[{ref:n,source:"recent"}],cost:"Takes 1 user group-list walk and 1 app-assignment walk."}),searchers:{},isActive:!0}},o={play:async({canvasElement:l})=>{const u=h(l);await d(u.getByRole("button",{name:/Run/})).toBeDisabled(),await d(u.getByRole("group",{name:"Choose from users"})).toBeInTheDocument()}},t={args:{ask:r({slots:{u1:s,u2:n},activeSlot:null},{ready:!0,cost:"Takes 2 user group-list walks and 2 app-assignment walks."})}},a={args:{ask:r({slots:{u1:s,u2:n},activeSlot:null,run:{status:"running",progress:{step:"user-apps",done:3,total:4}}})}},i={args:{ask:r({slots:{u1:s,u2:n},activeSlot:null,run:{status:"done",answer:{verb:"compare",a:s,b:n,groups:{onlyA:[m],onlyB:[],shared:3},completeness:"complete",apps:{onlyA:[],onlyB:[],shared:2},focus:null,established:[s,n,m]}}})}},p={args:{ask:r({slots:{u1:s,u2:n},activeSlot:null,run:{status:"failed",reason:"request-failed"}})}},c={args:{ask:r({activeSlot:null},{history:[{verb:"compare",slots:{u1:s,u2:n},askedAt:Date.now()-36e5}]})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', {
      name: /Run/
    })).toBeDisabled();
    await expect(canvas.getByRole('group', {
      name: 'Choose from users'
    })).toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"The page’s user filled; the reader picks who to compare with.",...o.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      slots: {
        u1: joe,
        u2: jon
      },
      activeSlot: null
    }, {
      ready: true,
      cost: 'Takes 2 user group-list walks and 2 app-assignment walks.'
    })
  }
}`,...t.parameters?.docs?.source},description:{story:"Ready to run.",...t.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      slots: {
        u1: joe,
        u2: jon
      },
      activeSlot: null,
      run: {
        status: 'running',
        progress: {
          step: 'user-apps',
          done: 3,
          total: 4
        }
      }
    })
  }
}`,...a.parameters?.docs?.source},description:{story:"Reading.",...a.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      slots: {
        u1: joe,
        u2: jon
      },
      activeSlot: null,
      run: {
        status: 'done',
        answer: {
          verb: 'compare',
          a: joe,
          b: jon,
          groups: {
            onlyA: [salesNa],
            onlyB: [],
            shared: 3
          },
          completeness: 'complete',
          apps: {
            onlyA: [],
            onlyB: [],
            shared: 2
          },
          focus: null,
          established: [joe, jon, salesNa]
        }
      }
    })
  }
}`,...i.parameters?.docs?.source},description:{story:"Answered.",...i.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      slots: {
        u1: joe,
        u2: jon
      },
      activeSlot: null,
      run: {
        status: 'failed',
        reason: 'request-failed'
      }
    })
  }
}`,...p.parameters?.docs?.source},description:{story:"A required read failed: nothing is stated.",...p.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ask: fakeAsk({
      activeSlot: null
    }, {
      history: [{
        verb: 'compare',
        slots: {
          u1: joe,
          u2: jon
        },
        askedAt: Date.now() - 3_600_000
      }]
    })
  }
}`,...c.parameters?.docs?.source},description:{story:"Nothing open, with questions from earlier.",...c.parameters?.docs?.description}}};const Q=["ChoosingCounterpart","Ready","Running","Answered","Failed","Earlier"];export{i as Answered,o as ChoosingCounterpart,c as Earlier,p as Failed,t as Ready,a as Running,Q as __namedExportsOrder,G as default};
