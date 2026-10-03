import{j as l}from"./iframe-Pee757m_.js";import{C as p}from"./CollectionsPane-xScPZCRU.js";import{O as m}from"./OrgEntityIndexContext-BFom55Rl.js";import"./preload-helper-PPVm8Dsz.js";import"./CollectionsSection-VNHMTJ-s.js";import"./dateFormat-Db8QGh5_.js";import"./collectionStore-CxsCBgWH.js";import"./useOktaApi.mock-CyMgmY7X.js";import"./entityCache-DjpWgwt1.js";import"./usePoliciesData-BDVwvkFr.js";import"./keys-CD32im_j.js";import"./selectionStore-CJ3uIvus.js";import"./useOrgSnapshot-BCrwHhej.js";import"./orgSnapshotStore-o9TWva_3.js";import"./index-Dob3nYDb.js";import"./ruleUtils-D89ADPfb.js";const{expect:s,fn:c,within:r}=__STORYBOOK_MODULE_TEST__,d=Date.UTC(2026,2,5,9,30),i=[{id:"col-1",name:"Payments on-call",savedAt:d,rows:[{kind:"user",id:"00uFAKE0001",name:"Dana Example"},{kind:"group",id:"00gFAKE0001"}]},{id:"col-2",name:"App owners",savedAt:d,rows:[{kind:"app",id:"0oaFAKE0001"}]}],k={title:"Selection/panes/CollectionsPane",component:p,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The saved-collections list, plus the loader and the three outcomes a load can end in: a stated request cost to confirm before anything is spent, a refusal when the basket would pass its per-kind limit, and a refusal when a row cannot be named at all. A partial load is never landed — it would hand the next verb a smaller set than the one that was kept."}}},decorators:[e=>l.jsx(m,{oktaOrigin:null,targetTabId:null,enabled:!1,children:l.jsx(e,{})})],args:{query:"",addMany:c(()=>({basket:{picked:[]},added:0,alreadyPicked:0,refused:0})),onDelete:c(),onRename:c(async()=>({collections:i,saved:i[0]??null,refused:null}))}},a={args:{collections:i,isReading:!1},play:async({canvasElement:e})=>{const t=r(e);await s(t.getByText("Payments on-call")).toBeInTheDocument(),await s(t.getByText("App owners")).toBeInTheDocument(),await s(t.queryByText("No saved collections")).not.toBeInTheDocument()}},n={args:{collections:[],isReading:!1},play:async({canvasElement:e})=>{const t=r(e);await s(t.getByText("No saved collections")).toBeInTheDocument()}},o={args:{collections:[],isReading:!0},play:async({canvasElement:e})=>{const t=r(e);await s(t.queryByText("No saved collections")).not.toBeInTheDocument()}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    collections: TWO,
    isReading: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Payments on-call')).toBeInTheDocument();
    await expect(canvas.getByText('App owners')).toBeInTheDocument();
    await expect(canvas.queryByText('No saved collections')).not.toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source},description:{story:"The org has collections — each row names what it holds and offers Load.",...a.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    collections: [],
    isReading: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No saved collections')).toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source},description:{story:"Nothing saved, and the read has settled — the absence is stated.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    collections: [],
    isReading: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('No saved collections')).not.toBeInTheDocument();
  }
}`,...o.parameters?.docs?.source},description:{story:`The first read is still in flight. A list that has not been read yet is not
"no collections", so nothing is claimed either way — the assertion that would
catch a regression to an empty state shown over an unfinished read.`,...o.parameters?.docs?.description}}};const O=["WithCollections","NothingSaved","StillReading"];export{n as NothingSaved,o as StillReading,a as WithCollections,O as __namedExportsOrder,k as default};
