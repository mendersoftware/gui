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
import test, { expect } from '../fixtures/fixtures';
import { selectors } from '../utils/constants';

test.describe('Layout assertions', () => {
  const navbar = '.leftFixed.leftNav';
  test.use({ storageState: 'storage.json' });

  test.describe('Overall layout and structure', () => {
    test('shows the left navigation', async ({ loggedInPage: page }) => {
      expect(await page.isVisible(`${navbar}:has-text('Dashboard')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Devices')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Releases')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Deployments')`)).toBeTruthy();
    });

    test('has clickable header buttons', async ({ loggedInPage: page }) => {
      expect(await page.isVisible(`${navbar}:has-text('Dashboard')`)).toBeTruthy();
      await page.click(`${navbar}:has-text('Dashboard')`);
      await page.click(`${navbar}:has-text('Devices')`);
      await page.click(`${navbar}:has-text('Releases')`);
      await page.click(`${navbar}:has-text('Deployments')`);
    });
  });

  test('can authorize a device', async ({ loggedInPage: page }) => {
    test.setTimeout(140000);
    await page.click(`.leftNav :text('Devices')`);
    let hasAcceptedDevice = false;
    try {
      hasAcceptedDevice = await page.isVisible('.deviceListItem');
    } catch (e) {
      console.log(`no accepted device present so far`);
    }
    if (!hasAcceptedDevice) {
      const pendingMessage = await page.locator(`text=/pending authorization/i`);
      await pendingMessage.waitFor({ timeout: 60000 });
      await pendingMessage.click();
      await page.click(selectors.deviceListCheckbox);
      await page.hover('.MuiSpeedDial-fab');
      await page.click('[aria-label="accept"]');
    }
    await page.locator(`input:near(:text("Status:"))`).first().click({ force: true });
    await page.click(`css=.MuiPaper-root >> text=/Accepted/i`);
    await page.waitForSelector(`css=.deviceListItem >> text=/original/`, { timeout: 60000 });
    const element = await page.textContent('.deviceListItem');
    expect(element.includes('original')).toBeTruthy();
    await page.click(`.deviceListItem div:last-child`);
    await page.waitForSelector(`text=/Device information for/i`);
    expect(await page.isVisible('text=Authentication status')).toBeTruthy();
  });

  test('can group a device', async ({ loggedInPage: page }) => {
    const wasGrouped = await page.isVisible(`.grouplist:has-text('testgroup')`);
    if (wasGrouped) {
      test.skip('looks like the device was grouped already, continue with the remaining tests');
    }
    await page.click(`.leftNav :text('Devices')`);
    await page.click(selectors.deviceListCheckbox);
    await page.hover('.MuiSpeedDial-fab');
    await page.click('[aria-label="group-add"]');
    await page.type('#group-creation-selection', 'testgroup');
    await page.click('.MuiDialogTitle-root');
    await page.click(`:is(:text-matches('create group', 'i'), :text-matches('add to group', 'i'))`);
    await page.waitForSelector(`.grouplist:has-text('testgroup')`);
    expect(await page.isVisible(`.grouplist:has-text('testgroup')`)).toBeTruthy();
    await page.click(`.grouplist:has-text('All devices')`);
    await page.click(selectors.deviceListCheckbox);
    await page.click(`.grouplist:has-text('testgroup')`);
    expect(await page.locator(`css=.deviceListItem >> text=/original/`)).toBeVisible();
  });
});
