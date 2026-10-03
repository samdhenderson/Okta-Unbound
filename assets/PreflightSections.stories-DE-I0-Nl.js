import{P as g}from"./PreflightSections-DS2OyTQC.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";const{expect:s,within:t}=__STORYBOOK_MODULE_TEST__,p={title:"Selection/run/PreflightSections",component:g,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"Rendered by `VerbRunner` under the preflight lines when a verb declares `VerbPreflight.sections`. Each row is a `ListRow`: `tone` paints the staged change and `badge` says it, because colour alone is not announced. A row with no name shows its id in mono and states that no name was loaded."}}},argTypes:{sections:{description:"The sections, in reading order. Empty renders nothing."}},args:{sections:[]}},e={args:{sections:[{id:"targets",heading:"Target groups",rows:[{id:"00gFAKE0000000000001",label:"Engineering - All"},{id:"00gFAKE0000000000002",label:"Contractors"},{id:"00gFAKE0000000000003",label:"Engineering Managers",tone:"added",badge:"New"}]},{id:"retire",heading:"Retiring 1 rule",rows:[{id:"0prFAKE0000000000003",label:"Engineering - EU"}],note:"People Engineering - EU added stay in their groups; Engineering - US now adds them."}]},play:async({canvasElement:r})=>{const o=t(r).getByRole("region",{name:"Target groups"});await s(t(o).getAllByRole("listitem")).toHaveLength(3),await s(t(o).getByText("New")).toBeVisible()}},n={args:{sections:[{id:"targets",heading:"Target groups",rows:[{id:"00gFAKE0000000000001",label:"Engineering - All"},{id:"00gFAKE0000000000009",tone:"added",badge:"New"}]}]},play:async({canvasElement:r})=>{const i=t(r);await s(i.getByText("00gFAKE0000000000009")).toBeVisible(),await s(i.getByText(/no name loaded/)).toBeVisible()}},a={args:{sections:[{id:"targets",heading:"Target groups",rows:[{id:"00gFAKE0000000000001",label:"Engineering - All"},{id:"00gFAKE0000000000002",label:"Contractors",tone:"removed",badge:"Removed"}]}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      id: 'targets',
      heading: 'Target groups',
      rows: [{
        id: '00gFAKE0000000000001',
        label: 'Engineering - All'
      }, {
        id: '00gFAKE0000000000002',
        label: 'Contractors'
      }, {
        id: '00gFAKE0000000000003',
        label: 'Engineering Managers',
        tone: 'added',
        badge: 'New'
      }]
    }, {
      id: 'retire',
      heading: 'Retiring 1 rule',
      rows: [{
        id: '0prFAKE0000000000003',
        label: 'Engineering - EU'
      }],
      note: 'People Engineering - EU added stay in their groups; Engineering - US now adds them.'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const targets = canvas.getByRole('region', {
      name: 'Target groups'
    });
    await expect(within(targets).getAllByRole('listitem')).toHaveLength(3);
    await expect(within(targets).getByText('New')).toBeVisible();
  }
}`,...e.parameters?.docs?.source},description:{story:"A merge's confirm: the kept rule's groups with the one it gains, then the rule it retires.",...e.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      id: 'targets',
      heading: 'Target groups',
      rows: [{
        id: '00gFAKE0000000000001',
        label: 'Engineering - All'
      }, {
        id: '00gFAKE0000000000009',
        tone: 'added',
        badge: 'New'
      }]
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('00gFAKE0000000000009')).toBeVisible();
    await expect(canvas.getByText(/no name loaded/)).toBeVisible();
  }
}`,...n.parameters?.docs?.source},description:{story:"A target this view has no name for: the id, in mono, and the absence said.",...n.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    sections: [{
      id: 'targets',
      heading: 'Target groups',
      rows: [{
        id: '00gFAKE0000000000001',
        label: 'Engineering - All'
      }, {
        id: '00gFAKE0000000000002',
        label: 'Contractors',
        tone: 'removed',
        badge: 'Removed'
      }]
    }]
  }
}`,...a.parameters?.docs?.source},description:{story:"A removal: struck through and badged, so it is said as well as painted.",...a.parameters?.docs?.description}}};const m=["MergeDiff","UnnamedRow","Removal"];export{e as MergeDiff,a as Removal,n as UnnamedRow,m as __namedExportsOrder,p as default};
