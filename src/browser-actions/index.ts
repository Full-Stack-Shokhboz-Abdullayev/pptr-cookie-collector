import { Browser, Page } from 'puppeteer';
import { mockProfileId, mockUser } from '../constants';
import {
  getAuthToken,
  getProfile,
  updateProfileCookies,
} from '../server-actions';
import { State } from '../typings/State.type';
import { runUnzip, runZip } from '../utils/zip-unzip';

export const setCookies = async (page: Page, cookies: any[]) => {
  const client = await page.target().createCDPSession();

  const items = cookies
    .map((cookie) => {
      const item = Object.assign({}, cookie);
      if (!item.value) item.value = '';
      console.assert(!item.url, `Cookies must have a URL defined`);
      console.assert(
        item.url !== 'about:blank',
        `Blank page can not have cookie "${item.name}"`,
      );
      console.assert(
        !String.prototype.startsWith.call(item.url || '', 'data:'),
        `Data URL page can not have cookie "${item.name}"`,
      );
      return item;
    })
    .filter((cookie) => cookie.name);

  await page.deleteCookie(...items);

  if (items.length) await client.send('Network.setCookies', { cookies: items });
};

export const getCookies = async (page: Page) => {
  const client = await page.target().createCDPSession();
  const { cookies } = await client.send('Network.getAllCookies');
  return cookies;
};

const getCookiesFromServer = async () => {
  const accessToken = await getAuthToken(mockUser);
  const { cookies } = await getProfile(accessToken, mockProfileId);
  return {
    cookies: cookies.data.data,
  };
};

export const setCookiesToServer = async (state: State) => {
  const accessToken = await getAuthToken(mockUser);

  const cookies = runZip(state.cookies);

  const isUpdated = await updateProfileCookies(
    accessToken,
    mockProfileId,
    cookies,
  );

  return isUpdated;
};

export const onload = async (browser: Browser, state: State) => {
  const firstPage = (await browser.pages())[0];

  const { cookies } = await getCookiesFromServer();

  const fromServer = await runUnzip(cookies).catch(() => []);

  state.cookies = [...state.cookies, ...fromServer];

  await setCookies(firstPage, state.cookies);
  console.log('Starting session with cookies:', state.cookies.length);

  console.log('Cookies set; ready to go!');

  firstPage.on('framenavigated', async function () {
    state.cookies = await getCookies(firstPage);
  });
};
