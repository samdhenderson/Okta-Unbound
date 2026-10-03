import{A as l}from"./AccessAnswerView-BHrNNcuO.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./AnswerHeadline-1rdFjlxA.js";import"./AccessPathList-xYLLiYDM.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:i,within:m}=__STORYBOOK_MODULE_TEST__,e={kind:"user",id:"00uFAKE0000000000002",name:"Jon Ruiz"},s={kind:"app",id:"0oaFAKE0000000000001",name:"Salesforce"},o={kind:"group",id:"00gFAKE0000000000002",name:"Sales NA"},d={kind:"group",id:"00gFAKE0000000000009",name:"AD Sales"},u={verb:"access",user:e,app:s,completeness:"complete",outcome:{kind:"no",rulesChecked:2,paths:[{group:o,feed:"rules",rules:[{rule:{id:"0prFAKE0000000000001",name:"Sales NA"},verdict:{kind:"fails",clauses:['user.region == "NA"']}},{rule:{id:"0prFAKE0000000000002",name:"Sales contractors"},verdict:{kind:"inactive-would-match"}}]},{group:d,feed:"app-managed"}]},established:[e,s,o,d]},b={title:"Home/Ask/AccessAnswerView",component:l,tags:["autodocs"],parameters:{docs:{description:{component:"A settled Access. “Yes” names the grant as Okta reported it. “No” is stated only after both the user’s app walk and the app’s group walk finished, and lists every way in with what the user fails on each; otherwise the answer is withheld with its reason."}}},args:{answer:u}},a={play:async({canvasElement:c})=>{const p=m(c);await i(p.getByText('user.region == "NA"')).toBeInTheDocument(),await i(p.getByText(/source app, not from a rule/)).toBeInTheDocument()}},n={args:{answer:{verb:"access",user:e,app:s,completeness:"complete",outcome:{kind:"yes",grant:{scope:"GROUP",via:o}},established:[e,s,o]}}},t={args:{answer:{verb:"access",user:e,app:s,completeness:"complete",outcome:{kind:"yes",grant:{scope:"USER"}},established:[e,s]}}},r={args:{answer:{verb:"access",user:e,app:s,completeness:{partial:"walk-failed"},outcome:{kind:"withheld",reason:"user-apps-incomplete"},established:[e,s]}},play:async({canvasElement:c})=>{await i(c.textContent).toMatch(/Not answered: Jon Ruiz’s app list/)}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('user.region == "NA"')).toBeInTheDocument();
    await expect(canvas.getByText(/source app, not from a rule/)).toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"No, with the failing clause first and an app-sourced group after.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'access',
      user: jon,
      app: salesforce,
      completeness: 'complete',
      outcome: {
        kind: 'yes',
        grant: {
          scope: 'GROUP',
          via: salesNa
        }
      },
      established: [jon, salesforce, salesNa]
    }
  }
}`,...n.parameters?.docs?.source},description:{story:"Yes, through a named group.",...n.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'access',
      user: jon,
      app: salesforce,
      completeness: 'complete',
      outcome: {
        kind: 'yes',
        grant: {
          scope: 'USER'
        }
      },
      established: [jon, salesforce]
    }
  }
}`,...t.parameters?.docs?.source},description:{story:"Yes, with a user-level assignment — never called “direct only”.",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'access',
      user: jon,
      app: salesforce,
      completeness: {
        partial: 'walk-failed'
      },
      outcome: {
        kind: 'withheld',
        reason: 'user-apps-incomplete'
      },
      established: [jon, salesforce]
    }
  },
  play: async ({
    canvasElement
  }) => {
    // The headline is painted word by word, so it is matched as the paragraph's text.
    await expect(canvasElement.textContent).toMatch(/Not answered: Jon Ruiz’s app list/);
  }
}`,...r.parameters?.docs?.source},description:{story:"The user's app walk did not finish: no answer, and why.",...r.parameters?.docs?.description}}};const E=["No","YesThroughGroup","YesUserLevel","Withheld"];export{a as No,r as Withheld,n as YesThroughGroup,t as YesUserLevel,E as __namedExportsOrder,b as default};
