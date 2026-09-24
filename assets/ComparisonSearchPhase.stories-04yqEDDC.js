import{C as u}from"./ComparisonSearchPhase-BVx9REdg.js";import{m as a}from"./fixtures-CsAiPaTu.js";import"./iframe-mmN7AxbW.js";import"./preload-helper-PPVm8Dsz.js";import"./UserSearchResults-Bu3jwf5V.js";import"./useStaggerReveal-CSztixYY.js";import"./userDisplay-xpx41Abi.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";const{expect:n,fn:c,userEvent:p,within:d}=__STORYBOOK_MODULE_TEST__,m=a[0],Q={title:"Users/Comparison/ComparisonSearchPhase",component:u,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'Phase 1 of the comparison modal: a controlled search box and its matching results, with the context user filtered out so nobody can compare with themselves. It shows a "Searching directory…" indicator while a search is in flight and an empty state when a query returns no matches. Fully prop-driven; the parent hook owns the search.'}}},args:{contextUser:m,searchQuery:"",setSearchQuery:c(),isSearching:!1,searchResults:[],resultsTruncated:!1,onSelectUser:c()},argTypes:{resultsTruncated:{description:"Whether Okta held matches back from `searchResults`. It describes the page the search returned, so filtering the context user out of it does not change the answer."},contextUser:{description:"The context user; excluded from results so users can't compare with themselves."},searchQuery:{description:"Current search text (controlled)."},setSearchQuery:{description:"Updates the search text."},isSearching:{description:'When true, shows the "Searching directory…" indicator.'},searchResults:{description:"Raw search results; the context user is filtered out before rendering."},onSelectUser:{description:"Invoked with the chosen user to enter the comparison phase."}}},e={},s={args:{searchQuery:"smith",isSearching:!0}},t={args:{searchQuery:"user",searchResults:a.slice(0,8)},play:async({args:i,canvasElement:h})=>{const o=d(h);await n(o.queryByText("First1 Last1")).toBeNull(),await p.click(o.getByRole("button",{name:"Compare with this user",description:/First2 Last2/})),await n(i.onSelectUser).toHaveBeenCalledWith(a[1])}},r={args:{searchQuery:"zzzznomatch",searchResults:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source},description:{story:"Idle state: an empty query, so just the search box.",...e.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: 'smith',
    isSearching: true
  }
}`,...s.parameters?.docs?.source},description:{story:'Search in flight, showing the "Searching directory…" indicator.',...s.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: 'user',
    searchResults: mockUsers.slice(0, 8)
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // The context user is not offered as their own comparison partner.
    await expect(canvas.queryByText('First1 Last1')).toBeNull();
    // The row's overlay is named for the action; the user it acts on is its
    // accessible description.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Compare with this user',
      description: /First2 Last2/
    }));
    await expect(args.onSelectUser).toHaveBeenCalledWith(mockUsers[1]);
  }
}`,...t.parameters?.docs?.source},description:{story:"Query typed with matching results listed (context user filtered out).",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: 'zzzznomatch',
    searchResults: []
  }
}`,...r.parameters?.docs?.source},description:{story:"Query typed with no matches found.",...r.parameters?.docs?.description}}};const U=["Default","Searching","WithResults","Empty"];export{e as Default,r as Empty,s as Searching,t as WithResults,U as __namedExportsOrder,Q as default};
