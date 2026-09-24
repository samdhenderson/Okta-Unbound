import{j as l,r as y}from"./iframe-mmN7AxbW.js";import{A as S}from"./AppsFilterPanel-JY18rcWu.js";import{f as R}from"./appFilters-CTS9Q_fJ.js";import"./preload-helper-PPVm8Dsz.js";import"./okta-C-BsJJoX.js";import"./types-D54cNL3h.js";const{expect:s,fn:h,userEvent:v,within:t}=__STORYBOOK_MODULE_TEST__,G={title:"Apps/AppsFilterPanel",component:S,tags:["autodocs"],parameters:{layout:"padded",docs:{description:{component:"The Applications rung's status and group-push buckets and its sort pills, disclosed below the action strip by `AppsToolbar`'s `FilterToggle`. Fully controlled: every pill reports upward and the tab shell owns the filtering.\n\n`Pushes nothing` means Group Push is enabled on the app and the org snapshot holds no group assignment for it — the snapshot only walks the groups endpoint for `GROUP_PUSH` apps, so a wider reading would report the whole inventory as unassigned.\n\n\"Clear all\" appears only once a filter is applied, and returns the filters and the search query to their defaults. It leaves the sort order alone."}}},argTypes:{statusFilter:{description:"Selected status bucket (`''` = all)."},onStatusFilterChange:{description:"Called with the newly selected status bucket."},groupsFilter:{description:"Selected group-push bucket (`''` = all)."},onGroupsFilterChange:{description:"Called with the newly selected group-push bucket."},sortBy:{description:"The active sort field."},sortDesc:{description:"Whether the active sort is descending."},onToggleSort:{description:"Select a sort field, or flip the direction when it is already active."},activeFilterCount:{description:'How many filter axes are away from their default; gates "Clear all".'},onClearFilters:{description:"Returns every filter axis, and the search query, to default."}},args:{statusFilter:"",onStatusFilterChange:h(),groupsFilter:"",onGroupsFilterChange:h(),sortBy:"label",sortDesc:!1,onToggleSort:h(),activeFilterCount:0,onClearFilters:h()}},c={},p={args:{statusFilter:"INACTIVE",activeFilterCount:1},play:async({canvasElement:o})=>{const a=t(o),e=t(a.getByRole("group",{name:"Filter by status"}));await s(e.getByRole("button",{name:"Inactive"})).toHaveAttribute("aria-pressed","true"),await s(a.getByRole("button",{name:"Clear all"})).toBeInTheDocument()}},u={args:{groupsFilter:"no-groups",activeFilterCount:1}},d={args:{statusFilter:"ACTIVE",groupsFilter:"no-groups",activeFilterCount:2}},g={args:{sortBy:"created",sortDesc:!0}},T=[{id:"0oaFAKE0001",label:"Salesforce",status:"ACTIVE",created:"2026-01-15T09:00:00.000Z"},{id:"0oaFAKE0002",label:"Workday HR",status:"INACTIVE",created:"2026-03-01T09:00:00.000Z"},{id:"0oaFAKE0003",label:"Slack",status:"ACTIVE",created:"2025-11-20T09:00:00.000Z"}],m={render:o=>{const a=()=>{const[e,i]=y.useState(""),[r,w]=y.useState(""),[F,C]=y.useState("label"),[B,b]=y.useState(!1),f=R(T,{searchQuery:"",statusFilter:e,groupsFilter:r,sortBy:F,sortDesc:B});return l.jsxs("div",{className:"space-y-(--sp-field)",children:[l.jsx(S,{...o,statusFilter:e,onStatusFilterChange:i,groupsFilter:r,onGroupsFilterChange:w,sortBy:F,sortDesc:B,onToggleSort:n=>{n===F?b(A=>!A):(C(n),b(!1))},activeFilterCount:(e?1:0)+(r?1:0),onClearFilters:()=>{i(""),w("")}}),l.jsx("ul",{"aria-label":"Applications",className:"space-y-1 text-sm text-neutral-700",children:f.map(n=>l.jsx("li",{children:n.label},n.id))})]})};return l.jsx(a,{})},play:async({canvasElement:o})=>{const a=t(o),e=a.getByRole("list",{name:"Applications"});await s(t(e).getAllByRole("listitem")).toHaveLength(3);const i=t(a.getByRole("group",{name:"Filter by status"}));await v.click(i.getByRole("button",{name:"Inactive"})),await s(i.getByRole("button",{name:"Inactive"})).toHaveAttribute("aria-pressed","true"),await s(t(e).getAllByRole("listitem")).toHaveLength(1),await s(t(e).getByText("Workday HR")).toBeInTheDocument(),await v.click(a.getByRole("button",{name:"Clear all"})),await s(t(e).getAllByRole("listitem")).toHaveLength(3),await s(a.queryByRole("button",{name:"Clear all"})).not.toBeInTheDocument();const r=t(a.getByRole("group",{name:"Sort applications"}));await s(t(e).getAllByRole("listitem")[0]).toHaveTextContent("Salesforce"),await v.click(r.getByRole("button",{name:/^Name/})),await s(t(e).getAllByRole("listitem")[0]).toHaveTextContent("Workday HR"),await v.click(r.getByRole("button",{name:/^Created/})),await s(t(e).getAllByRole("listitem")[0]).toHaveTextContent("Slack")}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source},description:{story:'Nothing applied, sorted by name ascending — no "Clear all" to offer.',...c.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    statusFilter: 'INACTIVE',
    activeFilterCount: 1
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const status = within(canvas.getByRole('group', {
      name: 'Filter by status'
    }));
    await expect(status.getByRole('button', {
      name: 'Inactive'
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', {
      name: 'Clear all'
    })).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:'The inactive bucket selected, so the panel offers "Clear all".',...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    groupsFilter: 'no-groups',
    activeFilterCount: 1
  }
}`,...u.parameters?.docs?.source},description:{story:`The group-push bucket selected: apps with Group Push on that push no groups —
a configured integration doing no work.`,...u.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    statusFilter: 'ACTIVE',
    groupsFilter: 'no-groups',
    activeFilterCount: 2
  }
}`,...d.parameters?.docs?.source},description:{story:"Both filter axes applied at once.",...d.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    sortBy: 'created',
    sortDesc: true
  }
}`,...g.parameters?.docs?.source},description:{story:"Sorted by created date, descending (newest first).",...g.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => {
    const Harness = () => {
      const [statusFilter, setStatusFilter] = useState<AppStatusFilter>('');
      const [groupsFilter, setGroupsFilter] = useState<AppGroupsFilter>('');
      const [sortBy, setSortBy] = useState<AppSortField>('label');
      const [sortDesc, setSortDesc] = useState(false);
      const visible = filterAndSortApps(harnessApps, {
        searchQuery: '',
        statusFilter,
        groupsFilter,
        sortBy,
        sortDesc
      });
      return <div className="space-y-(--sp-field)">
          <AppsFilterPanel {...args} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} groupsFilter={groupsFilter} onGroupsFilterChange={setGroupsFilter} sortBy={sortBy} sortDesc={sortDesc} onToggleSort={field => {
          if (field === sortBy) setSortDesc(previous => !previous);else {
            setSortBy(field);
            setSortDesc(false);
          }
        }} activeFilterCount={(statusFilter ? 1 : 0) + (groupsFilter ? 1 : 0)} onClearFilters={() => {
          setStatusFilter('');
          setGroupsFilter('');
        }} />
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

    // A bucket narrows the list, and the pill says it is the chosen one.
    const status = within(canvas.getByRole('group', {
      name: 'Filter by status'
    }));
    await userEvent.click(status.getByRole('button', {
      name: 'Inactive'
    }));
    await expect(status.getByRole('button', {
      name: 'Inactive'
    })).toHaveAttribute('aria-pressed', 'true');
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    await expect(within(list).getByText('Workday HR')).toBeInTheDocument();

    // "Clear all" only exists while something is applied, and puts it back.
    await userEvent.click(canvas.getByRole('button', {
      name: 'Clear all'
    }));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.queryByRole('button', {
      name: 'Clear all'
    })).not.toBeInTheDocument();

    // Sorting: name ascending by default, flipped to descending by a second press.
    const sort = within(canvas.getByRole('group', {
      name: 'Sort applications'
    }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Salesforce');
    await userEvent.click(sort.getByRole('button', {
      name: /^Name/
    }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Workday HR');

    // A different field takes over, ascending: the oldest app leads.
    await userEvent.click(sort.getByRole('button', {
      name: /^Created/
    }));
    await expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Slack');
  }
}`,...m.parameters?.docs?.source},description:{story:`The panel wired to real state over a three-app inventory, so each bucket
narrows the list beneath it and each sort pill reorders it.`,...m.parameters?.docs?.description}}};const N=["Default","InactiveFilter","PushesNothingFilter","BothFilters","SortedByCreatedDesc","Interactive"];export{d as BothFilters,c as Default,p as InactiveFilter,m as Interactive,u as PushesNothingFilter,g as SortedByCreatedDesc,N as __namedExportsOrder,G as default};
