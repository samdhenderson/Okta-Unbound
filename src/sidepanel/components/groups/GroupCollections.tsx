import React, { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Input } from '../shared';
import Icon from '../shared/Icon';
import type { GroupCollection, GroupSummary } from '../../../shared/types';
import { createLogger } from '../../../shared/utils/logger';
import { formatDateShort } from '../../../shared/utils/dateFormat';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const log = createLogger('GroupCollections');

const COLLECTIONS_STORAGE_KEY = 'okta_unbound_group_collections';

const DELETE_EXIT_MS = 140;

interface GroupCollectionsProps {
  selectedGroupIds: Set<string>;
  groups: GroupSummary[];
  onLoadCollection: (groupIds: string[]) => void;
  onClose: () => void;
}

function generateId(): string {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const GroupCollections: React.FC<GroupCollectionsProps> = ({
  selectedGroupIds,
  groups,
  onLoadCollection,
  onClose,
}) => {
  const [collections, setCollections] = useState<GroupCollection[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [exitingId, setExitingId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    chrome.storage.local.get([COLLECTIONS_STORAGE_KEY], (result) => {
      if (result[COLLECTIONS_STORAGE_KEY]) {
        try {
          setCollections(JSON.parse(result[COLLECTIONS_STORAGE_KEY] as string));
        } catch (err) {
          log.error('Failed to parse collections:', err);
        }
      }
    });
  }, []);

  const saveCollections = useCallback((updated: GroupCollection[]) => {
    setCollections(updated);
    chrome.storage.local.set({ [COLLECTIONS_STORAGE_KEY]: JSON.stringify(updated) });
  }, []);

  const handleCreate = useCallback(() => {
    if (!newName.trim() || selectedGroupIds.size === 0) return;

    const collection: GroupCollection = {
      id: generateId(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      groupIds: Array.from(selectedGroupIds),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveCollections([collection, ...collections]);
    setNewName('');
    setNewDescription('');
    setShowCreate(false);
  }, [newName, newDescription, selectedGroupIds, collections, saveCollections]);

  const commitDelete = useCallback((id: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== id);
      chrome.storage.local.set({ [COLLECTIONS_STORAGE_KEY]: JSON.stringify(next) });
      return next;
    });
    setExitingId((prev) => (prev === id ? null : prev));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (reducedMotion) {
        commitDelete(id);
        return;
      }
      setExitingId(id);
    },
    [reducedMotion, commitDelete],
  );

  useEffect(() => {
    if (!exitingId) return;
    const id = exitingId;
    const timer = window.setTimeout(() => commitDelete(id), DELETE_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [exitingId, commitDelete]);

  const handleRename = useCallback(
    (id: string) => {
      if (!editName.trim()) return;
      saveCollections(
        collections.map((c) =>
          c.id === id ? { ...c, name: editName.trim(), updatedAt: Date.now() } : c,
        ),
      );
      setEditingId(null);
      setEditName('');
    },
    [editName, collections, saveCollections],
  );

  const handleUpdateGroupIds = useCallback(
    (id: string) => {
      if (selectedGroupIds.size === 0) return;
      saveCollections(
        collections.map((c) =>
          c.id === id ? { ...c, groupIds: Array.from(selectedGroupIds), updatedAt: Date.now() } : c,
        ),
      );
    },
    [selectedGroupIds, collections, saveCollections],
  );

  const getGroupName = useCallback(
    (groupId: string) => {
      return groups.find((g) => g.id === groupId)?.name || groupId.slice(0, 12) + '...';
    },
    [groups],
  );

  return (
    <div className="border border-neutral-200 rounded-md bg-white overflow-hidden">
      <div className="flex items-center justify-between p-(--sp-card)">
        <div>
          <h4 className="text-sm font-semibold text-neutral-900">Group Collections</h4>
          <p className="text-xs text-neutral-500 mt-0.5">
            {collections.length} saved collection{collections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="primary"
            size="sm"
            icon="plus"
            onClick={() => setShowCreate(true)}
            disabled={selectedGroupIds.size === 0}
            title={
              selectedGroupIds.size === 0
                ? 'Select groups first'
                : 'Save current selection as collection'
            }
          >
            Save
          </Button>
          <IconButton label="Close" onClick={onClose} variant="ghost" size="sm" className="ml-1">
            <Icon type="close" size="sm" />
          </IconButton>
        </div>
      </div>

      {showCreate && (
        <div className="p-(--sp-card) border-b border-neutral-200 bg-primary-light space-y-(--sp-field)">
          <Input
            placeholder="Collection name..."
            value={newName}
            onChange={setNewName}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Input
            placeholder="Description (optional)..."
            value={newDescription}
            onChange={setNewDescription}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-primary-text">
              {selectedGroupIds.size} groups will be saved
            </span>
            <div className="flex gap-(--sp-field)">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setNewName('');
                  setNewDescription('');
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreate} disabled={!newName.trim()}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[300px] overflow-y-auto">
        {collections.length === 0 && !showCreate && (
          <div className="p-6 text-center text-sm text-neutral-500">
            No collections saved yet. Select groups and click Save to create one.
          </div>
        )}

        {collections.map((col) => (
          <div
            key={col.id}
            className={`p-(--sp-card) border-b border-neutral-100 last:border-b-0 ${
              col.id === exitingId ? 'pointer-events-none animate-collapse-out' : ''
            }`}
            onAnimationEnd={() => {
              if (col.id === exitingId) commitDelete(col.id);
            }}
          >
            {editingId === col.id ? (
              <div className="flex gap-(--sp-field)">
                <Input
                  value={editName}
                  onChange={setEditName}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(col.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
                <Button variant="primary" size="sm" onClick={() => handleRename(col.id)}>
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-900">{col.name}</span>
                  <div className="flex items-center gap-1">
                    <IconButton
                      label="Load this collection (select these groups)"
                      onClick={() => onLoadCollection(col.groupIds)}
                      variant="ghost"
                      size="sm"
                    >
                      <Icon type="upload" size="sm" />
                    </IconButton>
                    <IconButton
                      label="Update with current selection"
                      onClick={() => handleUpdateGroupIds(col.id)}
                      variant="ghost"
                      size="sm"
                      disabled={selectedGroupIds.size === 0}
                    >
                      <Icon type="refresh" size="sm" />
                    </IconButton>
                    <IconButton
                      label="Rename"
                      onClick={() => {
                        setEditingId(col.id);
                        setEditName(col.name);
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      <Icon type="pencil" size="sm" />
                    </IconButton>
                    <IconButton
                      label="Delete collection"
                      onClick={() => handleDelete(col.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Icon type="trash" size="sm" />
                    </IconButton>
                  </div>
                </div>
                {col.description && (
                  <p className="text-xs text-neutral-500 mb-1.5">{col.description}</p>
                )}
                <div className="flex flex-wrap gap-(--sp-inline)">
                  {col.groupIds.slice(0, 5).map((gid) => (
                    <span
                      key={gid}
                      className="px-1.5 py-0.5 bg-neutral-50 text-xs text-neutral-600 rounded border border-neutral-200 truncate max-w-[150px]"
                    >
                      {getGroupName(gid)}
                    </span>
                  ))}
                  {col.groupIds.length > 5 && (
                    <span className="px-1.5 py-0.5 bg-neutral-50 text-xs text-neutral-500 rounded border border-neutral-200">
                      +{col.groupIds.length - 5} more
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 mt-1.5">
                  {col.groupIds.length} groups &middot; Updated {formatDateShort(col.updatedAt)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupCollections;
