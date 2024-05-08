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
import { storagePath, timeouts } from '../utils/constants';

const emailEntryFieldLabel = 'Your email';
const loginEntryFieldLabel = 'Log in';

test.describe('Login', () => {
  test.describe('works as expected', () => {
    test('Logs in using UI', async ({ baseUrl, page, password, username }) => {
      await page.goto(`${baseUrl}ui/`);
      console.log(`logging in user with username: ${username} and password: ${password}`);
      const emailEntryFieldVisible = await page.getByPlaceholder(emailEntryFieldLabel);
      expect(emailEntryFieldVisible).toBeTruthy();

      await emailEntryFieldVisible.fill(username);
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();
      const passwordEntryFieldVisible = await page.getByLabel('Password');
      expect(passwordEntryFieldVisible).toBeTruthy();
      await passwordEntryFieldVisible.fill(password);
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();
    });

    test('does not stay logged in across sessions, after browser restart', async ({ baseUrl, page }) => {
      await page.goto(`${baseUrl}ui/`);
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
    });

    test('Logs out using UI', async ({ baseUrl, page, password, username }) => {
      await page.goto(`${baseUrl}ui/`);
      console.log(`logging in user with username: ${username} and password: ${password}`);
      const emailEntryFieldVisible = await page.getByPlaceholder(emailEntryFieldLabel);
      expect(emailEntryFieldVisible).toBeTruthy();

      await emailEntryFieldVisible.fill(username);
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();
      const passwordEntryFieldVisible = await page.getByLabel('Password');
      expect(passwordEntryFieldVisible).toBeTruthy();
      await passwordEntryFieldVisible.fill(password);
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();
      // now we can log out
      await page.getByRole('button', { name: username }).click();
      await page.getByText(/log out/i).click();
      await page.getByRole('button', { name: loginEntryFieldLabel }).waitFor({ timeout: 2 * timeouts.oneSecond });
      expect(page.getByRole('button', { name: loginEntryFieldLabel }).isVisible()).toBeTruthy();
    });

    test('fails to access unknown resource', async ({ baseUrl, page }) => {
      await page.goto(`${baseUrl}ui/`);
      const request = await axios.get(`${baseUrl}/users`, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
      expect(request.status).toEqual(200);
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
    });

    test('Does not log in with invalid password', async ({ baseUrl, page, username }) => {
      await page.goto(`${baseUrl}ui/`);
      // enter valid username and invalid password
      const emailEntryFieldVisible = await page.getByPlaceholder(emailEntryFieldLabel);
      expect(emailEntryFieldVisible).toBeTruthy();

      await emailEntryFieldVisible.fill(username);
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();
      const passwordEntryFieldVisible = await page.getByLabel('Password');
      expect(passwordEntryFieldVisible).toBeTruthy();
      await passwordEntryFieldVisible.fill('lewrongpassword');
      await page.getByRole('button', { name: loginEntryFieldLabel }).click();

      // still on /login page plus an error is displayed
      const loginVisible = await page.getByRole('button', { name: /log in/i }).isVisible();
      expect(loginVisible).toBeTruthy();
      await page.waitForSelector('text=There was a problem logging in');
    });
  });

  test('stays logged in across sessions, after browser restart if selected', async ({ baseUrl, browser, context, password, username }) => {
    console.log(`logging in user with username: ${username} and password: ${password}`);
    const domain = baseUrlToDomain(baseUrl);
    await context.addCookies([{ name: 'cookieconsent_status', value: 'allow', path: '/', domain }]);
    const page = await context.newPage();
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password
    await page.goto(`${baseUrl}ui/`);
    const emailEntryFieldVisible = await page.getByPlaceholder(emailEntryFieldLabel);
    expect(emailEntryFieldVisible).toBeTruthy();

    await emailEntryFieldVisible.fill(username);
    await page.getByRole('button', { name: loginEntryFieldLabel }).click();
    const passwordEntryFieldVisible = await page.getByLabel('Password');
    expect(passwordEntryFieldVisible).toBeTruthy();
    await passwordEntryFieldVisible.fill(password);
    await page.getByRole('button', { name: loginEntryFieldLabel }).click();

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
