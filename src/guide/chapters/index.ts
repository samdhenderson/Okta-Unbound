import { lazy, type LazyExoticComponent, type ComponentType } from 'react';
import type { ChapterId } from '../chapters';

type ChapterComponent = LazyExoticComponent<ComponentType>;

export const CHAPTER_COMPONENTS: Readonly<Record<ChapterId, ChapterComponent>> = {
  welcome: lazy(() => import('./welcome')),
  home: lazy(() => import('./home')),
  users: lazy(() => import('./users')),
  groups: lazy(() => import('./groups')),
  apps: lazy(() => import('./apps')),
  rules: lazy(() => import('./rules')),
  policies: lazy(() => import('./policies')),
  export: lazy(() => import('./export')),
  history: lazy(() => import('./history')),
  selection: lazy(() => import('./selection')),
  palette: lazy(() => import('./palette')),
  roadmap: lazy(() => import('./roadmap')),
};
