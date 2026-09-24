export const GUIDE_PAGE_PATH = 'src/guide/index.html';

export type GuideEntryChapter = 'welcome' | 'roadmap';

export function guideUrl(chapter: GuideEntryChapter): string {
  return `${chrome.runtime.getURL(GUIDE_PAGE_PATH)}#/${chapter}`;
}

export async function openGuide(chapter: GuideEntryChapter): Promise<void> {
  await chrome.tabs.create({ url: guideUrl(chapter) });
}
