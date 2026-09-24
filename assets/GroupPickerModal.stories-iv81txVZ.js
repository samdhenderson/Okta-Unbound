import{G as p}from"./GroupPickerModal-DNDwvRAy.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";const{expect:c,fn:n,within:i}=__STORYBOOK_MODULE_TEST__,m=[{id:"00gFAKE1",name:"Engineering",description:"",type:"OKTA_GROUP"},{id:"00gFAKE2",name:"Engineering Leads",description:"",type:"OKTA_GROUP"}],o=(e={})=>({isOpen:!0,open:n(),close:n(),query:"",setQuery:n(),results:[],isSearching:!1,searchError:null,pick:n(),...e}),g={title:"Qualification/GroupPickerModal",component:p,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:`Pick one group by type-ahead and hand it back. Nothing is filtered out: a group the user already holds is a real answer to "why isn't this user a member?".`}}},args:{title:"Check membership",hint:"Pick a group; every rule feeding it is assessed against this user."}},r={args:{picker:o()},play:async({canvasElement:e})=>{const t=i(e.ownerDocument.body);await c(t.getByRole("dialog",{name:"Check membership"})).toBeInTheDocument()}},a={args:{picker:o({query:"eng",results:m})},play:async({canvasElement:e})=>{const t=i(e.ownerDocument.body);await c(t.getByText("Engineering Leads")).toBeInTheDocument()}},s={args:{picker:o({query:"eng",searchError:"Group search failed."})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker()
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', {
      name: 'Check membership'
    })).toBeInTheDocument();
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker({
      query: 'eng',
      results
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('Engineering Leads')).toBeInTheDocument();
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker({
      query: 'eng',
      searchError: 'Group search failed.'
    })
  }
}`,...s.parameters?.docs?.source}}};const h=["Empty","WithResults","SearchFailed"];export{r as Empty,s as SearchFailed,a as WithResults,h as __namedExportsOrder,g as default};
