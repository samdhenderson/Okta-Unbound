import React, { useMemo, useState } from 'react';
import ChapterPage, { type ShowSpec } from '../shell/ChapterPage';
import Scene from '../shell/Scene';
import { CheckRulesScene, PasswordResetScene, ProfileEditsScene } from './parts/userProfile';
import { Marker } from '../shell/Callout';
import Assemble from '../show/Assemble';
import { useTyped } from '../show/useTyped';
import UserSearchBar from '../../sidepanel/components/users/UserSearchBar';
import UserSearchResults from '../../sidepanel/components/users/UserSearchResults';
import GroupMembershipRow from '../../sidepanel/components/users/GroupMembershipRow';
import { EmptyState } from '../../sidepanel/components/shared';
import { userDisplayName } from '../../shared/utils/userDisplay';
import type { GroupMembership, MembershipRule, OktaUser } from '../../shared/types';
import { DEMO_COMPARISON_PAIR, demoUsers, demoUsersById } from '../../sidepanel/demo/users';
import { DEMO_ORIGIN } from '../../sidepanel/demo/org';

const amara: OktaUser = demoUsersById.get(DEMO_COMPARISON_PAIR.left)!;

const TYPED_QUERY = 'Ama';

const PAGE_SIZE = 4;

const haystack = (user: OktaUser): string =>
  `${userDisplayName(user)} ${user.profile.email ?? ''}`.toLowerCase();

function searchPage(query: string): { rows: OktaUser[]; total: number } {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return { rows: [], total: 0 };
  const all = demoUsers.filter((user) => haystack(user).includes(needle));
  return { rows: all.slice(0, PAGE_SIZE), total: all.length };
}

const typedPage = searchPage(TYPED_QUERY);

const rule = (id: string, name: string, conditionExpression: string): MembershipRule => ({
  id,
  name,
  status: 'ACTIVE',
  conditionExpression,
});

const byRule: GroupMembership = {
  group: {
    id: '00gFAKE00000000000101',
    type: 'OKTA_GROUP',
    profile: { name: 'Engineering Staff', description: 'Everyone in Engineering' },
  },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [rule('0prFAKE00000000000101', 'Engineers', 'user.department == "Engineering"')],
};

const byHand: GroupMembership = {
  group: {
    id: '00gFAKE00000000000102',
    type: 'OKTA_GROUP',
    profile: { name: 'Incident Commanders' },
  },
  membershipType: 'DIRECT',
  attribution: 'exact',
  rules: [],
};

const twoCandidates: GroupMembership = {
  group: { id: '00gFAKE00000000000103', type: 'OKTA_GROUP', profile: { name: 'VPN Access' } },
  membershipType: 'RULE_BASED',
  attribution: 'ambiguous',
  rules: [
    rule('0prFAKE00000000000102', 'Engineers get VPN', 'user.department == "Engineering"'),
    rule('0prFAKE00000000000103', 'Seattle gets VPN', 'user.city == "Seattle"'),
  ],
};

const byApp: GroupMembership = {
  group: { id: '00gFAKE00000000000104', type: 'APP_GROUP', profile: { name: 'GitHub Enterprise' } },
  membershipType: 'RULE_BASED',
  attribution: 'exact',
  rules: [],
};

const memberships = [byRule, byHand, twoCandidates, byApp];

const noop = () => {};

const showHits: OktaUser[] = typedPage.rows.map((user) => ({ ...user, id: `show-${user.id}` }));

const SearchPose: React.FC<{ beat: number }> = ({ beat }) => {
  const query = useTyped(TYPED_QUERY, beat >= 1);
  return (
    <div className="space-y-(--sp-rung)">
      <UserSearchBar
        searchQuery={query}
        onSearchChange={noop}
        onClear={noop}
        isSearching={false}
        showClearButton={query.length > 0}
      />
      {beat >= 2 ? (
        <UserSearchResults
          results={showHits}
          truncated={typedPage.total > showHits.length}
          onSelectUser={noop}
        />
      ) : null}
    </div>
  );
};

const GroupsPose: React.FC<{ beat: number }> = ({ beat }) => (
  <Assemble className="space-y-(--sp-rung)">
    {memberships.map((membership) => (
      <GroupMembershipRow
        key={membership.group.id}
        membership={membership}
        user={amara}
        isCurrentGroup={false}
        expanded={beat >= 4 && membership.group.id === twoCandidates.group.id}
        onToggle={noop}
        oktaOrigin={DEMO_ORIGIN}
        proofEnabled={false}
        onProve={noop}
      />
    ))}
  </Assemble>
);

const SHOW: ShowSpec = {
  stageLabel: 'Users',
  minHeight: 640,
  beats: [
    { caption: 'Start with the person. The field takes a name, a login or an email.', hold: 2 },
    { caption: 'Three letters are enough.', hold: 2 },
    {
      caption: `${typedPage.total} people matched. The line says these ${showHits.length} are one page, not the total.`,
      hold: 3,
    },
    { caption: 'Open her, and every group she is in says what put her there.', hold: 3 },
    {
      caption:
        'Two rules could have put her in VPN Access. The panel names both rather than picking one.',
    },
  ],
  render: (beat) => (beat >= 3 ? <GroupsPose beat={beat} /> : <SearchPose beat={beat} />),
};

const SearchScene: React.FC = () => {
  const [query, setQuery] = useState(TYPED_QUERY);
  const page = useMemo(() => searchPage(query), [query]);
  return (
    <div className="space-y-(--sp-rung)">
      <Marker n={1}>
        <UserSearchBar
          searchQuery={query}
          onSearchChange={setQuery}
          onClear={() => setQuery('')}
          isSearching={false}
          showClearButton={query.length > 0}
        />
      </Marker>
      {page.rows.length > 0 ? (
        <Marker n={2} align="top">
          <UserSearchResults
            results={page.rows}
            truncated={page.total > page.rows.length}
            onSelectUser={noop}
          />
        </Marker>
      ) : query.trim().length === 0 ? (
        <EmptyState
          icon="user"
          title="User Membership Tracing"
          description="Search for users to analyze their group memberships and understand why they're in specific groups"
        />
      ) : null}
    </div>
  );
};

const GroupsScene: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (groupId: string) => setOpen((current) => (current === groupId ? null : groupId));
  return (
    <div className="space-y-(--sp-rung)">
      {memberships.map((membership, index) => (
        <Marker key={membership.group.id} n={index + 1} align="top">
          <GroupMembershipRow
            membership={membership}
            user={amara}
            isCurrentGroup={false}
            expanded={open === membership.group.id}
            onToggle={toggle}
            oktaOrigin={DEMO_ORIGIN}
            proofEnabled={false}
            onProve={noop}
          />
        </Marker>
      ))}
    </div>
  );
};

const UsersChapter: React.FC = () => (
  <ChapterPage id="users" show={SHOW}>
    <Scene
      title="Search"
      intro={`Most questions about access start with a person. The Users tab takes you from a name to every group they are in, and for each one, what put them there. Type any part of a name, a login or an email: the field below searches a demo org of ${demoUsers.length} people.`}
      legend={[
        {
          text: 'The field. The list narrows on every keystroke, and the clear button empties it and puts the starting screen back.',
        },
        {
          text: 'One page of matches. The line above the rows counts what is on screen and says when Okta held the rest back, so a page is never passed off as a total. Each row carries the account status, so a deprovisioned person never reads as an active one.',
        },
      ]}
      minHeight={320}
    >
      <SearchScene />
    </Scene>

    <Scene
      title="Memberships"
      intro="Open a person and the Groups pane lists every membership with one badge and one source line. Click a row to open its evidence."
      legend={[
        {
          text: 'Rule on Engineering Staff: one rule names her, and every clause of its condition holds against her profile today.',
        },
        {
          text: 'Direct on Incident Commanders: someone added her by hand, and no rule targets this group.',
        },
        {
          text: 'Rule · 2 on VPN Access: two rules could have done it and nothing on file separates them, so the panel lists both rather than picking one. Open the row to read the pair.',
        },
        {
          text: 'App on GitHub Enterprise: the application owns this roster and Okta mirrors it, so there is no rule to name.',
        },
      ]}
      outro="An open row gives you the rule's condition checked clause by clause against the person, any apps the group also grants, and a link to the group in Okta. Where two rules tie, the row offers to ask Okta directly: one request, and the deduction is replaced by Okta's own answer."
      minHeight={280}
    >
      <GroupsScene />
    </Scene>

    <CheckRulesScene />

    <ProfileEditsScene />

    <PasswordResetScene />
  </ChapterPage>
);

export default UsersChapter;
