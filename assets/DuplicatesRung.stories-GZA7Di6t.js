import{j as s}from"./iframe-Pee757m_.js";import{f as U,D as f,p as M,a as C}from"./ruleMerge-CW67dk9w.js";import{V as T}from"./VerbRunner-C8BUgmCE.js";import{E as S}from"./selectionStore-CJ3uIvus.js";import{m as F}from"./useRuleMerge-BUtQPdcL.js";import{a as O}from"./ruleTargets-hCG7hfyY.js";import{M as P,m as _,a as H,b as L,r as V}from"./DuplicateSetParts-AUAlRlyx.js";import"./preload-helper-PPVm8Dsz.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./memberAnalytics-tPH-giHi.js";import"./BreakdownReport-DLC4-fAg.js";import"./PreflightSections-DS2OyTQC.js";import"./RunSteps-B3-vvI0R.js";import"./costSentence-BaIgeJiz.js";import"./csvUtils-DgNWYp8m.js";import"./useSelection-DhS6cLGA.js";import"./types-UQE3j1TH.js";import"./useVerbRun-DT7B4Jtv.js";import"./useActorNotice-qzPG2tVV.js";import"./undoManager-CK5SBv_l.js";import"./auditStore-Drtcd6o6.js";import"./index-Dob3nYDb.js";import"./types-D54cNL3h.js";import"./ruleTargetFacts-DKSE0DP8.js";import"./dateFormat-Db8QGh5_.js";import"./ruleUtils-D89ADPfb.js";const{expect:t,fn:i,userEvent:o,within:r}=__STORYBOOK_MODULE_TEST__,m=e=>({status:"ACTIVE",condition:"department equals Engineering",conditionExpression:'user.department == "Engineering"',groupIds:["00gFAKE0000000000001"],userAttributes:["department"],created:"2023-03-01T00:00:00.000Z",lastUpdated:"2025-01-01T00:00:00.000Z",...e}),c=m({id:"0prFAKE0000000000001",name:"Engineering - US",groupIds:["00gFAKE0000000000001","00gFAKE0000000000002"]}),k=m({id:"0prFAKE0000000000002",name:"Engineering - EU",created:"2024-02-01T00:00:00.000Z",groupIds:["00gFAKE0000000000001","00gFAKE0000000000003"]}),K=m({id:"0prFAKE0000000000003",name:"Engineering - APAC",status:"INACTIVE",created:"2024-06-01T00:00:00.000Z",groupIds:["00gFAKE0000000000001"]}),q=m({id:"0prFAKE0000000000004",name:"Sales - All",condition:"department equals Sales",conditionExpression:'user.department == "Sales"',groupIds:["00gFAKE0000000000004"]}),j=m({id:"0prFAKE0000000000005",name:"Sales - Employees",condition:"department equals Sales",conditionExpression:'user.department == "Sales"',groupIds:["00gFAKE0000000000005"],excludedGroupIds:["00gFAKE0000000000006"]}),G=m({id:"0prFAKE0000000000006",name:"Support",condition:"department equals Support",conditionExpression:'user.department == "Support"',groupIds:["00gFAKE0000000000007"]}),x=[c,k,K,q,j,G],b=U(x),I=b[0].key,Y={"00gFAKE0000000000001":"Engineering - All","00gFAKE0000000000002":"Engineering - US","00gFAKE0000000000003":"Engineering - EU","00gFAKE0000000000004":"Sales - All","00gFAKE0000000000005":"Sales - Employees","00gFAKE0000000000006":"Sales - Contractors"},D=e=>Y[e],W=x.filter(e=>e.id!==c.id).map(e=>e.name),l=(()=>{const e=M({raws:[c,k,K].map(C),keptRuleId:c.id,nextName:"Engineering",takenNames:W});if(e.refusal)throw new Error("fixture plan refused");return e.plan})(),Z={id:"rule-merge",label:H(l.retire.length),title:_(c.name,3),path:"write",needs:[],confirmTone:"danger",reversal:P,cost:()=>({requests:0,writes:0}),run:async()=>({status:"done",summary:"Done."})},N=e=>({verb:Z,stage:"confirm",preflight:null,progress:"",steps:[],outcome:null,error:null,fields:[],values:{},setValue:i(),isComposed:!0,isRefreshing:!1,submitFields:i(),start:i(),confirm:i(),close:i(),...e}),Ae={title:"Rules/DuplicatesRung",component:f,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Pushed from the list strip’s **View duplicates**. A mergeable set (same condition, same exclusions) picks a kept rule, optionally renames it, and opens a `VerbRunner` confirm through **Review merge**. A set whose exclusions differ states the difference and offers no merge. A name Okta would refuse withholds **Review merge** and says why — the button is omitted, never disabled."}}},argTypes:{sets:{description:"The sets found in the loaded rules (`findDuplicateSets`)."},allRules:{description:"Every loaded rule, for the rename’s name-collision check."},merged:{description:"Sets merged in this visit; each renders as its summary."},groupName:{description:"Group-name lookup; an id with no name shows in mono."},onViewRule:{description:"Push a rule’s detail rung over this one."},onReviewMerge:{description:"Open the merge confirm. Omitted when no Okta tab is connected."},notice:{description:"A notice about the last merge."},onDismissNotice:{description:"Dismiss the notice."}},args:{sets:b,allRules:x,merged:[],groupName:D,onViewRule:i(),onReviewMerge:i()}},g={play:async({canvasElement:e,args:n})=>{const a=r(e),u=a.getByRole("radiogroup",{name:"Rule to keep"});await t(r(u).getByRole("radio",{name:"Keep Engineering - US"})).toHaveAttribute("aria-checked","true"),await t(a.getByText(/Same condition, different exclusions/)).toBeInTheDocument(),await o.click(a.getByRole("button",{name:"Review merge"})),await t(n.onReviewMerge).toHaveBeenCalledWith(t.objectContaining({keptRuleId:c.id,nextName:void 0}))}},p={play:async({canvasElement:e})=>{const n=r(e);await o.click(n.getByRole("radio",{name:"Keep Engineering - EU"})),await t(n.getByRole("radio",{name:"Keep Engineering - EU"})).toHaveAttribute("aria-checked","true"),await t(n.getByRole("radio",{name:"Keep Engineering - US"})).toHaveAttribute("aria-checked","false")}},d={play:async({canvasElement:e,args:n})=>{const a=r(e);await o.click(a.getByRole("button",{name:"Rename"}));const u=a.getByRole("textbox",{name:"Kept rule's name"});await t(u).toHaveValue("Engineering - US"),await o.clear(u),await o.type(u,"Engineering"),await o.click(a.getByRole("button",{name:"Review merge"})),await t(n.onReviewMerge).toHaveBeenCalledWith(t.objectContaining({nextName:"Engineering"}))}},y={play:async({canvasElement:e})=>{const n=r(e);await o.click(n.getByRole("button",{name:"Rename"})),await o.clear(n.getByRole("textbox",{name:"Kept rule's name"})),await t(n.getByRole("textbox",{name:"Kept rule's name"})).toHaveAttribute("aria-invalid","true"),await t(n.queryByRole("button",{name:"Review merge"})).not.toBeInTheDocument()}},E={play:async({canvasElement:e})=>{const n=r(e);await o.click(n.getByRole("button",{name:"Rename"}));const a=n.getByRole("textbox",{name:"Kept rule's name"});await o.clear(a),await o.paste("x".repeat(O+1)),await t(a).toHaveAttribute("aria-invalid","true"),await t(n.queryByRole("button",{name:"Review merge"})).not.toBeInTheDocument()}},w={play:async({canvasElement:e})=>{const n=r(e);await o.click(n.getByRole("button",{name:"Rename"}));const a=n.getByRole("textbox",{name:"Kept rule's name"});await o.clear(a),await o.type(a,"support"),await t(a).toHaveAttribute("aria-invalid","true"),await t(n.queryByRole("button",{name:"Review merge"})).not.toBeInTheDocument()}},v={args:{onReviewMerge:void 0},play:async({canvasElement:e})=>{const n=r(e);await t(n.getByRole("radiogroup",{name:"Rule to keep"})).toBeInTheDocument(),await t(n.queryByRole("button",{name:"Review merge"})).not.toBeInTheDocument()}},h={args:{sets:b.slice(1),merged:[{setKey:I,keptName:"Engineering",groupCount:3,retiredNames:["Engineering - EU","Engineering - APAC"],unretiredNames:[]}]},play:async({canvasElement:e})=>{const n=r(e);await t(n.getByText(/Kept Engineering with 3 groups/)).toBeInTheDocument(),await t(n.getByText(/Set 2 · not mergeable/)).toBeInTheDocument()}},R={render:e=>s.jsxs(s.Fragment,{children:[s.jsx(f,{...e}),s.jsx(T,{basket:S,run:N({preflight:L(l,D)})})]}),play:async({canvasElement:e})=>{const n=r(r(e.ownerDocument.body).getByRole("dialog",{name:"Merge 3 rules into Engineering - US"}));await t(n.getByText(/Renamed: Engineering - US → Engineering/)).toBeInTheDocument(),await t(n.getByRole("region",{name:"Retiring 2 rules"})).toBeInTheDocument(),await t(n.getByRole("button",{name:"Merge and retire 2 rules"})).toBeInTheDocument()}},B={args:{sets:b.slice(1),merged:[{setKey:I,keptName:"Engineering",groupCount:3,retiredNames:["Engineering - EU"],unretiredNames:["Engineering - APAC"]}]},render:e=>{const n=F({kind:"ran",plan:l,kept:"saved",keptStatus:"as-before",retired:[{rule:l.retire[0],outcome:"retired"},{rule:l.retire[1],outcome:"refused",error:"Rule cannot be deleted."}],before:{groupIds:c.groupIds,name:c.name},after:{groupIds:l.union,name:"Engineering"}});return s.jsxs(s.Fragment,{children:[s.jsx(f,{...e}),s.jsx(T,{basket:S,run:N({stage:"results",outcome:{...n,followUps:[{id:"retry-retire",label:V(["Engineering - APAC"]),tone:"primary",icon:"refresh",run:i()}]}})})]})},play:async({canvasElement:e})=>{const n=r(e);await t(n.getByText(/Engineering - APAC is not retired/)).toBeInTheDocument();const a=r(r(e.ownerDocument.body).getByRole("dialog"));await t(a.getByText(/Okta refused to retire it/)).toBeInTheDocument(),await t(a.getByRole("button",{name:"Retry retiring Engineering - APAC"})).toBeInTheDocument()}},A={args:{sets:[]},play:async({canvasElement:e})=>{const n=r(e);await t(n.getByText("No duplicate rules")).toBeInTheDocument()}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const choice = canvas.getByRole('radiogroup', {
      name: 'Rule to keep'
    });
    await expect(within(choice).getByRole('radio', {
      name: 'Keep Engineering - US'
    })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByText(/Same condition, different exclusions/)).toBeInTheDocument();
    // One Review merge: the not-mergeable set offers none.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Review merge'
    }));
    await expect(args.onReviewMerge).toHaveBeenCalledWith(expect.objectContaining({
      keptRuleId: US.id,
      nextName: undefined
    }));
  }
}`,...g.parameters?.docs?.source},description:{story:"One mergeable set and one that is not. The active, oldest rule is kept, and the row says why.",...g.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', {
      name: 'Keep Engineering - EU'
    }));
    await expect(canvas.getByRole('radio', {
      name: 'Keep Engineering - EU'
    })).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', {
      name: 'Keep Engineering - US'
    })).toHaveAttribute('aria-checked', 'false');
  }
}`,...p.parameters?.docs?.source},description:{story:"Keeping another rule moves the choice; the reason line goes, because the reader chose.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Rename'
    }));
    const field = canvas.getByRole('textbox', {
      name: "Kept rule's name"
    });
    await expect(field).toHaveValue('Engineering - US');
    await userEvent.clear(field);
    await userEvent.type(field, 'Engineering');
    await userEvent.click(canvas.getByRole('button', {
      name: 'Review merge'
    }));
    await expect(args.onReviewMerge).toHaveBeenCalledWith(expect.objectContaining({
      nextName: 'Engineering'
    }));
  }
}`,...d.parameters?.docs?.source},description:{story:"The kept rule's name, open and pre-filled; a valid new name travels with the merge.",...d.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Rename'
    }));
    await userEvent.clear(canvas.getByRole('textbox', {
      name: "Kept rule's name"
    }));
    await expect(canvas.getByRole('textbox', {
      name: "Kept rule's name"
    })).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.queryByRole('button', {
      name: 'Review merge'
    })).not.toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:"An empty name is refused while it is typed, and Review merge is withheld.",...y.parameters?.docs?.description}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Rename'
    }));
    const field = canvas.getByRole('textbox', {
      name: "Kept rule's name"
    });
    await userEvent.clear(field);
    await userEvent.paste('x'.repeat(MAX_RULE_NAME_LENGTH + 1));
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.queryByRole('button', {
      name: 'Review merge'
    })).not.toBeInTheDocument();
  }
}`,...E.parameters?.docs?.source},description:{story:"A name past Okta's limit is refused with the limit stated.",...E.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {
      name: 'Rename'
    }));
    const field = canvas.getByRole('textbox', {
      name: "Kept rule's name"
    });
    await userEvent.clear(field);
    await userEvent.type(field, 'support');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.queryByRole('button', {
      name: 'Review merge'
    })).not.toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:`A name another rule holds is refused, and the rule holding it is named. A
retired rule still holds its name when the kept rule is saved, so its name
counts as taken too.`,...w.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    onReviewMerge: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', {
      name: 'Rule to keep'
    })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', {
      name: 'Review merge'
    })).not.toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:"No Okta tab connected: every set shows its facts, and no Review merge.",...v.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    // The reload has dropped the merged set from detection; its summary stays.
    sets: SETS.slice(1),
    merged: [{
      setKey: MERGEABLE_KEY,
      keptName: 'Engineering',
      groupCount: 3,
      retiredNames: ['Engineering - EU', 'Engineering - APAC'],
      unretiredNames: []
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Kept Engineering with 3 groups/)).toBeInTheDocument();
    await expect(canvas.getByText(/Set 2 · not mergeable/)).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"A merged set keeps its number and collapses to what happened.",...h.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: args => <>
      <DuplicatesRung {...args} />
      <VerbRunner basket={EMPTY_BASKET} run={runAt({
      preflight: mergePreflight(plan, groupName)
    })} />
    </>,
  play: async ({
    canvasElement
  }) => {
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog', {
      name: 'Merge 3 rules into Engineering - US'
    }));
    await expect(dialog.getByText(/Renamed: Engineering - US → Engineering/)).toBeInTheDocument();
    await expect(dialog.getByRole('region', {
      name: 'Retiring 2 rules'
    })).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Merge and retire 2 rules'
    })).toBeInTheDocument();
  }
}`,...R.parameters?.docs?.source},description:{story:"The confirm Review merge opens: the kept rule, its new name, what it gains, and what retires.",...R.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    sets: SETS.slice(1),
    merged: [{
      setKey: MERGEABLE_KEY,
      keptName: 'Engineering',
      groupCount: 3,
      retiredNames: ['Engineering - EU'],
      unretiredNames: ['Engineering - APAC']
    }]
  },
  render: args => {
    const outcome = mergeOutcome({
      kind: 'ran',
      plan,
      steps: [],
      kept: 'saved',
      keptStatus: 'as-before',
      retired: [{
        rule: plan.retire[0],
        outcome: 'retired'
      }, {
        rule: plan.retire[1],
        outcome: 'refused',
        error: 'Rule cannot be deleted.'
      }],
      before: {
        groupIds: US.groupIds,
        name: US.name
      },
      after: {
        groupIds: plan.union,
        name: 'Engineering'
      },
      entry: null,
      actor: {
        kind: 'unavailable',
        reason: 'failed'
      }
    });
    return <>
        <DuplicatesRung {...args} />
        <VerbRunner basket={EMPTY_BASKET} run={runAt({
        stage: 'results',
        outcome: {
          ...outcome,
          followUps: [{
            id: 'retry-retire',
            label: retryFollowUpLabel(['Engineering - APAC']),
            tone: 'primary',
            icon: 'refresh',
            run: fn()
          }]
        }
      })} />
      </>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Engineering - APAC is not retired/)).toBeInTheDocument();
    const dialog = within(within(canvasElement.ownerDocument.body).getByRole('dialog'));
    await expect(dialog.getByText(/Okta refused to retire it/)).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Retry retiring Engineering - APAC'
    })).toBeInTheDocument();
  }
}`,...B.parameters?.docs?.source},description:{story:`A partial result: the kept rule was saved and one rule retired, but Okta
refused the other. The results say which, and offer to retry only that rule;
the rung's summary names the rule still to retire.`,...B.parameters?.docs?.description}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    sets: []
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No duplicate rules')).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source},description:{story:"Nothing shares a condition: the rung says so.",...A.parameters?.docs?.description}}};const be=["MergeableAndNot","KeepAnotherRule","RenameOpen","InvalidNameEmpty","InvalidNameTooLong","InvalidNameTaken","ReadOnly","Merged","MergeConfirm","PartialResult","NoDuplicates"];export{y as InvalidNameEmpty,w as InvalidNameTaken,E as InvalidNameTooLong,p as KeepAnotherRule,R as MergeConfirm,g as MergeableAndNot,h as Merged,A as NoDuplicates,B as PartialResult,v as ReadOnly,d as RenameOpen,be as __namedExportsOrder,Ae as default};
