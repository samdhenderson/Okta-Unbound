export type GuideHost = 'extension' | 'web';

export const GUIDE_HOST: GuideHost =
  import.meta.env.VITE_GUIDE_HOST === 'web' ? 'web' : 'extension';

export const IS_HOSTED_GUIDE: boolean = GUIDE_HOST === 'web';
