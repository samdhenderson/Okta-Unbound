import pkg from '../../package.json' with { type: 'json' };

export const CHROME_WEB_STORE_ID: string = pkg.chromeWebStoreId;

export const CHROME_WEB_STORE_URL = `https://chromewebstore.google.com/detail/${pkg.name}/${CHROME_WEB_STORE_ID}`;
