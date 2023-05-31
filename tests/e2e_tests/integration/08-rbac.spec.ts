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
import { selectors } from '../utils/constants';

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
    // test.use({ storageState: 'storage.json' });
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
    await dialog.locator('text=Select​').click({ force: true });
    await page.locator('text=Configure').click();
    await page.press('body', 'Escape');
    await dialog.locator('input:right-of(:text("Releases")) >> ..').first().click();
    await page.locator('li[role="option"]:has-text("Read")').click();
    await page.press('body', 'Escape');
    await dialog.locator('text=Submit').scrollIntoViewIfNeeded();
    await dialog.locator('text=Submit').click();
  });

  test('allows user creation', async ({ baseUrl, environment, loggedInPage: page, password, username }) => {
    await page.goto(`${baseUrl}ui/settings/user-management`);
    await page.click(`text=/Create new user/i`);
    await page.locator('[placeholder="Email"]').click();
    await page.locator('[placeholder="Email"]').fill(`limited-${username}`);
    await page.locator('[placeholder="Password"]').click();
    await page.locator('[placeholder="Password"]').fill(password);
    if (['enterprise', 'staging'].includes(environment)) {
      const roleInput = await page.locator('label:has-text("Roles") >> ..');
      await roleInput.locator('[role="button"]').click();
      await page.locator('text=testRole').click();
      await page.press('body', 'Escape');
    }
    await page.click(`text=/Create user/i`);
    await page.waitForSelector('text=The user was created successfully.');
  });

  test('can log in to a newly created user', async ({ baseUrl, page, password, username }) => {
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password of the new user
    await page.waitForSelector(selectors.email);
    await page.click(selectors.email);
    await page.fill(selectors.email, `limited-${username}`);
    await page.waitForSelector(selectors.password);
    await page.click(selectors.password);
    await page.fill(selectors.password, password);
    await page.click(`button:has-text('Log in')`);
    await page.waitForSelector('text=License information');
  });

  test('has working RBAC limitations', async ({ baseUrl, environment, page, password, username }) => {
    test.skip(!['enterprise', 'staging'].includes(environment));
    await page.goto(`${baseUrl}ui/`);
    // enter valid username and password of the new user
    await page.waitForSelector(selectors.email);
    await page.click(selectors.email);
    await page.fill(selectors.email, `limited-${username}`);
    await page.waitForSelector(selectors.password);
    await page.click(selectors.password);
    await page.fill(selectors.password, password);
    await page.click(`button:has-text('Log in')`);
    await page.waitForSelector('text=License information');
    await page.reload();
    const releasesButton = page.getByText(/releases/i);
    await releasesButton.waitFor({ timeout: 7000 });
    await releasesButton.click();

    // the created role doesn't have permission to upload artifacts, so the button shouldn't be visible
    expect(await page.isVisible(`css=button >> text=Upload`)).toBeFalsy();

    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    // the created role does have permission to configure devices, so the section should be visible
    await page.click(`text=/configuration/i`);
    await page.waitForSelector('text=/Device configuration/i', { timeout: 10000 });
  });
});
