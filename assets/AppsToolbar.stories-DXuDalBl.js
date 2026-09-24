import{j as i,r as m}from"./iframe-mmN7AxbW.js";import{A as v}from"./AppsToolbar-CJBSu-b6.js";import{f as x}from"./appFilters-CTS9Q_fJ.js";import"./preload-helper-PPVm8Dsz.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:a,fn:y,userEvent:g,within:s}=__STORYBOOK_MODULE_TEST__,R={title:"Apps/AppsToolbar",component:v,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The Applications rung's search field beside its filter disclosure — the node the action strip renders in its `subRow`, so the field docks with the verbs and stays reachable at any scroll offset. The status, group-push and sort pills live in `AppsFilterPanel`, disclosed below the band by this row’s toggle.\n\nFully controlled: the query and the panel state belong to the rung, and the count on the toggle is the only trace of an applied filter once the panel is closed. The search box accepts a `/pattern/flags` regex query as well as a plain substring."}}},argTypes:{searchQuery:{description:"Current search text (`/pattern/flags` is treated as a regex)."},onSearchQueryChange:{description:"Called with the new search text."},filtersOpen:{description:"Whether the filter panel below the band is open."},onToggleFilters:{description:"Toggles that panel."},activeFilterCount:{description:"Number of axes away from their default; the toggle badge is hidden at 0."}},args:{searchQuery:"",onSearchQueryChange:y(),filtersOpen:!1,onToggleFilters:y(),activeFilterCount:0}},n={},o={args:{searchQuery:"sales"}},l={args:{searchQuery:"/^okta_/i"}},c={args:{filtersOpen:!0}},p={args:{activeFilterCount:2},play:async({canvasElement:r})=>{const e=s(r);await a(e.getByRole("button",{name:"Filters, 2 applied"})).toBeInTheDocument()}},A=[{id:"0oaFAKE0001",label:"Salesforce",status:"ACTIVE",created:"2026-01-15T09:00:00.000Z"},{id:"0oaFAKE0002",label:"Workday HR",status:"INACTIVE",created:"2026-03-01T09:00:00.000Z"},{id:"0oaFAKE0003",label:"Slack",status:"ACTIVE",created:"2025-11-20T09:00:00.000Z"}],d={render:r=>{const e=()=>{const[t,u]=m.useState(""),[b,f]=m.useState(!1),w=x(A,{searchQuery:t,statusFilter:"",groupsFilter:"",sortBy:"label",sortDesc:!1});return i.jsxs("div",{className:"space-y-(--sp-field)",children:[i.jsx(v,{...r,searchQuery:t,onSearchQueryChange:u,filtersOpen:b,onToggleFilters:()=>f(h=>!h)}),i.jsx("ul",{"aria-label":"Applications",className:"space-y-1 text-sm text-neutral-700",children:w.map(h=>i.jsx("li",{children:h.label},h.id))})]})};return i.jsx(e,{})},play:async({canvasElement:r})=>{const e=s(r),t=e.getByRole("list",{name:"Applications"});await a(s(t).getAllByRole("listitem")).toHaveLength(3),await g.type(e.getByLabelText("Search applications"),"sl"),await a(s(t).getAllByRole("listitem")).toHaveLength(1),await a(s(t).getByText("Slack")).toBeInTheDocument(),await g.clear(e.getByLabelText("Search applications")),await a(s(t).getAllByRole("listitem")).toHaveLength(3);const u=e.getByRole("button",{name:"Filters"});await g.click(u),await a(u).toHaveAttribute("aria-pressed","true")}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"{}",...n.parameters?.docs?.source},description:{story:"Empty field, panel closed, nothing applied.",...n.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: 'sales'
  }
}`,...o.parameters?.docs?.source},description:{story:"A plain substring search.",...o.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    searchQuery: '/^okta_/i'
  }
}`,...l.parameters?.docs?.source},description:{story:"A `/regex/` query — matched as a real RegExp, never evaluated.",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    filtersOpen: true
  }
}`,...c.parameters?.docs?.source},description:{story:"The panel is open — the toggle carries the open state.",...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    activeFilterCount: 2
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The badge digit is \`aria-hidden\`; the count reaches assistive tech by name.
    await expect(canvas.getByRole('button', {
      name: 'Filters, 2 applied'
    })).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Two axes applied with the panel closed: the badge is all that is left to say so.",...p.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const Harness = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [filtersOpen, setFiltersOpen] = useState(false);
      const visible = filterAndSortApps(harnessApps, {
        searchQuery,
        statusFilter: '',
        groupsFilter: '',
        sortBy: 'label',
        sortDesc: false
      });
      return <div className="space-y-(--sp-field)">
          <AppsToolbar {...args} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen(previous => !previous)} />
          <ul aria-label="Applications" className="space-y-1 text-sm text-neutral-700">
            {visible.map(app => <li key={app.id}>{app.label}</li>)}
          </ul>
        </div>;
    };
    return <Harness />;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', {
      name: 'Applications'
    });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await userEvent.type(canvas.getByLabelText('Search applications'), 'sl');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Slack')).toBeInTheDocument();
    await userEvent.clear(canvas.getByLabelText('Search applications'));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    const toggle = canvas.getByRole('button', {
      name: 'Filters'
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  }
}`,...d.parameters?.docs?.source},description:{story:`The row wired to real state over a three-app inventory, so typing narrows the
list beneath it and the toggle opens and closes.`,...d.parameters?.docs?.description}}};const O=["Default","Searching","RegexQuery","FiltersOpen","FiltersApplied","Interactive"];export{n as Default,p as FiltersApplied,c as FiltersOpen,d as Interactive,l as RegexQuery,o as Searching,O as __namedExportsOrder,R as default};
