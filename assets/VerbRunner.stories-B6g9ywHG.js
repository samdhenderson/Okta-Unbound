import{V as A}from"./VerbRunner-C8BUgmCE.js";import{R as k}from"./types-UQE3j1TH.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./AttributeSpreadBar-B3qIP1Se.js";import"./chartPalette-Byit8206.js";import"./memberAnalytics-tPH-giHi.js";import"./BreakdownReport-DLC4-fAg.js";import"./PreflightSections-DS2OyTQC.js";import"./RunSteps-B3-vvI0R.js";import"./costSentence-BaIgeJiz.js";import"./csvUtils-DgNWYp8m.js";const{expect:n,fn:l,userEvent:E,within:o}=__STORYBOOK_MODULE_TEST__,S={picked:[{kind:"group",id:"00gFAKE0001",name:"Payments Team",pickedAt:17e11},{kind:"group",id:"00gFAKE0002",name:"Contractors",pickedAt:1700000000001}]},i={id:"remove-inactive-members",label:"Remove inactive members",title:"Remove deactivated, suspended and locked-out members from these groups",path:"write",needs:["group"],cost:()=>({requests:0,walks:[{count:2,kind:"membership"}],writes:0}),run:async()=>({status:"done",summary:"Done."})},D={id:"group-overlap",label:"Members these groups share",title:"Report which members these groups share",path:"read",needs:["group"],cost:()=>({requests:2,writes:0}),run:async()=>({status:"done",summary:"Done."})},C={id:"edit-rule-targets",label:"Save groups",title:"Edit target groups",path:"write",needs:[],confirmTone:"primary",reversal:"You can undo this from the results, or later by editing the groups back.",cost:()=>({requests:1,writes:0}),run:async()=>({status:"done",summary:"Done."})},s=t=>({verb:i,stage:"confirm",preflight:null,progress:"",steps:[],outcome:null,error:null,fields:[],values:{},setValue:l(),isComposed:!0,isRefreshing:!1,submitFields:l(),start:l(),confirm:l(),close:l(),...t}),G={title:"Selection/run/VerbRunner",component:A,tags:["autodocs"],parameters:{layout:"centered",docs:{description:{component:"Measure → confirm → run → report, in a shared `Modal`. For a `write` verb the confirm body is the preflight’s own measured lines above the exact cost of the run those lines authorise — a confirm never quotes a projection.\n\nPast the write cap the run refuses **whole**: it never truncates to fit, because a truncated run would leave Okta holding a change nobody chose while every count on screen still read as complete. The control that would proceed is omitted, not disabled."}}},args:{basket:S,run:s({})}},c={args:{run:s({stage:"idle",verb:null})},play:async({canvasElement:t})=>{const a=o(t);await n(a.queryByRole("dialog")).not.toBeInTheDocument()}},u={args:{run:s({stage:"measuring",progress:"Counting inactive members (1/2)"})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"Measuring first"}));await n(e.getByText("Counting inactive members (1/2)")).toBeInTheDocument(),await n(e.queryByRole("button",{name:i.label})).not.toBeInTheDocument()}},d={args:{run:s({preflight:{cost:{requests:14,walks:[{count:2,kind:"membership"}],writes:12},items:12,lines:["Payments Team — 9 of 340 members are deactivated, suspended or locked out","Contractors — 3 of 28 members are deactivated, suspended or locked out"]}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:i.title}));await n(e.getByText(/Payments Team — 9 of 340/)).toBeInTheDocument(),await n(e.getByText("Takes 14 requests and 2 membership walks. Changes 12 entities in Okta.")).toBeInTheDocument(),await n(e.getByText(/cannot be undone from here/)).toBeInTheDocument(),await n(e.getByRole("button",{name:i.label})).toBeInTheDocument()}},m={args:{run:s({verb:D})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:D.title}));await n(e.getByText("Takes 2 requests.")).toBeInTheDocument(),await n(e.queryByText(/cannot be undone/)).not.toBeInTheDocument()}},g={args:{run:s({preflight:{cost:{requests:1200,writes:1200},items:1200,lines:[],refusal:{code:"over-write-cap",message:`This would change 1,200 entities, past the ${k.toLocaleString()} one run may change. Nothing has been changed. Narrow the selection and run it again.`}}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:i.title}));await n(e.getByText(/past the 1,000 one run may change/)).toBeInTheDocument(),await n(e.queryByRole("button",{name:i.label})).not.toBeInTheDocument(),await n(e.getByRole("button",{name:"Cancel"})).toBeInTheDocument()}},p={args:{run:s({preflight:{cost:{requests:0,writes:0},items:0,lines:[]}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:i.title}));await n(e.getByText(/Running it would change nothing/)).toBeInTheDocument(),await n(e.queryByRole("button",{name:i.label})).not.toBeInTheDocument()}},h={args:{run:s({stage:"running",progress:"Cleaning Payments Team (1/2)"})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"Running"}));await n(e.getByText(/does not stop the run/)).toBeInTheDocument(),await n(e.getByText("Cleaning Payments Team (1/2)")).toBeInTheDocument()}},y={args:{run:s({stage:"results",outcome:{status:"done",summary:"Removed 12 members from 2 groups.",detail:{filenameStem:"inactive-members-removed",headers:["Group","Outcome"],rows:[["Payments Team","success"],["Contractors","success"]]}}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"What happened"}));await n(e.getByText("Removed 12 members from 2 groups.")).toBeInTheDocument(),await n(e.getByText("2 rows are available as a CSV.")).toBeInTheDocument(),await n(e.getByRole("button",{name:"Download CSV"})).toBeInTheDocument()}},w={args:{run:s({stage:"results",error:"The org refused the request."})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"The run stopped"}));await n(e.getByText("The org refused the request.")).toBeInTheDocument(),await n(e.queryByRole("button",{name:"Download CSV"})).not.toBeInTheDocument()}},b={args:{run:s({stage:"compose",isComposed:!1,fields:[{id:"attribute",label:"Attribute",options:[{value:"department",label:"Department"},{value:"title",label:"Title"}]},{id:"value",label:"New value",help:"Written to every ticked user."}]})},play:async({canvasElement:t,args:a})=>{const e=o(t),r=o(e.getByRole("dialog",{name:i.title}));await n(r.getByRole("combobox",{name:"Attribute"})).toBeInTheDocument(),await n(r.getByLabelText("New value")).toBe(r.getByRole("textbox",{name:"New value"})),await n(r.queryByRole("button",{name:"Continue"})).not.toBeInTheDocument(),await E.selectOptions(r.getByRole("combobox",{name:"Attribute"}),"title"),await n(a.run.setValue).toHaveBeenCalledWith("attribute","title")}},v={args:{run:s({stage:"compose",isComposed:!1,isRefreshing:!0,fields:[{id:"attribute",label:"Attribute",refreshesFields:!0,options:[{value:"department",label:"Department"},{value:"headcount",label:"Headcount"}]},{id:"value",label:"New Headcount",control:"number",placeholder:"A number"}],values:{attribute:"headcount"}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:i.title}));await n(e.getByRole("spinbutton",{name:"New Headcount"})).toBeInTheDocument(),await n(e.getByText("Reading what that attribute accepts…")).toBeInTheDocument(),await n(e.queryByRole("button",{name:"Continue"})).not.toBeInTheDocument()}},B={args:{run:s({stage:"compose",isComposed:!0,fields:[{id:"attribute",label:"Attribute",refreshesFields:!0,optionLayout:"list",help:"Only attributes this org lets the app write are listed.",options:[{value:"department",label:"Department",summary:"3 values · 1 empty",distribution:[{value:"Marketing",label:"Marketing",count:7,pct:58.3},{value:"Sales",label:"Sales",count:4,pct:33.3},{value:"__none__",label:"(none)",count:1,pct:8.3}]},{value:"costCenter",label:"Cost centre",summary:"1 value · 10 empty",distribution:[{value:"CC-100",label:"CC-100",count:2,pct:16.7},{value:"__none__",label:"(none)",count:10,pct:83.3}]}]},{id:"value",label:"New Department",placeholder:"The value every ticked user will hold",distribution:[{value:"Marketing",label:"Marketing",count:7,pct:58.3},{value:"Sales",label:"Sales",count:4,pct:33.3},{value:"__none__",label:"(none)",count:1,pct:8.3}]}],values:{attribute:"department",value:"Advertising"}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:i.title})),r=e.getByRole("radio",{name:/Department/});await n(r).toBeChecked(),await n(e.getByRole("radio",{name:/Cost centre/})).not.toBeChecked(),await n(e.getByText("3 values · 1 empty")).toBeInTheDocument(),await n(e.getAllByText("Marketing").length).toBeGreaterThan(0);for(const I of e.getAllByText("(none)"))await n(I.closest("button")).toBeDisabled();await n(e.getByRole("textbox",{name:"New Department"})).toHaveValue("Advertising"),await n(e.getByRole("button",{name:"Continue"})).toBeInTheDocument()}},T={args:{run:s({verb:C,preflight:{cost:{requests:3,writes:1},items:1,lines:["Engineering Managers is added. Everyone this rule matches will be added to it.","Contractors is removed. People this rule added to Contractors are removed from it.","This rule pauses while its groups are saved. Users who are new or changed in that time aren’t evaluated until it resumes."]}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:C.title}));await n(e.getByText("Takes 3 requests. Changes 1 entity in Okta.")).toBeInTheDocument(),await n(e.getByText(/You can undo this from the results/)).toBeInTheDocument(),await n(e.queryByText(/cannot be undone/)).not.toBeInTheDocument(),await n(e.getByRole("button",{name:"Save groups"})).toBeInTheDocument()}},R={args:{run:s({verb:C,stage:"running",steps:[{id:"pause",label:"Paused 0prFAKE0000000000002",status:"done"},{id:"save",label:"Saving 3 target groups…",status:"active"},{id:"resume",label:"Resume — starts after the save",status:"waiting"}]})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"Running"})),r=e.getAllByRole("listitem");await n(r).toHaveLength(3),await n(r[0]).toHaveTextContent("Done: Paused 0prFAKE0000000000002"),await n(r[1]).toHaveTextContent("In progress: Saving 3 target groups…"),await n(r[2]).toHaveTextContent("Waiting: Resume — starts after the save"),await n(e.getByText(/does not stop the run/)).toBeInTheDocument()}},f={args:{run:s({verb:C,stage:"results",outcome:{status:"done",summary:"Saved 3 target groups on Engineering by department.",lines:["1 group added: Engineering Managers.","1 group removed: Contractors.","The rule is Active again."],followUps:[{id:"undo",label:"Undo",tone:"secondary",icon:"refresh",run:l()}]}})},play:async({canvasElement:t,args:a})=>{const e=o(t),r=o(e.getByRole("dialog",{name:"What happened"}));await n(r.getByText("1 group added: Engineering Managers.")).toBeInTheDocument(),await E.click(r.getByRole("button",{name:"Undo"})),await n(a.run.outcome?.followUps?.[0].run).toHaveBeenCalledTimes(1),await n(r.getByRole("button",{name:"Close"})).toBeInTheDocument()}},x={args:{run:s({verb:{...C,label:"Merge and retire 1 rule",confirmTone:"danger"},stage:"results",outcome:{status:"partly-done",summary:"Engineering by department now has 4 target groups.",lines:["Engineering (legacy): retirement unknown. Okta didn’t confirm it."],followUps:[{id:"retry-retire",label:"Retry retiring Engineering (legacy)",tone:"primary",run:l()}]}})},play:async({canvasElement:t})=>{const a=o(t),e=o(a.getByRole("dialog",{name:"What happened"}));await n(e.getByRole("button",{name:"Retry retiring Engineering (legacy)"})).toBeInTheDocument(),await n(e.getByRole("button",{name:"Close"})).toBeInTheDocument()}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'idle',
      verb: null
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source},description:{story:"Nothing is running — the surface renders nothing at all.",...c.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'measuring',
      progress: 'Counting inactive members (1/2)'
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'Measuring first'
    }));
    await expect(dialog.getByText('Counting inactive members (1/2)')).toBeInTheDocument();
    await expect(dialog.queryByRole('button', {
      name: CLEANUP.label
    })).not.toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source},description:{story:"The measurement is out. Nothing is offered while it is.",...u.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      preflight: {
        cost: {
          requests: 14,
          walks: [{
            count: 2,
            kind: 'membership' as const
          }],
          writes: 12
        },
        items: 12,
        lines: ['Payments Team — 9 of 340 members are deactivated, suspended or locked out', 'Contractors — 3 of 28 members are deactivated, suspended or locked out']
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));
    await expect(dialog.getByText(/Payments Team — 9 of 340/)).toBeInTheDocument();
    await expect(dialog.getByText('Takes 14 requests and 2 membership walks. Changes 12 entities in Okta.')).toBeInTheDocument();
    // Never "you can undo this": the bulk membership writes are declared
    // un-undoable, with reasons, in \`hooks/useUndoAction\`.
    await expect(dialog.getByText(/cannot be undone from here/)).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: CLEANUP.label
    })).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:"The confirm quotes what the preflight counted, and says the change cannot be undone here.",...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      verb: REPORT
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: REPORT.title
    }));
    await expect(dialog.getByText('Takes 2 requests.')).toBeInTheDocument();
    await expect(dialog.queryByText(/cannot be undone/)).not.toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source},description:{story:"A read verb states its cost and carries no destructive warning.",...m.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      preflight: {
        cost: {
          requests: 1200,
          writes: 1200
        },
        items: 1200,
        lines: [],
        refusal: {
          code: 'over-write-cap',
          message: \`This would change 1,200 entities, past the \${RUN_WRITE_CAP.toLocaleString()} one run may change. Nothing has been changed. Narrow the selection and run it again.\`
        }
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));
    await expect(dialog.getByText(/past the 1,000 one run may change/)).toBeInTheDocument();
    await expect(dialog.queryByRole('button', {
      name: CLEANUP.label
    })).not.toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Cancel'
    })).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source},description:{story:`Past the cap. The refusal is stated and the control that would proceed is
**omitted** — the assertion that would catch a regression to a disabled
button, or worse, a truncated run.`,...g.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      preflight: {
        cost: {
          requests: 0,
          writes: 0
        },
        items: 0,
        lines: []
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));
    await expect(dialog.getByText(/Running it would change nothing/)).toBeInTheDocument();
    await expect(dialog.queryByRole('button', {
      name: CLEANUP.label
    })).not.toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Nothing in the selection needs it — an outcome, not a failure, and no run is offered.",...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'running',
      progress: 'Cleaning Payments Team (1/2)'
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'Running'
    }));
    await expect(dialog.getByText(/does not stop the run/)).toBeInTheDocument();
    await expect(dialog.getByText('Cleaning Payments Team (1/2)')).toBeInTheDocument();
  }
}`,...h.parameters?.docs?.source},description:{story:"Mid-run: closing the dialog does not stop the run, and the body says so.",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'results',
      outcome: {
        status: 'done',
        summary: 'Removed 12 members from 2 groups.',
        detail: {
          filenameStem: 'inactive-members-removed',
          headers: ['Group', 'Outcome'],
          rows: [['Payments Team', 'success'], ['Contractors', 'success']]
        }
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'What happened'
    }));
    await expect(dialog.getByText('Removed 12 members from 2 groups.')).toBeInTheDocument();
    await expect(dialog.getByText('2 rows are available as a CSV.')).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Download CSV'
    })).toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source},description:{story:"The result, with the rows behind it offered as a CSV.",...y.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'results',
      error: 'The org refused the request.'
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'The run stopped'
    }));
    await expect(dialog.getByText('The org refused the request.')).toBeInTheDocument();
    await expect(dialog.queryByRole('button', {
      name: 'Download CSV'
    })).not.toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:"A thrown error is stated, not swallowed into a cheerful summary.",...w.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: false,
      fields: [{
        id: 'attribute',
        label: 'Attribute',
        options: [{
          value: 'department',
          label: 'Department'
        }, {
          value: 'title',
          label: 'Title'
        }]
      }, {
        id: 'value',
        label: 'New value',
        help: 'Written to every ticked user.'
      }]
    })
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));
    await expect(dialog.getByRole('combobox', {
      name: 'Attribute'
    })).toBeInTheDocument();
    // Named by its visible \`<label>\`, not by a duplicated \`aria-label\`: the
    // label-text query is what distinguishes the two.
    await expect(dialog.getByLabelText('New value')).toBe(dialog.getByRole('textbox', {
      name: 'New value'
    }));
    await expect(dialog.queryByRole('button', {
      name: 'Continue'
    })).not.toBeInTheDocument();
    await userEvent.selectOptions(dialog.getByRole('combobox', {
      name: 'Attribute'
    }), 'title');
    await expect(args.run.setValue).toHaveBeenCalledWith('attribute', 'title');
  }
}`,...b.parameters?.docs?.source},description:{story:"A verb that needs an answer asks for it, and withholds Continue until it has one.",...b.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: false,
      isRefreshing: true,
      fields: [{
        id: 'attribute',
        label: 'Attribute',
        refreshesFields: true,
        options: [{
          value: 'department',
          label: 'Department'
        }, {
          value: 'headcount',
          label: 'Headcount'
        }]
      }, {
        id: 'value',
        label: 'New Headcount',
        control: 'number',
        placeholder: 'A number'
      }],
      values: {
        attribute: 'headcount'
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));
    await expect(dialog.getByRole('spinbutton', {
      name: 'New Headcount'
    })).toBeInTheDocument();
    await expect(dialog.getByText('Reading what that attribute accepts…')).toBeInTheDocument();
    // Withheld, not disabled: against a form still being rebuilt there is no run
    // to offer.
    await expect(dialog.queryByRole('button', {
      name: 'Continue'
    })).not.toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:`The attribute picked decides what the value question is, so a numeric
attribute is answered in a numeric field — and while that is being worked out,
the form below is not yet the real form, which is said rather than left to a
control that changes under the reader.`,...v.parameters?.docs?.description}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      stage: 'compose',
      isComposed: true,
      fields: [{
        id: 'attribute',
        label: 'Attribute',
        refreshesFields: true,
        optionLayout: 'list',
        help: 'Only attributes this org lets the app write are listed.',
        options: [{
          value: 'department',
          label: 'Department',
          summary: '3 values · 1 empty',
          distribution: [{
            value: 'Marketing',
            label: 'Marketing',
            count: 7,
            pct: 58.3
          }, {
            value: 'Sales',
            label: 'Sales',
            count: 4,
            pct: 33.3
          }, {
            value: '__none__',
            label: '(none)',
            count: 1,
            pct: 8.3
          }]
        }, {
          value: 'costCenter',
          label: 'Cost centre',
          summary: '1 value · 10 empty',
          distribution: [{
            value: 'CC-100',
            label: 'CC-100',
            count: 2,
            pct: 16.7
          }, {
            value: '__none__',
            label: '(none)',
            count: 10,
            pct: 83.3
          }]
        }]
      }, {
        id: 'value',
        label: 'New Department',
        placeholder: 'The value every ticked user will hold',
        distribution: [{
          value: 'Marketing',
          label: 'Marketing',
          count: 7,
          pct: 58.3
        }, {
          value: 'Sales',
          label: 'Sales',
          count: 4,
          pct: 33.3
        }, {
          value: '__none__',
          label: '(none)',
          count: 1,
          pct: 8.3
        }]
      }],
      values: {
        attribute: 'department',
        value: 'Advertising'
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: CLEANUP.title
    }));

    // The picker is a real radio group, so the chosen attribute is announced and
    // not only painted.
    const chosen = dialog.getByRole('radio', {
      name: /Department/
    });
    await expect(chosen).toBeChecked();
    await expect(dialog.getByRole('radio', {
      name: /Cost centre/
    })).not.toBeChecked();

    // The spread is stated, for the attribute picked and for the ones not.
    await expect(dialog.getByText('3 values · 1 empty')).toBeInTheDocument();
    await expect(dialog.getAllByText('Marketing').length).toBeGreaterThan(0);

    // The distribution above the value control is a statement, not a control:
    // every one of its rows is inert.
    for (const row of dialog.getAllByText('(none)')) {
      await expect(row.closest('button')).toBeDisabled();
    }
    await expect(dialog.getByRole('textbox', {
      name: 'New Department'
    })).toHaveValue('Advertising');
    await expect(dialog.getByRole('button', {
      name: 'Continue'
    })).toBeInTheDocument();
  }
}`,...B.parameters?.docs?.source},description:{story:`The attribute question, asked as rows rather than a dropdown, because each
option carries the spread of what the ticked users hold for it now. That
spread is the thing the choice is actually about — a \`<select>\` could only
show the label, and would ask the reader to pick blind.

The chosen attribute's own distribution then renders above the value control,
inert: it states what is there, and nothing here filters against it.`,...B.parameters?.docs?.description}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      verb: EDIT_TARGETS,
      preflight: {
        cost: {
          requests: 3,
          writes: 1
        },
        items: 1,
        lines: ['Engineering Managers is added. Everyone this rule matches will be added to it.', 'Contractors is removed. People this rule added to Contractors are removed from it.', 'This rule pauses while its groups are saved. Users who are new or changed in that time aren’t evaluated until it resumes.']
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: EDIT_TARGETS.title
    }));
    await expect(dialog.getByText('Takes 3 requests. Changes 1 entity in Okta.')).toBeInTheDocument();
    await expect(dialog.getByText(/You can undo this from the results/)).toBeInTheDocument();
    await expect(dialog.queryByText(/cannot be undone/)).not.toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Save groups'
    })).toBeInTheDocument();
  }
}`,...T.parameters?.docs?.source},description:{story:`A reversible write. The confirm control is \`primary\`, and the verb's own
reversal sentence replaces the bulk writes' "cannot be undone" line.`,...T.parameters?.docs?.description}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      verb: EDIT_TARGETS,
      stage: 'running',
      steps: [{
        id: 'pause',
        label: 'Paused 0prFAKE0000000000002',
        status: 'done'
      }, {
        id: 'save',
        label: 'Saving 3 target groups…',
        status: 'active'
      }, {
        id: 'resume',
        label: 'Resume — starts after the save',
        status: 'waiting'
      }]
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'Running'
    }));
    const steps = dialog.getAllByRole('listitem');
    await expect(steps).toHaveLength(3);
    await expect(steps[0]).toHaveTextContent('Done: Paused 0prFAKE0000000000002');
    await expect(steps[1]).toHaveTextContent('In progress: Saving 3 target groups…');
    await expect(steps[2]).toHaveTextContent('Waiting: Resume — starts after the save');
    await expect(dialog.getByText(/does not stop the run/)).toBeInTheDocument();
  }
}`,...R.parameters?.docs?.source},description:{story:`A run that reports its steps: one line each, with a glyph for where it
stands — and each line says its status, so a done step and a waiting one do
not sound the same.`,...R.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      verb: EDIT_TARGETS,
      stage: 'results',
      outcome: {
        status: 'done',
        summary: 'Saved 3 target groups on Engineering by department.',
        lines: ['1 group added: Engineering Managers.', '1 group removed: Contractors.', 'The rule is Active again.'],
        followUps: [{
          id: 'undo',
          label: 'Undo',
          tone: 'secondary',
          icon: 'refresh',
          run: fn()
        }]
      }
    })
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'What happened'
    }));
    await expect(dialog.getByText('1 group added: Engineering Managers.')).toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', {
      name: 'Undo'
    }));
    await expect(args.run.outcome?.followUps?.[0].run).toHaveBeenCalledTimes(1);
    await expect(dialog.getByRole('button', {
      name: 'Close'
    })).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source},description:{story:"A clean run that can be reversed: the results offer Undo beside Close.",...f.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    run: runAt({
      verb: {
        ...EDIT_TARGETS,
        label: 'Merge and retire 1 rule',
        confirmTone: 'danger'
      },
      stage: 'results',
      outcome: {
        status: 'partly-done',
        summary: 'Engineering by department now has 4 target groups.',
        lines: ['Engineering (legacy): retirement unknown. Okta didn’t confirm it.'],
        followUps: [{
          id: 'retry-retire',
          label: 'Retry retiring Engineering (legacy)',
          tone: 'primary',
          run: fn()
        }]
      }
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dialog = within(canvas.getByRole('dialog', {
      name: 'What happened'
    }));
    await expect(dialog.getByRole('button', {
      name: 'Retry retiring Engineering (legacy)'
    })).toBeInTheDocument();
    await expect(dialog.getByRole('button', {
      name: 'Close'
    })).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source},description:{story:`A partial run: the retry is what the results are asking for, so it takes the
strip's one primary and Close steps down.`,...x.parameters?.docs?.description}}};const K=["Idle","Measuring","ConfirmAWrite","ConfirmARead","RefusedPastTheCap","NothingToDo","Running","Results","Failed","ComposeWithheldUntilAnswered","ComposeRebuildingTheValueQuestion","ComposeWithSpread","ConfirmAReversibleWrite","RunningWithSteps","ResultsWithUndo","ResultsWithRetry"];export{v as ComposeRebuildingTheValueQuestion,B as ComposeWithSpread,b as ComposeWithheldUntilAnswered,m as ConfirmARead,T as ConfirmAReversibleWrite,d as ConfirmAWrite,w as Failed,c as Idle,u as Measuring,p as NothingToDo,g as RefusedPastTheCap,y as Results,x as ResultsWithRetry,f as ResultsWithUndo,h as Running,R as RunningWithSteps,K as __namedExportsOrder,G as default};
