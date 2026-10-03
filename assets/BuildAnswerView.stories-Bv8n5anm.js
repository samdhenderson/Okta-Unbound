import{j as d,a4 as u}from"./iframe-Pee757m_.js";import{B as m}from"./BuildAnswerView-BHoBH5yx.js";import"./preload-helper-PPVm8Dsz.js";import"./AnswerHeadline-1rdFjlxA.js";import"./copy-DPkId50G.js";import"./memberAnalytics-tPH-giHi.js";import"./slots-kY_j0TaM.js";const{expect:t,fn:i,userEvent:g,within:l}=__STORYBOOK_MODULE_TEST__,p={rule:i(),group:i(),user:i()},n={kind:"group",id:"00gFAKE0000000000001",name:"Engineering"},s={attr:"department",op:"eq",value:"Engineering"},w={verb:"build",predicate:s,group:n,completeness:"complete",outcome:{kind:"preview",expression:'user.department=="Engineering"',matchCount:412,joinCount:38,overlaps:[{id:"0prFAKE0000000000001",name:"Engineering — all"}]},established:[n]},B={title:"Home/Ask/BuildAnswerView",component:m,tags:["autodocs"],decorators:[e=>d.jsx(u,{handlers:p,children:d.jsx(e,{})})],parameters:{docs:{description:{component:"A settled Build: who a rule would match and who would join, the expression it would carry, and any rule already feeding the group on exactly that condition. Nothing is written here: the hand-off drafts the rule on the group’s own page."}}},args:{answer:w}},a={play:async({canvasElement:e})=>{const c=l(e);await t(e.textContent).toContain("38 users would join Engineering"),await t(c.getByText('user.department=="Engineering"')).toBeInTheDocument(),await g.click(c.getByRole("button",{name:/Draft the rule in Engineering/})),await t(p.group).toHaveBeenCalledWith(n.id,{pane:"rules",draftRule:'user.department=="Engineering"'})}},o={args:{answer:{verb:"build",predicate:{...s,value:'R&D "core"'},group:n,completeness:"complete",outcome:{kind:"withheld",reason:"unquotable-value"},established:[n]}},play:async({canvasElement:e})=>{await t(e.textContent).toContain("Not drafted"),await t(l(e).queryByRole("button")).not.toBeInTheDocument()}},r={args:{answer:{verb:"build",predicate:s,group:n,completeness:{partial:"walk-failed"},outcome:{kind:"withheld",reason:"roster-incomplete"},established:[n]}},play:async({canvasElement:e})=>{await t(e.textContent).toContain("who would join isn’t known")}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.textContent).toContain('38 users would join Engineering');
    await expect(canvas.getByText('user.department=="Engineering"')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', {
      name: /Draft the rule in Engineering/
    }));
    await expect(handlers.group).toHaveBeenCalledWith(engineering.id, {
      pane: 'rules',
      draftRule: 'user.department=="Engineering"'
    });
  }
}`,...a.parameters?.docs?.source},description:{story:"A preview, an exact overlap, and the hand-off carrying the expression.",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'build',
      predicate: {
        ...predicate,
        value: 'R&D "core"'
      },
      group: engineering,
      completeness: 'complete',
      outcome: {
        kind: 'withheld',
        reason: 'unquotable-value'
      },
      established: [engineering]
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toContain('Not drafted');
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:"A value it cannot quote provably: no expression, no hand-off.",...o.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    answer: {
      verb: 'build',
      predicate,
      group: engineering,
      completeness: {
        partial: 'walk-failed'
      },
      outcome: {
        kind: 'withheld',
        reason: 'roster-incomplete'
      },
      established: [engineering]
    }
  },
  play: async ({
    canvasElement
  }) => {
    await expect(canvasElement.textContent).toContain('who would join isn’t known');
  }
}`,...r.parameters?.docs?.source},description:{story:"The roster did not finish: no numbers.",...r.parameters?.docs?.description}}};const C=["Preview","Unquotable","RosterUnread"];export{a as Preview,r as RosterUnread,o as Unquotable,C as __namedExportsOrder,B as default};
