import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { AppSummary } from '../../../shared/types';
import { enrichAppBasic } from '../../utils/appEnrichment';
import AppListItem from './AppListItem';
import SelectionChips from '../shared/SelectionChips';

interface BrowseSubTabProps {
  oktaApi: {
    getAllApps: () => Promise<any[]>;
    enrichApp: (app: any) => Promise<AppSummary>;
  };
  onResult: (message: { text: string; type: 'info' | 'success' | 'warning' | 'error' }) => void;
  oktaOrigin?: string;
}

type SearchMode = 'live' | 'cached';
type SortOption = 'name' | 'created' | 'updated' | 'userCount' | 'groupCount' | 'totalCount';

const APPS_CACHE_KEY = 'okta_unbound_apps_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (1 day)

const BrowseSubTab: React.FC<BrowseSubTabProps> = ({ oktaApi, onResult, oktaOrigin }) => {
  const [searchMode, setSearchMode] = useState<SearchMode>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [liveSearchResults, setLiveSearchResults] = useState<AppSummary[]>([]);
  const [isLoadingCache, setIsLoadingCache] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [appTypeFilter, setAppTypeFilter] = useState<'all' | AppSummary['appType']>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<
    'all' | 'hasUsers' | 'hasGroups' | 'noAssignments'
  >('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const [selectedAppIds, setSelectedAppIds] = useState<Set<string>>(new Set());

  const [enrichingAppIds, setEnrichingAppIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFromCache();
  }, []);

  const loadFromCache = async () => {
    try {
      const result = await chrome.storage.local.get([APPS_CACHE_KEY]);
      if (result[APPS_CACHE_KEY]) {
        const cached = JSON.parse(result[APPS_CACHE_KEY] as string);
        const age = Date.now() - cached.timestamp;

        if (age < CACHE_DURATION) {
          const parsedApps = cached.apps.map((app: any) => ({
            ...app,
            created: app.created,
            lastUpdated: app.lastUpdated,
          }));

          setApps(parsedApps);
          setSearchMode('cached');
          onResult({
            text: `Loaded ${parsedApps.length} apps from cache (${Math.floor(age / 60000)} minutes old)`,
            type: 'info',
          });
        } else {
          onResult({
            text: 'Cache expired. Use "Load All Apps" to refresh.',
            type: 'info',
          });
        }
      }
    } catch (error) {
      console.error('[BrowseSubTab] Failed to load from cache:', error);
    }
  };

  const loadAllApps = async () => {
    setIsLoadingCache(true);
    try {
      onResult({ text: 'Loading all apps from Okta...', type: 'info' });

      const allApps = await oktaApi.getAllApps();
      const enrichedApps = allApps.map((app) => enrichAppBasic(app));

      setApps(enrichedApps);
      setSearchMode('cached');

      await chrome.storage.local.set({
        [APPS_CACHE_KEY]: JSON.stringify({
          apps: enrichedApps,
          timestamp: Date.now(),
        }),
      });

      onResult({
        text: `Loaded ${enrichedApps.length} apps successfully`,
        type: 'success',
      });
    } catch (error) {
      console.error('[BrowseSubTab] Failed to load all apps:', error);
      onResult({
        text: error instanceof Error ? error.message : 'Failed to load apps',
        type: 'error',
      });
    } finally {
      setIsLoadingCache(false);
    }
  };

  const handleRefresh = async () => {
    await loadAllApps();
  };

  useEffect(() => {
    if (searchMode === 'live' && searchQuery.length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const filtered = apps
          .filter(
            (app) =>
              app.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              app.id.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 20);

        setLiveSearchResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setLiveSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, searchMode, apps]);

  const filteredApps = useMemo(() => {
    let result = searchMode === 'cached' ? apps : liveSearchResults;

    if (searchQuery && searchMode === 'cached') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (app) =>
          app.label.toLowerCase().includes(query) ||
          app.name.toLowerCase().includes(query) ||
          app.id.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (appTypeFilter !== 'all') {
      result = result.filter((app) => app.appType === appTypeFilter);
    }

    if (assignmentFilter === 'hasUsers') {
      result = result.filter((app) => app.userAssignmentCount > 0);
    } else if (assignmentFilter === 'hasGroups') {
      result = result.filter((app) => app.groupAssignmentCount > 0);
    } else if (assignmentFilter === 'noAssignments') {
      result = result.filter((app) => app.totalAssignmentCount === 0);
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.label.localeCompare(b.label);
        case 'created':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'userCount':
          return b.userAssignmentCount - a.userAssignmentCount;
        case 'groupCount':
          return b.groupAssignmentCount - a.groupAssignmentCount;
        case 'totalCount':
          return b.totalAssignmentCount - a.totalAssignmentCount;
        default:
          return 0;
      }
    });

    return result;
  }, [
    apps,
    liveSearchResults,
    searchQuery,
    searchMode,
    statusFilter,
    appTypeFilter,
    assignmentFilter,
    sortBy,
  ]);

  const handleToggleSelect = useCallback((appId: string) => {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAppIds(new Set(filteredApps.map((app) => app.id)));
  }, [filteredApps]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAppIds(new Set());
  }, []);

  const selectedApps = useMemo(
    () => apps.filter((app) => selectedAppIds.has(app.id)),
    [apps, selectedAppIds],
  );

  const handleEnrichApp = useCallback(
    async (appId: string) => {
      setEnrichingAppIds((prev) => new Set(prev).add(appId));
      try {
        onResult({ text: `Enriching app ${appId}...`, type: 'info' });

        const appToEnrich = apps.find((a) => a.id === appId);
        if (!appToEnrich) {
          throw new Error('App not found');
        }

        console.log('[BrowseSubTab] Starting enrichment for app:', appToEnrich.label);

        const enrichedApp = await oktaApi.enrichApp(appToEnrich);

        console.log('[BrowseSubTab] Enriched app data:', {
          label: enrichedApp.label,
          userCount: enrichedApp.userAssignmentCount,
          groupCount: enrichedApp.groupAssignmentCount,
          totalCount: enrichedApp.totalAssignmentCount,
        });

        setApps((prevApps) => {
          const updated = prevApps.map((app) => (app.id === appId ? enrichedApp : app));
          console.log(
            '[BrowseSubTab] Updated apps array, app found:',
            updated.find((a) => a.id === appId)?.totalAssignmentCount,
          );
          return updated;
        });

        if (searchMode === 'cached') {
          const cachedData = await chrome.storage.local.get([APPS_CACHE_KEY]);
          if (cachedData[APPS_CACHE_KEY]) {
            const cached = JSON.parse(cachedData[APPS_CACHE_KEY] as string);
            cached.apps = cached.apps.map((app: any) => (app.id === appId ? enrichedApp : app));
            await chrome.storage.local.set({
              [APPS_CACHE_KEY]: JSON.stringify(cached),
            });
          }
        }

        onResult({
          text: `Enriched ${enrichedApp.label}: ${enrichedApp.userAssignmentCount} users, ${enrichedApp.groupAssignmentCount} groups`,
          type: 'success',
        });
      } catch (error) {
        console.error('[BrowseSubTab] Failed to enrich app:', error);
        onResult({
          text: error instanceof Error ? error.message : 'Failed to enrich app',
          type: 'error',
        });
      } finally {
        setEnrichingAppIds((prev) => {
          const next = new Set(prev);
          next.delete(appId);
          return next;
        });
      }
    },
    [apps, oktaApi, onResult, searchMode],
  );

  const handleBulkEnrich = useCallback(async () => {
    const appsToEnrich = selectedApps.filter((app) => app.totalAssignmentCount === 0);
    if (appsToEnrich.length === 0) {
      onResult({
        text: 'No apps need enrichment (all selected apps already have data)',
        type: 'info',
      });
      return;
    }

    onResult({ text: `Starting bulk enrichment for ${appsToEnrich.length} apps...`, type: 'info' });

    let successCount = 0;
    let failCount = 0;

    for (const app of appsToEnrich) {
      try {
        await handleEnrichApp(app.id);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    onResult({
      text: `Bulk enrichment complete: ${successCount} succeeded, ${failCount} failed`,
      type: successCount > 0 ? 'success' : 'warning',
    });
  }, [selectedApps, handleEnrichApp, onResult]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps by name, label, or ID..."
              className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007dc1]/30 focus:border-[#007dc1] transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#007dc1] rounded-full animate-spin" />
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoadingCache}
            className="px-4 py-2.5 bg-gradient-to-r from-[#007dc1] to-[#3d9dd9] text-white font-medium rounded-lg hover:from-[#005a8f] hover:to-[#007dc1] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isLoadingCache ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </span>
            ) : searchMode === 'cached' ? (
              'Refresh Apps'
            ) : (
              'Load All Apps'
            )}
          </button>
        </div>

        {searchMode === 'cached' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#007dc1]/30 focus:border-[#007dc1]"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <select
                value={appTypeFilter}
                onChange={(e) => setAppTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#007dc1]/30 focus:border-[#007dc1]"
              >
                <option value="all">All Types</option>
                <option value="SAML_2_0">SAML 2.0</option>
                <option value="OPENID_CONNECT">OIDC</option>
                <option value="SWA">SWA</option>
                <option value="BOOKMARK">Bookmark</option>
                <option value="API_SERVICE">API</option>
                <option value="OTHER">Other</option>
              </select>

              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value as any)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#007dc1]/30 focus:border-[#007dc1]"
              >
                <option value="all">All Assignments</option>
                <option value="hasUsers">Has User Assignments</option>
                <option value="hasGroups">Has Group Assignments</option>
                <option value="noAssignments">No Assignments</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#007dc1]/30 focus:border-[#007dc1]"
              >
                <option value="name">Sort: Name</option>
                <option value="updated">Sort: Last Updated</option>
                <option value="created">Sort: Created Date</option>
                <option value="totalCount">Sort: Total Assignments</option>
                <option value="userCount">Sort: User Assignments</option>
                <option value="groupCount">Sort: Group Assignments</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                Showing <span className="font-semibold text-gray-900">{filteredApps.length}</span>{' '}
                of <span className="font-semibold text-gray-900">{apps.length}</span> apps
              </span>
              {selectedAppIds.size > 0 && (
                <span className="text-[#007dc1] font-semibold">{selectedAppIds.size} selected</span>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedAppIds.size > 0 && (
        <SelectionChips
          items={selectedApps}
          getKey={(app) => app.id}
          getLabel={(app) => app.label}
          onRemove={(app) => handleToggleSelect(app.id)}
          onClearAll={handleDeselectAll}
        />
      )}

      {selectedAppIds.size > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#007dc1] animate-pulse" />
              <span className="text-sm font-medium text-gray-900">
                {selectedAppIds.size} app{selectedAppIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkEnrich}
                disabled={selectedApps.filter((app) => app.totalAssignmentCount === 0).length === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Enrich selected apps with real data"
              >
                Enrich Selected
              </button>
              <button
                onClick={() => onResult({ text: 'Bulk operations coming soon!', type: 'info' })}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#007dc1] to-[#3d9dd9] rounded-lg hover:from-[#005a8f] hover:to-[#007dc1] transition-all shadow-md hover:shadow-lg"
              >
                Bulk Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {searchMode === 'cached' && apps.length > 0 && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-sm text-[#007dc1] hover:underline font-medium"
              >
                Select All
              </button>
              {selectedAppIds.size > 0 && (
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Deselect All
                </button>
              )}
            </div>
          </div>
        )}

        {filteredApps.length === 0 && searchMode === 'live' && !searchQuery && (
          <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-900">No apps loaded</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Click "Load All Apps" to browse all applications in your Okta org
            </p>
          </div>
        )}

        {filteredApps.length === 0 && (searchMode === 'cached' || searchQuery) && (
          <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
            <p className="text-lg font-semibold text-gray-900">No apps found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {filteredApps.map((app) => (
          <AppListItem
            key={app.id}
            app={app}
            selected={selectedAppIds.has(app.id)}
            onToggleSelect={handleToggleSelect}
            onEnrich={handleEnrichApp}
            isEnriching={enrichingAppIds.has(app.id)}
            oktaOrigin={oktaOrigin}
          />
        ))}
      </div>
    </div>
  );
};

export default BrowseSubTab;
