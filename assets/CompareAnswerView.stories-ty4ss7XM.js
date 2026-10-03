import{C as m}from"./CompareAnswerView-BjeNLZd8.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./AnswerHeadline-1rdFjlxA.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:t,within:l}=__STORYBOOK_MODULE_TEST__,r={kind:"user",id:"00uFAKE0000000000001",name:"Joe Park"},c={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"},o={kind:"group",id:"00gFAKE0000000000002",name:"Sales NA"},i={kind:"app",id:"0oaFAKE0000000000001",name:"Salesforce"},d={verb:"compare",a:r,b:c,groups:{onlyA:[o],onlyB:[],shared:3},completeness:"complete",apps:{onlyA:[i],onlyB:[],shared:2},focus:{app:i,a:{reaches:!0,grant:{scope:"GROUP",via:o}},b:{reaches:!1}},established:[r,c,o,i]},f={title:"Home/Ask/CompareAnswerView",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"A settled Compare. The group difference is always stated; the app difference only when both app walks finished — a short list would invent differences, so the incomplete answer carries no app claim at all and says why."}}},args:{answer:d}},a={play:async({canvasElement:p})=>{const e=l(p);await t(e.getByText("Joe Park reaches Salesforce through Sales NA.")).toBeInTheDocument(),await t(e.getByText("Jon Ruiz isn’t assigned Salesforce.")).toBeInTheDocument()}},n={args:{answer:{verb:"compare",a:r,b:c,groups:{onlyA:[o],onlyB:[],shared:3},completeness:{partial:"walk-failed"},established:[r,c,o]}},play:async({canvasElement:p})=>{const e=l(p);await t(e.getByText(/Apps aren’t compared/)).toBeInTheDocument(),await t(e.queryByText(/Apps only/)).not.toBeInTheDocument()}},s={args:{answer:{...d,groups:{onlyA:[],onlyB:[],shared:4},apps:{onlyA:[],onlyB:[],shared:2},focus:null}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Joe Park reaches Salesforce through Sales NA.')).toBeInTheDocument();
    await expect(canvas.getByText('Jon Ruiz isn’t assigned Salesforce.')).toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"Both walks finished, narrowed to one app.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'compare',
      a: joe,
      b: jon,
      groups: {
        onlyA: [salesNa],
        onlyB: [],
        shared: 3
      },
      completeness: {
        partial: 'walk-failed'
      },
      established: [joe, jon, salesNa]
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Apps aren’t compared/)).toBeInTheDocument();
    await expect(canvas.queryByText(/Apps only/)).not.toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source},description:{story:"An app walk did not finish: the groups are stated, the apps withheld.",...n.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      ...complete,
      groups: {
        onlyA: [],
        onlyB: [],
        shared: 4
      },
      apps: {
        onlyA: [],
        onlyB: [],
        shared: 2
      },
      focus: null
    }
  }
}`,...s.parameters?.docs?.source},description:{story:"No differences at all.",...s.parameters?.docs?.description}}};const T=["Complete","AppsWithheld","Identical"];export{n as AppsWithheld,a as Complete,s as Identical,T as __namedExportsOrder,f as default};
