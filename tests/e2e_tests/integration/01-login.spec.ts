// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import axios from 'axios';
import * as https from 'https';

import test, { expect } from '../fixtures/fixtures';
import { baseUrlToDomain, isLoggedIn, prepareCookies } from '../utils/commands';
import { selectors, storagePath, timeouts } from '../utils/constants';

test.describe('Login', () => {
  test.describe('works as expected', () => {
    test('Logs in using UI', async ({ baseUrl, context, page, password, username }) => {
      console.log(`logging in user with username: ${username} and password: ${password}`);
      // enter valid username and password
      await page.goto(`${baseUrl}ui/`);
      const emailInput = await page.getByPlaceholder(/email/i);
      await emailInput.fill(username);
      const passwordInput = await page.getByLabel(/password/i);
      await passwordInput.fill(password);
      await page.getByRole('button', { name: /log in/i }).click();
      // confirm we have logged in successfully
      await isLoggedIn(page);
      await page.evaluate(() => localStorage.setItem(`onboardingComplete`, 'true'));
      await context.storageState({ path: storagePath });
    });

    test('does not stay logged in across sessions, after browser restart', async ({ baseUrl, page }) => {
      await page.goto(`${baseUrl}ui/`);
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
    });

    test('Logs out using UI', async ({ baseUrl, page, password, username }) => {
      await page.goto(`${baseUrl}ui/`);
      await page.getByPlaceholder(/email/i).fill(username);
      await page.getByLabel(/password/i).fill(password);
      await page.getByRole('button', { name: /log in/i }).click();
      // now we can log out
      await page.getByRole('button', { name: username }).click();
      await page.getByText(/log out/i).click();
      await page.getByRole('button', { name: /log in/i }).waitFor({ timeout: 2 * timeouts.oneSecond });
      expect(page.getByRole('button', { name: /log in/i }).isVisible()).toBeTruthy();
    });

    test('fails to access unknown resource', async ({ baseUrl, page }) => {
      await page.goto(`${baseUrl}ui/`);
      const request = await axios.get(`${baseUrl}/users`, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
      expect(request.status).toEqual(200);
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
    });

    test('Does not log in with invalid password', async ({ baseUrl, page, username }) => {
      console.log(`logging in user with username: ${username} and password: lewrongpassword`);
      await page.goto(`${baseUrl}ui/`);
      // enter valid username and invalid password
      const emailInput = await page.getByPlaceholder(/email/i);
      await emailInput.click();
      await emailInput.fill(username);
      const passwordInput = await page.getByLabel(/password/i);
      await passwordInput.click();
      await passwordInput.fill('lewrongpassword');
      await page.getByRole('button', { name: /log in/i }).click();

      // still on /login page plus an error is displayed
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
      await page.waitForSelector('text=There was a problem logging in');
    });

    test('Does not log in without password', async ({ baseUrl, page, username }) => {
      console.log(`logging in user with username: ${username} and without a password`);
      await page.goto(`${baseUrl}ui/`);
      // enter valid username and invalid password
      await page.waitForSelector(selectors.email);
      await page.click(selectors.email);
      await page.fill(selectors.email, username);
      expect(await page.isDisabled('button:has-text("Log in")')).toBeTruthy();
    });
  });

  test('stays logged in across sessions, after browser restart if selected', async ({ baseUrl, browser, context, password, username }) => {
    console.log(`logging in user with username: ${username} and password: ${password}`);
    const domain = baseUrlToDomain(baseUrl);
    await context.addCookies([{ name: 'cookieconsent_status', value: 'allow', path: '/', domain }]);
    const page = await context.newPage();
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password
    const emailInput = await page.getByPlaceholder(/email/i);
    await emailInput.click();
    await emailInput.fill(username);
    const passwordInput = await page.getByLabel(/password/i);
    await passwordInput.click();
    await passwordInput.fill(password);
    const checkbox = await page.getByLabel(/stay logged in/i);
    await checkbox.check();
    await page.getByRole('button', { name: /log in/i }).click();

    // confirm we have logged in successfully
    await isLoggedIn(page);
    let loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
    expect(loginVisible).toBeFalsy();
    await page.getByText(/Releases/i).click();
    await context.storageState({ path: storagePath });
    let differentContext = await browser.newContext({ storageState: storagePath });
    differentContext = await prepareCookies(differentContext, domain, '');
    const differentPage = await differentContext.newPage();
    await differentPage.goto(`${baseUrl}ui/`);
    // page.reload();
    loginVisible = await differentPage.getByRole('button', { name: /log in/i }).isVisible();
    expect(loginVisible).toBeFalsy();
    expect(await differentPage.getByText('Getting started').isVisible()).toBeFalsy();
  });
});
