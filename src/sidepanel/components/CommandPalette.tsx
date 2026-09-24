import React, { useCallback, useMemo } from 'react';
import TabJumpPalette, { type CommandRow, type SectionMeta } from './TabJumpPalette';
import { useOktaApi } from '../hooks/useOktaApi';
import { useEntitySearchSources } from '../hooks/useEntitySearchSources';
import { useJumpResolver, JUMP_SEARCH_MIN_CHARS, type JumpKind } from '../hooks/useJumpResolver';
import { useEntityNavigation } from '../contexts/NavigationContext';
import { useOrgEntityIndex } from '../contexts/OrgEntityIndexContext';
import { navigationTarget } from './home/jumpDestinations';
import type { JumpResult } from '../hooks/useJumpResolver';
import type { TabType } from '../tabs';

const PALETTE_JUMP_KINDS = ['group', 'app', 'rule', 'policy', 'user'] as const;

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onShowWelcome: () => void;
  activeTab: TabType;
  onSelect: (tab: TabType) => void;
  targetTabId: number | null;
  oktaOrigin?: string | null;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenGuide,
  onShowWelcome,
  activeTab,
  onSelect,
  targetTabId,
  oktaOrigin,
}) => {
  const nav = useEntityNavigation();

  const api = useOktaApi({ targetTabId, oktaOrigin: oktaOrigin ?? undefined });

  const index = useOrgEntityIndex();

  const { searchers, fetchers } = useEntitySearchSources({
    api,
    index,
    kinds: PALETTE_JUMP_KINDS,
  });

  const jump = useJumpResolver({ index, searchers, fetchers, enabled: isOpen });

  const { setQuery, clear } = jump;

  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  const handleEntitySelect = useCallback(
    (result: JumpResult) => {
      nav.navigateTo({ type: navigationTarget(result.kind), id: result.id });
    },
    [nav],
  );

  const canReach = useCallback(
    (kind: JumpKind) => nav.canNavigateTo(navigationTarget(kind)),
    [nav],
  );

  const sectionMeta = useMemo<Partial<Record<JumpKind, SectionMeta>>>(
    () => ({
      group: { fromSnapshot: false, complete: true },
      rule: { fromSnapshot: true, complete: index.isAuthoritative('rule') },
      app: { fromSnapshot: true, complete: index.isAuthoritative('app') },
      policy: { fromSnapshot: false, complete: true },
      user: { fromSnapshot: false, complete: true },
    }),
    [index],
  );

  const commands = useMemo<ReadonlyArray<CommandRow>>(
    () => [
      { id: 'open-guide', label: 'Open the user guide', icon: 'book', run: onOpenGuide },
      {
        id: 'show-welcome',
        label: 'Show the welcome screen again',
        icon: 'sparkles',
        run: onShowWelcome,
      },
    ],
    [onOpenGuide, onShowWelcome],
  );

  return (
    <TabJumpPalette
      isOpen={isOpen}
      onClose={handleClose}
      activeTab={activeTab}
      onSelect={onSelect}
      onEntityQueryChange={setQuery}
      entityMode={jump.mode}
      entityResults={jump.results}
      entityError={jump.error}
      onEntitySelect={handleEntitySelect}
      canReach={canReach}
      sectionMeta={sectionMeta}
      commands={commands}
      oktaOrigin={oktaOrigin}
      entityMinChars={JUMP_SEARCH_MIN_CHARS}
    />
  );
};

export default CommandPalette;
