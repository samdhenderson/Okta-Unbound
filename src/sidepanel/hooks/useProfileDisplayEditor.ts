import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_PROFILE_DISPLAY_CONFIG,
  type ProfileDisplayCategory,
  type ProfileDisplayConfig,
} from '../../shared/storage/profileDisplayStore';
import type { AttributeDescriptor } from '../components/users/profileAttributes';
import { UNCATEGORIZED, UNCATEGORIZED_LABEL } from '../components/users/profileAttributeBlocks';
import {
  addCategory,
  completeAssign,
  completeHidden,
  deleteCategory,
  indexOfAttribute,
  moveCategory,
  placeAttribute,
  renameCategory,
  sectionOrder,
  stepAttribute,
  toggleHidden,
  type AttributeStep,
} from '../components/users/profileDisplayOps';
import { useReducedMotion } from './useReducedMotion';

export type EditorDragKind = 'attr' | 'section';

const ACTIVATION_PX = 4;

export interface EditorDrag {
  kind: EditorDragKind;
  id: string;
  label: string;
  keyboard: boolean;
}

export interface EditorDropTarget {
  kind: EditorDragKind;
  key: string;
  index: number;
}

export interface EditorGhost {
  x: number;
  y: number;
}

export type ProfileDisplayOptionKey = 'layout' | 'showApiNames' | 'showRuleChips' | 'showEmpty';

export interface ProfileDisplayEditorApi {
  draft: ProfileDisplayConfig;
  sections: ReadonlyArray<ProfileDisplayCategory>;
  setOption: <K extends ProfileDisplayOptionKey>(key: K, value: ProfileDisplayConfig[K]) => void;
  rename: (key: string, name: string) => void;
  add: (name: string) => void;
  remove: (key: string) => void;
  toggleHidden: (name: string) => void;
  place: (name: string, key: string, index: number) => void;
  moveSection: (key: string, index: number) => void;
  commit: () => void;
  cancel: () => void;
  resetToDefault: () => void;
  drag: EditorDrag | null;
  dropTarget: EditorDropTarget | null;
  ghost: EditorGhost | null;
  reducedMotion: boolean;
  beginDrag: (
    kind: EditorDragKind,
    id: string,
    event: React.PointerEvent<globalThis.Element>,
  ) => void;
  lift: (kind: EditorDragKind, id: string) => void;
  step: (direction: AttributeStep) => void;
  drop: () => void;
  cancelDrag: () => void;
  announcement: string;
}

export interface UseProfileDisplayEditorOptions {
  attributes: readonly AttributeDescriptor[];
  config: ProfileDisplayConfig;
  onCommit: (config: ProfileDisplayConfig) => void;
  onCancel: () => void;
}

interface PendingPress {
  kind: EditorDragKind;
  id: string;
  x: number;
  y: number;
}

function labelFor(
  kind: EditorDragKind,
  id: string,
  attributes: readonly AttributeDescriptor[],
  config: ProfileDisplayConfig,
): string {
  if (kind === 'section') {
    return config.categories.find((category) => category.key === id)?.name ?? UNCATEGORIZED_LABEL;
  }
  return attributes.find((attribute) => attribute.name === id)?.label ?? id;
}

function sectionName(config: ProfileDisplayConfig, key: string): string {
  return sectionOrder(config).find((section) => section.key === key)?.name ?? UNCATEGORIZED_LABEL;
}

function attributeTargetAt(draggedName: string, y: number): EditorDropTarget | null {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
  if (sections.length === 0) return null;

  const host =
    sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return y >= rect.top && y <= rect.bottom;
    }) ??
    (y < sections[0].getBoundingClientRect().top ? sections[0] : sections[sections.length - 1]);

  const rows = Array.from(host.querySelectorAll<HTMLElement>('[data-row]')).filter(
    (row) => row.dataset.row !== draggedName,
  );

  let index = rows.length;
  for (let position = 0; position < rows.length; position += 1) {
    const rect = rows[position].getBoundingClientRect();
    if (y < rect.top + rect.height / 2) {
      index = position;
      break;
    }
  }
  return { kind: 'attr', key: host.dataset.section ?? UNCATEGORIZED, index };
}

function sectionTargetAt(draggedKey: string, y: number): EditorDropTarget {
  const others = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).filter(
    (section) => {
      const key = section.dataset.section ?? UNCATEGORIZED;
      return key !== UNCATEGORIZED && key !== draggedKey;
    },
  );

  let index = others.length;
  for (let position = 0; position < others.length; position += 1) {
    const rect = others[position].getBoundingClientRect();
    if (y < rect.top + rect.height / 2) {
      index = position;
      break;
    }
  }
  return { kind: 'section', key: draggedKey, index };
}

export function useProfileDisplayEditor({
  attributes,
  config,
  onCommit,
  onCancel,
}: UseProfileDisplayEditorOptions): ProfileDisplayEditorApi {
  const [draft, setDraft] = useState<ProfileDisplayConfig>(config);
  const [drag, setDrag] = useState<EditorDrag | null>(null);
  const [dropTarget, setDropTarget] = useState<EditorDropTarget | null>(null);
  const [ghost, setGhost] = useState<EditorGhost | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [isPointerSession, setIsPointerSession] = useState(false);

  const draftRef = useRef(draft);
  const dragRef = useRef(drag);
  const dropTargetRef = useRef(dropTarget);
  const attributesRef = useRef(attributes);
  useEffect(() => {
    draftRef.current = draft;
    dragRef.current = drag;
    dropTargetRef.current = dropTarget;
    attributesRef.current = attributes;
  });

  const pending = useRef<PendingPress | null>(null);
  const preLift = useRef<ProfileDisplayConfig | null>(null);
  const reducedMotion = useReducedMotion();

  const sections = useMemo(() => sectionOrder(draft), [draft]);

  const setOption = useCallback(
    <K extends ProfileDisplayOptionKey>(key: K, value: ProfileDisplayConfig[K]): void => {
      setDraft((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const rename = useCallback((key: string, name: string): void => {
    setDraft((current) => renameCategory(current, key, name));
  }, []);

  const add = useCallback((name: string): void => {
    setDraft((current) => addCategory(current, name));
  }, []);

  const remove = useCallback((key: string): void => {
    setDraft((current) => deleteCategory(current, attributesRef.current, key));
  }, []);

  const hide = useCallback((name: string): void => {
    setDraft((current) => toggleHidden(current, attributesRef.current, name));
  }, []);

  const place = useCallback((name: string, key: string, index: number): void => {
    const current = draftRef.current;
    const next = placeAttribute(current, attributesRef.current, name, key, index);
    setDraft(next);
    setAnnouncement(
      `${labelFor('attr', name, attributesRef.current, next)} moved to ${sectionName(next, key)}, ` +
        `position ${indexOfAttribute(next, name) + 1}.`,
    );
  }, []);

  const moveSection = useCallback((key: string, index: number): void => {
    const next = moveCategory(draftRef.current, key, index);
    setDraft(next);
    const landed = next.categories.findIndex((category) => category.key === key);
    setAnnouncement(
      `${labelFor('section', key, [], next)} moved to position ${landed + 1} of ${next.categories.length}.`,
    );
  }, []);

  const commit = useCallback((): void => {
    onCommit(draftRef.current);
  }, [onCommit]);

  const resetToDefault = useCallback((): void => {
    const base = DEFAULT_PROFILE_DISPLAY_CONFIG;
    const all = attributesRef.current;
    setDraft({
      ...base,
      categories: base.categories.map((category) => ({ ...category })),
      assign: completeAssign(all, base),
      hidden: completeHidden(all, base),
      attrOrder: all.map((attribute) => attribute.name),
    });
    setAnnouncement('Display reset to the default. Nothing is saved until you press Done.');
  }, []);

  const endSession = useCallback((): void => {
    pending.current = null;
    preLift.current = null;
    setIsPointerSession(false);
    setDrag(null);
    setDropTarget(null);
    setGhost(null);
  }, []);

  const drop = useCallback((): void => {
    const lifted = dragRef.current;
    const target = dropTargetRef.current;
    if (lifted && target) {
      if (target.kind === 'section') moveSection(lifted.id, target.index);
      else place(lifted.id, target.key, target.index);
    } else if (lifted) {
      setAnnouncement(`${lifted.label} kept its position.`);
    }
    endSession();
  }, [endSession, moveSection, place]);

  const cancelDrag = useCallback((): void => {
    const lifted = dragRef.current;
    if (lifted) {
      if (preLift.current) setDraft(preLift.current);
      setAnnouncement(`Move cancelled. ${lifted.label} is back where it started.`);
    }
    endSession();
  }, [endSession]);

  const beginDrag = useCallback(
    (kind: EditorDragKind, id: string, event: React.PointerEvent<globalThis.Element>): void => {
      pending.current = { kind, id, x: event.clientX, y: event.clientY };
      preLift.current = draftRef.current;
      setIsPointerSession(true);
    },
    [],
  );

  const lift = useCallback((kind: EditorDragKind, id: string): void => {
    const current = draftRef.current;
    const label = labelFor(kind, id, attributesRef.current, current);
    preLift.current = current;
    setDrag({ kind, id, label, keyboard: true });
    setDropTarget(null);
    setGhost(null);
    setAnnouncement(
      `${label} lifted. Use the arrow keys to move it, Enter to drop, Escape to cancel.`,
    );
  }, []);

  const step = useCallback(
    (direction: AttributeStep): void => {
      const lifted = dragRef.current;
      if (!lifted) return;
      const current = draftRef.current;
      const backwards = direction === 'up' || direction === 'prev-section';

      if (lifted.kind === 'section') {
        const at = current.categories.findIndex((category) => category.key === lifted.id);
        if (at === -1) return;
        const to = backwards ? at - 1 : at + 1;
        if (to < 0 || to >= current.categories.length) {
          setAnnouncement(
            `${lifted.label} is already the ${backwards ? 'first' : 'last'} section. ` +
              `It cannot move ${backwards ? 'up' : 'down'}.`,
          );
          return;
        }
        moveSection(lifted.id, to);
        return;
      }

      const next = stepAttribute(current, attributesRef.current, lifted.id, direction);
      if (next === current) {
        setAnnouncement(
          `${lifted.label} is already at the ${backwards ? 'start' : 'end'} of the profile. ` +
            'It cannot move further.',
        );
        return;
      }
      setDraft(next);
      setAnnouncement(
        `${lifted.label} moved to ${sectionName(next, next.assign[lifted.id] ?? UNCATEGORIZED)}, ` +
          `position ${indexOfAttribute(next, lifted.id) + 1}.`,
      );
    },
    [moveSection],
  );

  useEffect(() => {
    if (!isPointerSession) return;

    const onMove = (event: globalThis.PointerEvent): void => {
      const press = pending.current;
      if (press) {
        const travelled =
          Math.abs(event.clientX - press.x) + Math.abs(event.clientY - press.y) >= ACTIVATION_PX;
        if (!travelled) return;
        pending.current = null;
        const lifted: EditorDrag = {
          kind: press.kind,
          id: press.id,
          label: labelFor(press.kind, press.id, attributesRef.current, draftRef.current),
          keyboard: false,
        };
        dragRef.current = lifted;
        setDrag(lifted);
      }

      const lifted = dragRef.current;
      if (!lifted) return;
      event.preventDefault();
      setGhost({ x: event.clientX, y: event.clientY });
      const target =
        lifted.kind === 'section'
          ? sectionTargetAt(lifted.id, event.clientY)
          : attributeTargetAt(lifted.id, event.clientY);
      dropTargetRef.current = target;
      setDropTarget(target);
    };

    const onUp = (): void => {
      if (pending.current) endSession();
      else drop();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      cancelDrag();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [cancelDrag, drop, endSession, isPointerSession]);

  return {
    draft,
    sections,
    setOption,
    rename,
    add,
    remove,
    toggleHidden: hide,
    place,
    moveSection,
    commit,
    cancel: onCancel,
    resetToDefault,
    drag,
    dropTarget,
    ghost,
    reducedMotion,
    beginDrag,
    lift,
    step,
    drop,
    cancelDrag,
    announcement,
  };
}
