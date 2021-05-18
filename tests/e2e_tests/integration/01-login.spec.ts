import axios from 'axios';
import * as https from 'https';
import jwtDecode from 'jwt-decode';
import { BrowserContext, Page } from 'playwright';
import { test, expect } from '@playwright/test';

import { contextOptions, testParams } from '../config';

const { baseUrl, password, username } = testParams;

test.describe('Login', () => {
  test.describe('works as expected', () => {
    let page: Page;
    test.beforeEach(async ({ context }) => {
      page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
    });

    test('Logs in using UI', async ({ context }) => {
      console.log(`logging in user with username: ${username} and password: ${password}`);
      // enter valid username and password
      await page.waitForSelector('[name=email]');
      await page.click('[name=email]');
      await page.type('[name=email]', username);
      await page.waitForSelector('[name=password]');
      await page.focus('[name=password]');
      await page.type('[name=password]', password);
      await page.click(`:is(button:has-text('Log in'))`);
      // confirm we have logged in successfully
      await page.waitForSelector('text=License information');
      const cookies = await context.cookies();
      const token = cookies.find(cookie => cookie.name === 'JWT').value;
      const userId = jwtDecode(token).sub;
      await page.evaluate(({ userId }) => localStorage.setItem(`${userId}-onboarding`, JSON.stringify({ complete: true })), { userId });
      // now we can log out
      await page.click('.header-dropdown', { force: true });
      await page.click(`:is(span:has-text('Log out'))`, { force: true });
      await page.waitForSelector('text=Log in');
      const loginVisible = await page.isVisible(`:is(button:has-text('Log in'))`);
      expect(loginVisible).toBeTruthy();
    });

    test('does not stay logged in across sessions, after browser restart', async ({ context }) => {
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      const loginVisible = await page.isVisible(`:is(button:has-text('Log in'))`);
      expect(loginVisible).toBeTruthy();
    });

    test('fails to access unknown resource', async ({ context }) => {
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      const request = await axios({
        url: `${baseUrl}/users`,
        method: 'GET',
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      expect(request.status).toEqual(200);
      const loginVisible = await page.isVisible(`:is(button:has-text('Log in'))`);
      expect(loginVisible).toBeTruthy();
    });

    test('Does not log in with invalid password', async ({ context }) => {
      console.log(`logging in user with username: ${username} and password: lewrongpassword`);
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      // enter valid username and invalid password
      await page.waitForSelector('[name=email]');
      await page.click('[name=email]');
      await page.type('[name=email]', username);
      await page.waitForSelector('[name=password]');
      await page.click('[name=password]');
      await page.type('[name=password]', 'lewrongpassword');
      await page.click(`:is(button:has-text('Log in'))`);

      // still on /login page plus an error is displayed
      const loginVisible = await page.isVisible(`:is(button:has-text('Log in'))`);
      expect(loginVisible).toBeTruthy();
      await page.waitForSelector('text=There was a problem logging in');
    });
  });

  test.describe('stays logged in across sessions, after browser restart if selected', () => {
    let page: Page;
    let context: BrowserContext;
    test.beforeEach(async ({ browser }) => {
      const storageState = JSON.parse(process.env.STORAGE || '{}');
      context = await browser.newContext({ ...contextOptions.contextOptions, storageState });
      page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
    });

    test.afterEach(async () => {
      const storage = await context.storageState();
      process.env.STORAGE = JSON.stringify(storage);
    });

    test('pt1', async () => {
      console.log(`logging in user with username: ${username} and password: ${password}`);
      // enter valid username and password
      await page.waitForSelector('[name=email]');
      await page.click('[name=email]');
      await page.type('[name=email]', username);
      await page.waitForSelector('[name=password]');
      await page.click('[name=password]');
      await page.type('[name=password]', password);
      await page.check('[type=checkbox]', { force: true });
      await page.click(`:is(button:has-text('Log in'))`);

      // confirm we have logged in successfully
      await page.waitForSelector('text=License information');
    });

    test('pt2', async () => {
      await page.goto(`${baseUrl}ui/#/devices`);
      const loginVisible = await page.isVisible(`:is(button:has-text('Log in'))`);
      expect(loginVisible).toBeFalsy();
    });
  });
});
