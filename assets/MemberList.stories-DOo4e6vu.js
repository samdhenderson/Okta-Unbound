import{M as b}from"./MemberList-CIeZUsdj.js";import{m as r}from"./fixtures-CsAiPaTu.js";import"./iframe-Pee757m_.js";import"./preload-helper-PPVm8Dsz.js";import"./useStaggerReveal-B8AfVumu.js";import"./MemberRow-B55ZfjcI.js";import"./status-Bn0B6Ou-.js";import"./revealOnHover-DU3PDCIu.js";import"./MembershipRuleEvidence-CHHoN_E7.js";import"./ruleExpression-YtJDU2CF.js";import"./GroupMembershipsListProof-TM5UMh63.js";import"./sourceLine-BFeciPo3.js";import"./membershipAnalysis-PgI-DSyi.js";import"./provenance-C1K7H2p2.js";import"./membershipVerdict-n2BbpwtB.js";import"./userDisplay-xpx41Abi.js";import"./memberAnalytics-tPH-giHi.js";const{expect:a,fn:w,userEvent:y,within:v}=__STORYBOOK_MODULE_TEST__,k=new Map(r.slice(0,50).map((e,t)=>[e.id,{userId:e.id,factors:[],enrolled:t%3!==0,factorCount:t%3===0?0:t%3+1,factorLabels:t%3===0?[]:["Okta Verify (Fastpass)"].concat(t%3===2?["SMS"]:[])}])),_={title:"Members/MemberList",component:b,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'Windowed, auto-paging scrollable list of member rows. Only the first `visibleCount` rows mount; the list grows via a "Load more" footer plus an IntersectionObserver sentinel, which caps DOM size for very large groups.\n\nWhile `loading`, the rows are replaced by `Skeleton variant="row"` placeholders rather than a spinner, because the shape of what is coming is already known.'}}},argTypes:{members:{description:"Members to display, already filtered and sorted by the caller."},loading:{description:"True while the member set is being re-fetched; swaps the rows for skeleton placeholders."},mfaResults:{description:"Per-member MFA scan results, or null before a scan has run."},mfaScanned:{description:'True once a scan completed, so rows render "No MFA" for 0-factor users.'},visibleCount:{description:"How many rows are currently mounted."},onLoadMore:{description:"Reveal the next page of rows."},loadingMore:{description:"True while the member walk is still reading pages; the count row states how many have loaded."},refreshingFrom:{description:"When the rows were read, for a roster past its TTL shown while a walk refreshes it."},expectedTotal:{description:"The group member count, when known, for the loading count row. Omitted ⇒ no total is written."},oktaOrigin:{description:"Okta org origin for per-member Admin Console links (null when unknown)."},selectedIds:{description:"Which members are in the selection basket. May hold ids for people ticked elsewhere."},onToggleSelect:{description:"Tick or untick one member. Absent ⇒ no row renders a checkbox."}},args:{members:r.slice(0,20),loading:!1,mfaResults:null,mfaScanned:!1,visibleCount:20,onLoadMore:w(),oktaOrigin:null}},s={},o={args:{members:r,visibleCount:50},play:async({args:e,canvas:t,userEvent:g})=>{await g.click(t.getByRole("button",{name:/^Load more/})),await a(e.onLoadMore).toHaveBeenCalled()}},n={args:{members:r.slice(0,50),mfaResults:k,mfaScanned:!0,visibleCount:50}},i={args:{oktaOrigin:"https://example.okta.com"}},c={args:{members:[],visibleCount:20}},l={args:{loading:!0}},d={args:{members:r.slice(0,20),loadingMore:!0,expectedTotal:1e3},play:async({canvas:e})=>{await a(e.getByText(/loaded 20 of 1,000/)).toHaveAttribute("aria-live","polite"),await a(e.queryByText(/^Showing 20 of 20$/)).not.toBeInTheDocument()}},m={args:{members:r.slice(0,20),refreshingFrom:Date.UTC(2026,0,5,15,42)},play:async({canvas:e})=>{await a(e.getByText(/as read at .*, refreshing/)).toHaveAttribute("aria-live","polite")}},p={args:{members:r.slice(0,20),loadingMore:!0},play:async({canvas:e})=>{await a(e.getByText(/loaded 20 so far/)).toBeInTheDocument()}},h={args:{onToggleSelect:w(),selectedIds:new Set([r[0].id,r[2].id])},play:async({args:e,canvasElement:t})=>{const u=v(t).getAllByRole("checkbox").filter(f=>f.checked);await a(u).toHaveLength(2),await y.click(u[0]),await a(e.onToggleSelect).toHaveBeenCalledWith(r[0].id)}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source},description:{story:"A short list that fits entirely within the visible window.",...s.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    members: mockUsers,
    visibleCount: 50
  },
  play: async ({
    args,
    canvas,
    userEvent
  }) => {
    await userEvent.click(canvas.getByRole('button', {
      name: /^Load more/
    }));
    await expect(args.onLoadMore).toHaveBeenCalled();
  }
}`,...o.parameters?.docs?.source},description:{story:'A large group with more rows than the current visible window: "Load more" shown.',...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    members: mockUsers.slice(0, 50),
    mfaResults,
    mfaScanned: true,
    visibleCount: 50
  }
}`,...n.parameters?.docs?.source},description:{story:'MFA scan complete: factor tags or "No MFA" badges render per row.',...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    oktaOrigin: 'https://example.okta.com'
  }
}`,...i.parameters?.docs?.source},description:{story:"Rows link out to the Okta Admin Console when an org origin is known.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    members: [],
    visibleCount: 20
  }
}`,...c.parameters?.docs?.source},description:{story:"No members match the current search and filters.",...c.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...l.parameters?.docs?.source},description:{story:"Reloading after a membership change: the stale rows are replaced by skeletons, not left showing figures about to change.",...l.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    members: mockUsers.slice(0, 20),
    loadingMore: true,
    expectedTotal: 1000
  },
  play: async ({
    canvas
  }) => {
    // In a polite live region, so each page's new figures are announced.
    await expect(canvas.getByText(/loaded 20 of 1,000/)).toHaveAttribute('aria-live', 'polite');
    await expect(canvas.queryByText(/^Showing 20 of 20$/)).not.toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source},description:{story:`The member walk is still reading pages: the rows already loaded stay live, and
the count row states how many have loaded against the group's member count —
never the loaded number as the total.`,...d.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    members: mockUsers.slice(0, 20),
    refreshingFrom: Date.UTC(2026, 0, 5, 15, 42)
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText(/as read at .*, refreshing/)).toHaveAttribute('aria-live', 'polite');
  }
}`,...m.parameters?.docs?.source},description:{story:`A roster past its TTL, shown while a walk refreshes it: the count row says when
the list was read and that it is refreshing, in a polite live region.`,...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    members: mockUsers.slice(0, 20),
    loadingMore: true
  },
  play: async ({
    canvas
  }) => {
    await expect(canvas.getByText(/loaded 20 so far/)).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source},description:{story:"Still loading with no member count to hand: the total is withheld rather than invented.",...p.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    onToggleSelect: fn(),
    selectedIds: new Set([mockUsers[0].id, mockUsers[2].id])
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const checked = canvas.getAllByRole('checkbox').filter(box => (box as HTMLInputElement).checked);
    await expect(checked).toHaveLength(2);
    await userEvent.click(checked[0]);
    await expect(args.onToggleSelect).toHaveBeenCalledWith(mockUsers[0].id);
  }
}`,...h.parameters?.docs?.source},description:{story:`Selection passes straight through this list; it owns none of it. \`selectedIds\`
comes from the panel-wide basket, which resolves ids against the group's full
roster rather than the filtered slice handed here — so the set may name people
whose rows are not currently mounted, and a row only ever asks it about itself.`,...h.parameters?.docs?.description}}};const N=["Default","WithLoadMore","WithMfaResults","WithOktaOrigin","Empty","Reloading","LoadingMore","RefreshingStale","LoadingMoreWithoutTotal","WithSelection"];export{s as Default,c as Empty,d as LoadingMore,p as LoadingMoreWithoutTotal,m as RefreshingStale,l as Reloading,o as WithLoadMore,n as WithMfaResults,i as WithOktaOrigin,h as WithSelection,N as __namedExportsOrder,_ as default};
