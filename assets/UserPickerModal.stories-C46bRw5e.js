import{U as m}from"./UserPickerModal-Bowp8-d3.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./userDisplay-xpx41Abi.js";const{expect:p,fn:r,within:u}=__STORYBOOK_MODULE_TEST__;function i(e,a,l){return{id:e,status:"ACTIVE",profile:{login:`${a.toLowerCase()}@example.com`,email:`${a.toLowerCase()}@example.com`,firstName:a,lastName:l}}}const d=[i("00uFAKE1","Ada","Lovelace"),i("00uFAKE2","Grace","Hopper")],c=(e={})=>({isOpen:!0,open:r(),close:r(),query:"",setQuery:r(),results:[],isSearching:!1,searchError:null,pick:r(),...e}),k={title:"Qualification/UserPickerModal",component:m,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"Pick one user by type-ahead and hand them back. Selecting a row is the whole action — no confirm, no selected chip. The row is never evaluated: the caller loads the whole user afterwards."}}},args:{title:"Evaluate user",hint:"Reads the user and their groups — two requests, writes nothing."}},n={args:{picker:c()},play:async({canvasElement:e})=>{const a=u(e.ownerDocument.body);await p(a.getByRole("dialog",{name:"Evaluate user"})).toBeInTheDocument()}},s={args:{picker:c({query:"ada",isSearching:!0})}},t={args:{picker:c({query:"a",results:d})},play:async({canvasElement:e})=>{const a=u(e.ownerDocument.body);await p(a.getByText("Grace Hopper")).toBeInTheDocument()}},o={args:{picker:c({query:"ada",searchError:"User search failed."})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker()
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('dialog', {
      name: 'Evaluate user'
    })).toBeInTheDocument();
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker({
      query: 'ada',
      isSearching: true
    })
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker({
      query: 'a',
      results
    })
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByText('Grace Hopper')).toBeInTheDocument();
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    picker: picker({
      query: 'ada',
      searchError: 'User search failed.'
    })
  }
}`,...o.parameters?.docs?.source}}};const E=["Empty","Searching","WithResults","SearchFailed"];export{n as Empty,o as SearchFailed,s as Searching,t as WithResults,E as __namedExportsOrder,k as default};
