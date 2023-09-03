// Copyright 2022 Northern.tech AS
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
import * as fs from 'fs';
import * as https from 'https';

import test, { expect } from '../fixtures/fixtures';
import { getStorageState, isLoggedIn } from '../utils/commands';
import { timeouts } from '../utils/constants';

const samlSettings = {
  credentials: {
    chromium: { login: 'morty', password: 'panic', email: 'msmith@samltest.id' },
    firefox: { login: 'rick', password: 'psych', email: 'rsanchez@samltest.id' },
    webkit: { login: 'sheldon', password: 'bazinga', email: 'scooper@samltest.id' }
  },
  idp_url: 'https://samltest.id/saml/idp'
};

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const defaultHeaders = { 'Content-Type': 'application/json' };

test.describe('SAML Login via sso/id/login', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ storageState: 'storage.json' });
  test.afterAll(async ({ environment, baseUrl, browserName }, testInfo) => {
    if (testInfo.status === 'skipped' || environment !== 'staging') {
      return;
    }
    const jwt = getStorageState('storage.json').cookies.find(cookie => cookie.name === 'JWT').value;
    const requestInfo = { headers: { ...defaultHeaders, Authorization: `Bearer ${jwt}` }, httpsAgent, method: 'GET' };
    console.log(`Finished ${testInfo.title} with status ${testInfo.status}. Cleaning up.`);
    const response = await axios({
      ...requestInfo,
      url: `${baseUrl}api/management/v1/useradm/users?email=${encodeURIComponent(samlSettings.credentials[browserName].email)}`
    });
    if (response.status >= 300 || !response.data.length) {
      console.log(`${samlSettings.credentials[browserName].email} does not exist.`);
      return;
    }
    const { id: userId } = response.data[0];
    await axios({
      ...requestInfo,
      url: `${baseUrl}api/management/v1/useradm/users/${userId}`,
      method: 'DELETE'
    });
    console.log(`removed user ${samlSettings.credentials[browserName].email}.`);
  });

  // Setups the SAML/SSO login with samltest.id Identity Provider
  test('Set up SAML', async ({ context, environment, baseUrl, page }) => {
    test.skip(environment !== 'staging');
    // allow a lot of time to enter metadata + then some to handle uploading the config to the external service
    test.setTimeout(5 * timeouts.sixtySeconds + timeouts.fifteenSeconds);

    const { data: metadata, status } = await axios({ url: samlSettings.idp_url, method: 'GET' });
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(300);
    await page.goto(`${baseUrl}ui/settings/organization-and-billing`);
    const isInitialized = await page.isVisible('text=Entity ID');
    if (!isInitialized) {
      // Check input[type="checkbox"]
      await page.locator('input[type="checkbox"]').check();
      // Click text=input with the text editor
      await page.locator('text=input with the text editor').click();

      const textfield = await page.locator('[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]');
      await textfield.type(metadata.replace(/(?:\r\n|\r|\n)/g, ''));
      console.log('typing metadata done.');
      // The screenshot saves the view of the typed metadata
      await page.screenshot({ 'path': 'saml-edit-saving.png' });
      // Click text=Save >> nth=1
      await page.locator('text=Save').nth(1).click();
      await page.waitForSelector('text=Entity ID');
    }

    await page.locator('text=View metadata in the text editor').click();
    // Click text=Download file
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /download file/i }).click()]);
    const downloadTargetPath = await download.path();
    expect(downloadTargetPath).toBeTruthy();
    const dialog = await page.locator('text=SAML metadata >> .. >> ..');
    await dialog.locator('data-testid=CloseIcon').click();
    const storage = await context.storageState();
    const jwt = storage.cookies.find(cookie => cookie.name === 'JWT').value;
    const requestInfo = { method: 'GET', headers: { ...defaultHeaders, Authorization: `Bearer ${jwt}` }, httpsAgent };
    const { data } = await axios({ ...requestInfo, url: `${baseUrl}api/management/v1/useradm/sso/idp/metadata` });
    const metadataId = data[0].id;
    console.log(`looking for config info for metadata id: ${metadataId}`);
    const expectedLoginUrl = `${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/login`;
    await page.waitForSelector(`text=${expectedLoginUrl}`);
    expect(await page.isVisible(`text=${expectedLoginUrl}`)).toBeTruthy();
    const expectedAcsUrl = `${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/acs`;
    expect(await page.isVisible(`text=${expectedAcsUrl}`)).toBeTruthy();
    const expectedSpMetaUrl = `${baseUrl}api/management/v1/useradm/sso/sp/metadata/${metadataId}`;
    expect(await page.isVisible(`text=${expectedSpMetaUrl}`)).toBeTruthy();

    const { data: spMetadata, status: spDataStatus } = await axios({ ...requestInfo, url: expectedSpMetaUrl });
    expect(spDataStatus).toBeGreaterThanOrEqual(200);
    expect(spDataStatus).toBeLessThan(300);

    const serviceProviderMetadata = spMetadata.replaceAll('Signed="true"', 'Signed="false"');
    fs.writeFileSync('fixtures/service_provider_metadata.xml', serviceProviderMetadata);

    await page.goto('https://samltest.id/upload.php');
    await page.waitForSelector('text=Metadata Upload Form');
    await page.locator('input[type="file"]').setInputFiles('fixtures/service_provider_metadata.xml');
    await page.getByRole('button', { name: /upload/i }).click();
    await expect(page).toHaveURL('https://samltest.id/upload.php');
    await page.waitForSelector('text=We now trust you');
  });

  // Creates a user with login that matches Identity privder (samltest.id) user email
  test('Creates a user without a password', async ({ environment, browserName, baseUrl, page }) => {
    test.skip(environment !== 'staging');
    await page.goto(`${baseUrl}ui/settings/user-management`);
    const userExists = await page.isVisible(`text=${samlSettings.credentials[browserName].email}`);
    if (userExists) {
      console.log(`${samlSettings.credentials[browserName].email} already exists.`);
      return;
    }
    // Click text=Create new user
    await page.locator('text=Create new user').click();
    // Click [placeholder="Email"]
    await page.locator('[placeholder="Email"]').click();
    // Fill [placeholder="Email"]
    await page.locator('[placeholder="Email"]').fill(samlSettings.credentials[browserName].email);
    // Click text=Create user
    await page.locator('text=Create user').click();
    await page.screenshot({ path: './test-results/user-created.png' });
    await page.waitForSelector('text=The user was created successfully.');
    console.log(`${samlSettings.credentials[browserName].email} created.`);
  });

  // This test calls auth/sso/${id}/login, where id is the id of the identity provider
  // and verifies that login is successful.
  test('User can login via sso/login endpoint', async ({ environment, browserName, baseUrl, browser, loggedInPage }) => {
    test.skip(environment !== 'staging');
    test.setTimeout(2 * timeouts.fifteenSeconds);

    await loggedInPage.goto(`${baseUrl}ui/settings/organization-and-billing`);
    await loggedInPage.waitForSelector('text=View metadata in the text editor', { timeout: timeouts.tenSeconds });
    let loginUrl = '';
    let loginThing = await loggedInPage.locator('*:below(:text("Start URL"))').first();
    loginUrl = await loginThing.getAttribute('title');
    if (!loginUrl) {
      loginThing = await loggedInPage.locator(':text("Start URL") + *').first();
      loginUrl = await loginThing.innerText();
    }
    console.log(`logging in via ${loginUrl} (credentials set:${browserName})`);
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(loginUrl);
    // This screenshot saves the view right after the first redirection
    await page.screenshot({ path: './test-results/saml-redirected.png' });

    // fill login info
    await page.fill('label:has-text("username")', samlSettings.credentials[browserName].login);
    await page.fill('label:has-text("password")', samlSettings.credentials[browserName].password);

    // Click button:has-text("Login")
    await page.locator('button:has-text("Login")').click();
    await page.waitForSelector('text=Accept');
    // This screen shot saves the summary of the data that will be sent in assertion
    await page.screenshot({ path: './test-results/saml-logging-in.png' });

    // Click text=Accept
    await page.locator('text=Accept').click();
    // confirm we have logged in successfully
    await page.screenshot({ path: './test-results/saml-logging-in-accept.png' });
    await isLoggedIn(page);
  });
});
