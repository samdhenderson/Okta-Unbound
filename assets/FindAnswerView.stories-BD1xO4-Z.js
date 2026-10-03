import{F as m}from"./FindAnswerView-BXotIyHx.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./AnswerHeadline-1rdFjlxA.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:t,userEvent:g,within:l}=__STORYBOOK_MODULE_TEST__,d={attr:"department",op:"eq",value:"Engineering"},c=Array.from({length:30},(a,e)=>({kind:"user",id:`00uFAKE00000000000${String(e).padStart(2,"0")}`,name:`User ${e+1}`})),p={verb:"find",predicate:d,users:c,completeness:"complete",total:c.length,variants:2,established:c},b={title:"Home/Ask/FindAnswerView",component:m,tags:["autodocs"],parameters:{docs:{description:{component:"A settled Find: how many users hold the value exactly, the users themselves, and how many hold it in another case or spacing — named, never counted as matches."}}},args:{answer:p}},s={play:async({canvasElement:a})=>{const e=l(a);await t(e.getByText(/2 more users hold the value in another case/)).toBeInTheDocument(),await t(l(e.getByRole("list")).getAllByRole("listitem")).toHaveLength(24)}},o={play:async({canvasElement:a})=>{const e=l(a),n=e.getByRole("button",{name:"Show all 30"});await t(n).toHaveAttribute("aria-expanded","false"),await t(n).toHaveAttribute("aria-controls",e.getByRole("list").id),await g.click(n),await t(l(e.getByRole("list")).getAllByRole("listitem")).toHaveLength(30),await t(n).toHaveAttribute("aria-expanded","true"),await t(n).toHaveAccessibleName("Show fewer")}},r={args:{answer:{...p,users:[],total:0,variants:0,established:[]}},play:async({canvasElement:a})=>{await t(a.textContent).toContain("No user has department = Engineering.")}},i={args:{answer:{verb:"find",predicate:d,users:c.slice(0,3),completeness:{partial:"walk-failed"},read:3,established:c.slice(0,3)}},play:async({canvasElement:a})=>{await t(a.textContent).toContain("so no total is stated")}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/2 more users hold the value in another case/)).toBeInTheDocument();
    await expect(within(canvas.getByRole('list')).getAllByRole('listitem')).toHaveLength(24);
  }
}`,...s.parameters?.docs?.source},description:{story:"Every page arrived: a total, the variants named apart, the first users listed.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', {
      name: 'Show all 30'
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', canvas.getByRole('list').id);
    await userEvent.click(toggle);
    await expect(within(canvas.getByRole('list')).getAllByRole('listitem')).toHaveLength(30);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Show fewer');
  }
}`,...o.parameters?.docs?.source},description:{story:"Show all lists every match and says it controls the list; Show fewer takes it back.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      ...complete,
      users: [],
      total: 0,
      variants: 0,
      established: []
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toContain('No user has department = Engineering.');
  }
}`,...r.parameters?.docs?.source},description:{story:"No user holds it.",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'find',
      predicate,
      users: users.slice(0, 3),
      completeness: {
        partial: 'walk-failed'
      },
      read: 3,
      established: users.slice(0, 3)
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toContain('so no total is stated');
  }
}`,...i.parameters?.docs?.source},description:{story:"A page failed: the matches read are listed, under a headline with no total.",...i.parameters?.docs?.description}}};const E=["Complete","ShowAll","NoMatch","NotCounted"];export{s as Complete,r as NoMatch,i as NotCounted,o as ShowAll,E as __namedExportsOrder,b as default};
