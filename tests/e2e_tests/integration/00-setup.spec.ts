import jwtDecode from 'jwt-decode';
import * as fs from 'fs';
import { test, expect } from '@playwright/test';

import { login, tenantTokenRetrieval, baseUrlToDomain } from '../utils/commands';
import { contextOptions, testParams } from '../config';

const { baseUrl, environment, password, username } = testParams;

// Run this test with the '--param screenshotOnFailure' command line parameter
// or 'npm run test'.

test.describe('Test setup', () => {
  test.describe('basic window checks', () => {
    test('get the global window object', async ({ context, page }) => {
      page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      const theWindow = await page.evaluate(() => window.innerWidth);
      expect(theWindow).toBeDefined();
    });
    test('get the document object', async ({ page }) => {
      const documentCharset = await page.evaluate(() => document.charset);
      expect(documentCharset).toBeDefined();
      expect(documentCharset).toEqual('UTF-8');
    });
    test('get the title', async ({ context, page }) => {
      page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      expect(await page.title()).toContain('Mender');
    });
  });

  test.describe('account creation', () => {
    test('allows account creation', async ({ context }) => {
      test.skip(environment !== 'staging');
      const domain = baseUrlToDomain(baseUrl);
      await context.addCookies([{ name: 'cookieconsent_status', value: 'allow', path: '/', domain }]);
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible('text=/Sign up/i')).toBeTruthy();
      await page.click(`text=/Sign up/i`);
      console.log(`creating user with username: ${username} and password: ${password}`);
      await page.type('[id=email]', username);
      await page.type('[id=password_new]', password);
      await page.$eval('[id=password_new]', (el: HTMLInputElement) => (el.value = ''));
      await page.type('[id=password_new]', password);
      await page.type('[id=password_confirmation]', password);

      await page.click(`button:has-text('Sign up')`);
      await page.waitForSelector(`button:has-text('Complete')`);
      await page.type('[id=name]', 'CI test corp');
      await page.check('[id=tos]');
      let recaptcha;
      for (let frame of await page.frames()) {
        recaptcha = await frame.$('#recaptcha-anchor');
        if (recaptcha) {
          break;
        }
      }
      await recaptcha.click();
      await page.waitForTimeout(2000);
      await page.click(`button:has-text('Complete')`);
      await page.waitForTimeout(5000);
      let cookies = await context.cookies();
      const cookie = cookies.find(cookie => cookie.name === 'JWT');
      const userId = jwtDecode(cookie.value).sub;
      await page.evaluate(({ userId }) => localStorage.setItem(`${userId}-onboarding`, JSON.stringify({ complete: true })), { userId });
      await context.addCookies([{ name: `${userId}-onboarded`, value: 'true', path: '/', domain }]);
      cookies = await context.cookies();
      const cookieJson = JSON.stringify(cookies);
      fs.writeFileSync('cookies.json', cookieJson);
      await page.pause();
      await page.waitForSelector('text=/License information/i', { timeout: 15000 });
    });
    test('supports tenant token retrieval', async ({ context }) => {
      test.skip(environment !== 'staging');
      console.log(`logging in user with username: ${username} and password: ${password}`);
      const domain = baseUrlToDomain(baseUrl);
      await context.addCookies([{ name: 'cookieconsent_status', value: 'allow', path: '/', domain }]);
      // enter valid username and password
      let loggedInContext = await login(username, password, baseUrl, context);
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      const token = await tenantTokenRetrieval(baseUrl, loggedInContext, page);
      fs.writeFileSync('token.json', token);
    });
  });
});
