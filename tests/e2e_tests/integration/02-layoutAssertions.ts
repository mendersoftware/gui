import { BrowserContext, Page } from 'playwright';
import { test, expect } from '@playwright/test';

import { setupPage, login } from '../utils/commands';
import { contextOptions, testParams } from '../config';

const { baseUrl, environment, password, username } = testParams;

test.describe('Layout assertions', () => {
  let page: Page;
  let context: BrowserContext;
  test.beforeEach(async ({ browser }) => {
    const storageState = JSON.parse(process.env.STORAGE || '{}');
    context = await browser.newContext({ ...contextOptions.contextOptions, storageState });
    if (!process.env.STORAGE) {
      context = await login(username, password, baseUrl, context);
    }
    page = await setupPage(environment, context, page, baseUrl);
    await page.goto(`${baseUrl}ui/`);
  });

  test.afterEach(async () => {
    const storage = await context.storageState();
    process.env.STORAGE = JSON.stringify(storage);
  });

  test.describe('Overall layout and structure', () => {
    const navbar = '.leftFixed.leftNav';
    test('shows the left navigation', async () => {
      await page.waitForSelector('text=License information');
      expect(await page.isVisible(`${navbar}:has-text('Dashboard')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Devices')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Releases')`)).toBeTruthy();
      expect(await page.isVisible(`${navbar}:has-text('Deployments')`)).toBeTruthy();
    });

    test('has clickable header buttons', async () => {
      await page.waitForSelector('text=License information');
      expect(await page.isVisible(`${navbar}:has-text('Dashboard')`)).toBeTruthy();

      await page.click(`${navbar}:has-text('Dashboard')`);
      await page.click(`${navbar}:has-text('Devices')`);
      await page.click(`${navbar}:has-text('Releases')`);
      await page.click(`${navbar}:has-text('Deployments')`);
    });

    test('can authorize a device', async () => {
      await page.click(`.leftNav :text('Devices')`);
      const hasAcceptedDevice = await page.isVisible('.deviceListItem');
      if (!hasAcceptedDevice) {
        await page.click(`a:has-text('Pending')`);
        await page.waitForSelector('.deviceListItem', { timeout: 60000 });
        await page.click('.deviceListItem input');
        await page.click('.MuiSpeedDial-fab');
        await page.hover('#device-actions-actions');
        await page.click('[aria-label="accept"]');
      }
      await page.click(`:is(a:has-text('Device groups'))`);
      await page.waitForSelector(`css=.deviceListItem >> text=/release/`, { timeout: 60000 });
      const element = await page.textContent('.deviceListItem');
      expect(element.includes('release')).toBeTruthy();
      await page.click('.deviceListItem');
    });

    test('can group a device', async () => {
      await page.click(`.leftNav :text('Devices')`);
      await page.click('.deviceListItem input');
      await page.hover('.MuiSpeedDial-fab');
      await page.click('[aria-label="group-add"]');
      await page.type('#group-creation-selection', 'testgroup');
      await page.click('.MuiDialogTitle-root');
      await page.click(`:is(:text-matches('create group', 'i'), :text-matches('add to group', 'i'))`);
      expect(await page.isVisible(`.grouplist:has-text('testgroup')`)).toBeTruthy();
    });
  });
});
