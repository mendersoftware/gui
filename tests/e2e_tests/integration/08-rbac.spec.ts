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
import test, { expect } from '../fixtures/fixtures';
import { isLoggedIn, processLoginForm } from '../utils/commands';
import { selectors, timeouts } from '../utils/constants';

test.describe('RBAC functionality', () => {
  test('allows access to user management', async ({ baseUrl, loggedInPage: page }) => {
    await page.goto(`${baseUrl}ui/settings`);
    await page.waitForSelector('text=/Global settings/i');
    await page.click('text=/user management/i');
    await page.goto(`${baseUrl}ui/settings/user-management`);
    const isVisible = await page.isVisible(`text=/Create new user/i`);
    if (!isVisible) {
      console.log('settings may not be loaded - move around');
      await page.goto(`${baseUrl}ui/help`);
      await page.goto(`${baseUrl}ui/settings/user-management`);
    }
    await page.waitForSelector('css=button >> text=Create new user');
  });
  test('allows role creation for static groups', async ({ baseUrl, environment, loggedInPage: page }) => {
    test.skip(!['enterprise', 'staging'].includes(environment));
    // test.use({ storageState: storagePath });
    await page.goto(`${baseUrl}ui/settings`);
    await page.waitForSelector('text=/Global settings/i');
    await page.click('text=/roles/i');
    await page.waitForSelector('text=Add a role');
    await page.click('text=Add a role');
    let nameInput = await page.locator('label:has-text("name") >> ..');
    const dialog = await nameInput.locator('.. >> .. >> ..');
    nameInput = await nameInput.locator('input');
    await nameInput.click();
    await nameInput.fill('testRole');
    await nameInput.press('Tab');
    await dialog.locator('#role-description').fill('some description');
    await dialog.locator('text=Search groups​').click({ force: true });
    // we need to check the entire page here, since the selection list is rendered in a portal, so likely outside
    // of the dialog tree
    await page.locator('li[role="option"]:has-text("testgroup")').click();
    await dialog.locator('text=Select​').nth(1).click({ force: true });
    await page.locator('text=Configure').click();
    await page.press('body', 'Escape');

    await page.waitForTimeout(timeouts.oneSecond);
    await dialog.locator('text=Search release tags​').click({ force: true });
    await page.locator('li[role="option"]:has-text("All releases")').click({ force: true });
    await dialog.locator('text=Select​').first().click({ force: true });
    await page.locator('li[role="option"]:has-text("Read")').click();
    await page.press('body', 'Escape');
    await dialog.locator('text=Submit').scrollIntoViewIfNeeded();
    await dialog.locator('text=Submit').click();
  });

  test('allows user creation', async ({ baseUrl, environment, loggedInPage: page, password, username }) => {
    await page.goto(`${baseUrl}ui/settings/user-management`);
    await page.getByRole('button', { name: /Create new user/i }).click();
    await page.getByPlaceholder(/email/i).click();
    await page.getByPlaceholder(/email/i).fill(`limited-${username}`);
    await page.getByPlaceholder(/Password/i).click();
    await page.getByPlaceholder(/Password/i).fill(password);
    if (['enterprise', 'staging'].includes(environment)) {
      await page.getByRole('combobox', { name: /admin/i }).click();
      // first we need to deselect the default admin role
      await page.getByRole('option', { name: 'Admin' }).click();
      await page.getByRole('option', { name: 'testRole' }).click();
      await page.press('body', 'Escape');
    }
    await page.click(`text=/Create user/i`);
    await page.waitForSelector('text=The user was created successfully.');
  });

  test('can log in to a newly created user', async ({ baseUrl, page, environment, password, username }) => {
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password of the new user
    await processLoginForm({ username, password, environment, page });
    await isLoggedIn(page);
  });

  test('has working RBAC limitations', async ({ baseUrl, environment, page, password, username }) => {
    test.skip(!['enterprise', 'staging'].includes(environment));
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password of the new user
    await processLoginForm({ username: `limited-${username}`, password, page, environment });
    await isLoggedIn(page);
    await page.reload();
    const releasesButton = page.getByText(/releases/i);
    await releasesButton.waitFor({ timeout: timeouts.tenSeconds });
    await releasesButton.click();

    // the created role doesn't have permission to upload artifacts, so the button shouldn't be visible
    expect(await page.isVisible(`css=button >> text=Upload`)).toBeFalsy();

    await page.click(`.leftNav :text('Devices')`);
    await page.click(`${selectors.deviceListItem} div:last-child`);
    // the created role does have permission to configure devices, so the section should be visible
    await page.click(`text=/configuration/i`);
    await page.waitForSelector('text=/Device configuration/i', { timeout: timeouts.tenSeconds });
  });
});
