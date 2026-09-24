import{j as r,R as A}from"./iframe-mmN7AxbW.js";import{P as E}from"./PathCombobox-Bccrtu0U.js";import"./preload-helper-PPVm8Dsz.js";import"./paletteRowStyles-ldxw9afL.js";const{expect:a,userEvent:s,within:o,fn:B,waitFor:b}=__STORYBOOK_MODULE_TEST__,R=[{kind:"group",id:"00gFAKE000000000001",label:"Engineering",source:"tab"},{kind:"group",id:"00gFAKE000000000002",label:"Engineering Leads",secondary:"Rule-fed",source:"snapshot"},{kind:"group",id:"00gFAKE000000000003",label:"Support",source:"search"}],c=({initial:n="",candidates:t})=>{const[e,i]=A.useState(n);return r.jsx("div",{className:"p-4 w-[420px]",children:r.jsx(E,{value:e,onChange:i,onSend:B(),canSend:!0,placeholder:"/api/v1/apps",candidates:t})})},k={title:"Explorer/PathCombobox",component:E,parameters:{layout:"centered"},args:{value:"",onChange:B(),onSend:B(),canSend:!0}},l={render:()=>r.jsx(c,{initial:"/api/v1/users"}),play:async({canvasElement:n})=>{const t=o(n);await a(t.getByRole("combobox",{name:"API path"})).toHaveAttribute("aria-expanded","false"),await a(t.queryByRole("listbox")).not.toBeInTheDocument()}},p={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n);await s.click(t.getByRole("combobox",{name:"API path"}));const e=await t.findByRole("listbox",{name:"Path suggestions"});await a(o(e).getByText("Users")).toBeInTheDocument(),await a(o(e).getAllByRole("option").length).toBeGreaterThan(5)}},d={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/groups/rules");const i=o(await t.findByRole("listbox")).getAllByRole("option");await a(i[0]).toHaveTextContent("/api/v1/groups/rules"),await a(e).toHaveFocus()}},u={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/groups"),await s.keyboard("{ArrowDown}");const i=o(await t.findByRole("listbox")).getAllByRole("option");await a(e).toHaveAttribute("aria-activedescendant",i[1].id),await a(i[1]).toHaveAttribute("aria-selected","true"),await a(e).toHaveFocus(),await s.keyboard("{End}"),await a(e).toHaveAttribute("aria-activedescendant",i[i.length-1].id)}},y={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const e=o(n).getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/groups/rul"),await s.keyboard("{Enter}"),await b(()=>a(e).toHaveValue("/api/v1/groups/rules"))}},m={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const e=o(n).getByRole("combobox",{name:"API path"});await s.type(e,"factors"),await s.keyboard("{Enter}"),await b(()=>a(e.value.slice(e.selectionStart??0,e.selectionEnd??0)).toBe("{userId}"))}},v={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/logs?");const i=await t.findByRole("listbox");await a(o(i).getByText("Paging")).toBeInTheDocument(),await a(o(i).getByText("limit")).toBeInTheDocument()}},w={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/gr"),await s.keyboard("{Escape}"),await b(()=>a(t.queryByRole("listbox")).not.toBeInTheDocument()),await a(e).toHaveValue("/api/v1/gr"),await s.keyboard("{Alt>}{ArrowDown}{/Alt}"),await a(await t.findByRole("listbox")).toBeInTheDocument()}},h={render:()=>r.jsx(c,{}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/logs");const i=await t.findByRole("listbox");await s.click(o(i).getAllByRole("option")[0]),await b(()=>a(e).toHaveValue("/api/v1/logs"))}},g={render:()=>r.jsx(c,{candidates:R}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/groups/Eng");const i=await t.findByRole("listbox");await a(o(i).getByText("The page you have open")).toBeInTheDocument();const f=o(i).getAllByRole("option");await a(f[0]).toHaveTextContent("Engineering"),await a(f[0]).toHaveTextContent("Open in your tab"),await s.keyboard("{Enter}"),await b(()=>a(e).toHaveValue("/api/v1/groups/00gFAKE000000000001"))}},x={render:()=>r.jsx(c,{candidates:[]}),play:async({canvasElement:n})=>{const t=o(n),e=t.getByRole("combobox",{name:"API path"});await s.type(e,"/api/v1/groups/zzz"),await a(t.queryByRole("listbox")).not.toBeInTheDocument(),await a(e).toHaveAttribute("aria-expanded","false")}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <Host initial="/api/v1/users" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('combobox', {
      name: 'API path'
    })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
  }
}`,...l.parameters?.docs?.source},description:{story:"Closed on arrival. A list that opens itself covers the page nobody asked it to.",...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('combobox', {
      name: 'API path'
    }));
    const listbox = await canvas.findByRole('listbox', {
      name: 'Path suggestions'
    });
    await expect(within(listbox).getByText('Users')).toBeInTheDocument();
    await expect(within(listbox).getAllByRole('option').length).toBeGreaterThan(5);
  }
}`,...p.parameters?.docs?.source},description:{story:"Focusing an empty field browses the whole catalog, under its headings.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/groups/rules');
    const options = within(await canvas.findByRole('listbox')).getAllByRole('option');
    await expect(options[0]).toHaveTextContent('/api/v1/groups/rules');
    // Focus stayed in the field: the caret is the suggester's only input.
    await expect(field).toHaveFocus();
  }
}`,...d.parameters?.docs?.source},description:{story:"Typing narrows to what matches, and the first row is pointed at, not focused.",...d.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/groups');
    await userEvent.keyboard('{ArrowDown}');
    const options = within(await canvas.findByRole('listbox')).getAllByRole('option');
    await expect(field).toHaveAttribute('aria-activedescendant', options[1].id);
    await expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(field).toHaveAttribute('aria-activedescendant', options[options.length - 1].id);
  }
}`,...u.parameters?.docs?.source},description:{story:"Arrow keys move the active descendant while focus stays put.",...u.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/groups/rul');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field).toHaveValue('/api/v1/groups/rules'));
  }
}`,...y.parameters?.docs?.source},description:{story:"Enter accepts while the list is open — it does not send.",...y.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    }) as HTMLInputElement;
    // Typed as a word rather than as a path: \`{\` is userEvent's own escape
    // character, and the point of the story is what the field does with the hole.
    await userEvent.type(field, 'factors');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field.value.slice(field.selectionStart ?? 0, field.selectionEnd ?? 0)).toBe('{userId}'));
  }
}`,...m.parameters?.docs?.source},description:{story:"A path with a hole leaves that hole selected, so the next keystroke replaces it.",...m.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/logs?');
    const listbox = await canvas.findByRole('listbox');
    await expect(within(listbox).getByText('Paging')).toBeInTheDocument();
    await expect(within(listbox).getByText('limit')).toBeInTheDocument();
  }
}`,...v.parameters?.docs?.source},description:{story:"After a `?`, the list turns into this endpoint's parameters.",...v.parameters?.docs?.description}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/gr');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument());
    await expect(field).toHaveValue('/api/v1/gr');

    // Alt+Down brings it back, which is the standard way back into a closed list.
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(await canvas.findByRole('listbox')).toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source},description:{story:"Escape closes the list and keeps every character that was typed.",...w.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <Host />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/logs');
    const listbox = await canvas.findByRole('listbox');
    await userEvent.click(within(listbox).getAllByRole('option')[0]);
    await waitFor(() => expect(field).toHaveValue('/api/v1/logs'));
  }
}`,...h.parameters?.docs?.source},description:{story:"Clicking a row accepts it, even though the click lands after a blur would.",...h.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Host candidates={GROUP_CANDIDATES} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });

    // Past the last segment the catalog could still be completing, the field is
    // standing in \`{groupId}\` and offers ids instead of paths.
    await userEvent.type(field, '/api/v1/groups/Eng');
    const listbox = await canvas.findByRole('listbox');
    await expect(within(listbox).getByText('The page you have open')).toBeInTheDocument();
    const options = within(listbox).getAllByRole('option');
    await expect(options[0]).toHaveTextContent('Engineering');
    await expect(options[0]).toHaveTextContent('Open in your tab');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field).toHaveValue('/api/v1/groups/00gFAKE000000000001'));
  }
}`,...g.parameters?.docs?.source},description:{story:`A hole offers ids, cheapest source first: the tab you have open, then the org
snapshot, then a search that costs a request.`,...g.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Host candidates={[]} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('combobox', {
      name: 'API path'
    });
    await userEvent.type(field, '/api/v1/groups/zzz');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(field).toHaveAttribute('aria-expanded', 'false');
  }
}`,...x.parameters?.docs?.source},description:{story:"No candidates found is an empty list, not a claim that the org has none.",...x.parameters?.docs?.description}}};const S=["Closed","BrowsingOnFocus","NarrowingByPath","PointingWithArrows","AcceptingWithEnter","SelectingTheFirstHole","SuggestingParameters","EscapeClosesWithoutClearing","AcceptingWithTheMouse","FillingAHole","AHoleWithNothingFound"];export{x as AHoleWithNothingFound,y as AcceptingWithEnter,h as AcceptingWithTheMouse,p as BrowsingOnFocus,l as Closed,w as EscapeClosesWithoutClearing,g as FillingAHole,d as NarrowingByPath,u as PointingWithArrows,m as SelectingTheFirstHole,v as SuggestingParameters,S as __namedExportsOrder,k as default};
