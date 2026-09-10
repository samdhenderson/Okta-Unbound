import React from 'react';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import AlertMessage from '../shared/AlertMessage';
import OpenInOktaLink from '../shared/OpenInOktaLink';
import ComparisonSearchPhase from './comparison/ComparisonSearchPhase';
import ComparisonHero from './comparison/ComparisonHero';
import ComparisonTabBar from './comparison/ComparisonTabBar';
import ComparisonOverviewTab from './comparison/ComparisonOverviewTab';
import ComparisonDiffTab from './comparison/ComparisonDiffTab';
import ComparisonAttributesTab from './comparison/ComparisonAttributesTab';
import ProfileSaveModal from './ProfileSaveModal';
import AppScopeIndicator from './comparison/AppScopeIndicator';
import GroupSourceIndicator from './comparison/GroupSourceIndicator';
import { groupParityRows, appParityRows } from './comparison/comparisonAnalytics';
import type { UserComparisonState } from '../../hooks/useUserComparison';
import type { OktaUser } from '../../../shared/types';

export interface UserComparisonViewProps {
  contextUser: OktaUser;
  comparison: UserComparisonState;
  oktaOrigin?: string | null;
}

const UserComparisonView: React.FC<UserComparisonViewProps> = ({
  contextUser,
  comparison,
  oktaOrigin,
}) => {
  const {
    comparedUser,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    activeTab,
    setActiveTab,
    groupBuckets,
    appBuckets,
    causes,
    groupDiffCount,
    appDiffCount,
    attributeParity,
    attributeDiffCount,
    attributeConfig,
    attributeRuleReads,
    attributeEdit,
    groupSimilarity,
    appSimilarity,
    overallSimilarity,
    similarityScope,
    appsIncomplete,
    isLoading,
    loadError,
    addingGroupId,
    addError,
    setAddError,
    addToContext,
    addToCompared,
    contextName,
    comparedName,
    resolveGroupName,
    selectUser,
    changeUser,
  } = comparison;

  return (
    <>
      {!comparedUser && (
        <ComparisonSearchPhase
          contextUser={contextUser}
          contextName={contextName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchResults={searchResults}
          onSelectUser={selectUser}
        />
      )}

      {comparedUser && (
        <div className="space-y-(--sp-rung)">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={changeUser} icon="refresh">
              Change user
            </Button>
          </div>

          <ComparisonHero
            contextUser={contextUser}
            comparedUser={comparedUser}
            contextName={contextName}
            comparedName={comparedName}
            similarity={overallSimilarity}
            scopeNote={similarityScope === 'groups-only' ? 'groups only' : undefined}
            isLoading={isLoading}
          />

          <ComparisonTabBar
            activeTab={activeTab}
            onChange={setActiveTab}
            groupDiff={groupDiffCount}
            appDiff={appDiffCount}
            attributeDiff={attributeDiffCount}
          />

          {isLoading && (
            <div className="py-8">
              <LoadingSpinner size="xl" message="Crunching memberships and assignments…" centered />
            </div>
          )}

          {!isLoading && loadError && (
            <AlertMessage message={{ text: loadError, type: 'danger' }} />
          )}

          {!isLoading && !loadError && (
            <>
              {addError && (
                <AlertMessage
                  message={{ text: addError, type: 'danger' }}
                  onDismiss={() => setAddError(null)}
                />
              )}

              {appsIncomplete && (
                <AlertMessage
                  message={{
                    text: 'Some app assignments could not be loaded. The app comparison is incomplete, and the match score covers groups only.',
                    type: 'warning',
                  }}
                />
              )}

              {activeTab === 'overview' && (
                <ComparisonOverviewTab
                  contextName={contextName}
                  comparedName={comparedName}
                  groupBuckets={groupBuckets}
                  appBuckets={appBuckets}
                  groupSimilarity={groupSimilarity}
                  appSimilarity={appSimilarity}
                  onJumpToGroups={() => setActiveTab('groups')}
                  onJumpToApps={() => setActiveTab('apps')}
                  causes={causes}
                  renderGroupAction={(reference) => {
                    const match = groupBuckets.onlyCompared.find((m) =>
                      reference.match === 'id'
                        ? m.group.id === reference.value
                        : m.group.profile.name === reference.value,
                    );
                    if (!match) return null;
                    return (
                      <Button
                        size="sm"
                        variant="primary"
                        icon="plus"
                        loading={addingGroupId === match.group.id}
                        disabled={addingGroupId !== null}
                        onClick={() => addToContext(match.group)}
                      >
                        Add
                      </Button>
                    );
                  }}
                  resolveGroupName={resolveGroupName}
                  renderBlockingGroupAction={(reference) => {
                    const groupId =
                      reference.match === 'id'
                        ? reference.value
                        : groupBuckets.onlyContext
                            .concat(groupBuckets.shared)
                            .find((m) => m.group.profile.name === reference.matchedGroupName)?.group
                            .id;
                    return (
                      <OpenInOktaLink
                        oktaOrigin={oktaOrigin}
                        target={{ type: 'group', id: groupId }}
                        label="Open group"
                      />
                    );
                  }}
                />
              )}

              {activeTab === 'groups' && (
                <ComparisonDiffTab
                  contextName={contextName}
                  comparedName={comparedName}
                  rows={groupParityRows(groupBuckets)}
                  noun="group"
                  emptyText="Neither user is in any groups."
                  renderContextAction={(row, recipientName) => {
                    const m = groupBuckets.onlyCompared.find((b) => b.group.id === row.id);
                    if (!m || m.group.type === 'APP_GROUP') return null;
                    return (
                      <Button
                        size="sm"
                        variant="primary"
                        icon="plus"
                        fullWidth
                        loading={addingGroupId === m.group.id}
                        disabled={addingGroupId !== null}
                        onClick={() => addToContext(m.group)}
                      >
                        Add {recipientName}
                      </Button>
                    );
                  }}
                  renderComparedAction={(row, recipientName) => {
                    const m = groupBuckets.onlyContext.find((b) => b.group.id === row.id);
                    if (!m || m.group.type === 'APP_GROUP') return null;
                    return (
                      <Button
                        size="sm"
                        variant="primary"
                        icon="plus"
                        fullWidth
                        loading={addingGroupId === m.group.id}
                        disabled={addingGroupId !== null}
                        onClick={() => addToCompared(m.group)}
                      >
                        Add {recipientName}
                      </Button>
                    );
                  }}
                  renderMeta={(row) => {
                    if (row.inContext && row.inCompared) return null;
                    return <GroupSourceIndicator membership={row.membership} />;
                  }}
                />
              )}

              {activeTab === 'attributes' && (
                <ComparisonAttributesTab
                  contextName={contextName}
                  comparedName={comparedName}
                  rows={attributeParity.rows}
                  hiddenRows={attributeParity.hiddenRows}
                  hiddenDifferences={attributeParity.hiddenDifferences}
                  config={attributeConfig}
                  ruleReads={attributeRuleReads}
                  contextEdit={attributeEdit?.context}
                  comparedEdit={attributeEdit?.compared}
                />
              )}

              {activeTab === 'apps' && (
                <ComparisonDiffTab
                  contextName={contextName}
                  comparedName={comparedName}
                  rows={appParityRows(appBuckets)}
                  noun="app"
                  emptyText={
                    appsIncomplete
                      ? 'App assignments could not be loaded for this comparison.'
                      : 'Neither user is assigned any apps.'
                  }
                  renderMeta={(row) => {
                    if (row.inContext && row.inCompared) {
                      return <AppScopeIndicator state="notCompared" />;
                    }
                    const entries = row.inCompared
                      ? appBuckets.onlyCompared
                      : appBuckets.onlyContext;
                    const entry = entries.find((a) => a.id === row.id);
                    return <AppScopeIndicator state={entry?.scope ?? 'unknown'} />;
                  }}
                />
              )}
            </>
          )}

          {attributeEdit?.pendingSave && (
            <ProfileSaveModal
              changes={attributeEdit.pendingSave.changes}
              userName={attributeEdit.pendingSave.userName}
              onCancel={attributeEdit.pendingSave.cancel}
              onConfirm={attributeEdit.pendingSave.confirm}
              isSaving={attributeEdit.pendingSave.isSaving}
              report={attributeEdit.pendingSave.report}
              onAnalyze={attributeEdit.pendingSave.analyze}
              isAnalyzing={attributeEdit.pendingSave.isAnalyzing}
              resolveGroupName={attributeEdit.pendingSave.resolveGroupName}
              error={attributeEdit.pendingSave.error}
            />
          )}
        </div>
      )}
    </>
  );
};

export default UserComparisonView;
