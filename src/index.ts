import puppeteer from 'puppeteer';
import { getCookies, onload, setCookiesToServer } from './browser-actions';
import { State } from './typings/State.type';

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--disable-site-isolation-trials'],
    });
    const state: State = {
      cookies: [],
    };

    await onload(browser, state);

    browser.on('targetcreated', async (event) => {
      const page = await event.page();
      if (page) {
        page.on('framenavigated', async function () {
          state.cookies = await getCookies(page);
        });
      }
    });

    browser.on('disconnected', async () => {
      console.log(
        'Sum of the cookies collected in the session:',
        state.cookies.length,
      );

      (await setCookiesToServer(state))
        ? console.log('Updated cookies in the server!')
        : console.log('Not updated, could not syncronise with the server :(');
    });
  } catch (err) {
    console.log(err);
  }
})();
