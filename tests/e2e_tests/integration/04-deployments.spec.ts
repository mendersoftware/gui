import { expect } from '@playwright/test';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';

import test from '../fixtures/fixtures';

dayjs.extend(isBetween);

test.describe('Deployments', () => {
  test.use({ storageState: 'storage.json' });

  test.beforeEach(async ({ baseUrl, loggedInPage: page }) => {
    await page.goto(`${baseUrl}ui/#/devices`);
    await page.waitForTimeout(2000);
    await page.goto(`${baseUrl}ui/#/releases`);
    await page.waitForTimeout(2000);
  });

  test('allows shortcut deployments', async ({ environment, loggedInPage: page }) => {
    console.log(`allows shortcut deployments`);
    // create an artifact to download first
    await page.click(`.repository-list-item:has-text('mender-demo-artifact')`);
    await page.click(`a:has-text('Create deployment')`);
    await page.waitForSelector('#deployment-device-group-selection', { timeout: 5000 });
    await page.focus('#deployment-device-group-selection');
    await page.type('#deployment-device-group-selection', 'All');
    await page.click(`#deployment-device-group-selection-popup li:has-text('All devices')`);
    await page.click(`button:has-text('Next')`);
    if (['enterprise', 'staging'].includes(environment)) {
      await page.click(`css=.MuiDialog-container button >> text=Next`);
      await page.click(`css=.MuiDialog-container button >> text=Next`);
    }
    // adding the following to ensure we reached the end of the dialog, as this might not happen in CI runs
    try {
      await page.waitForSelector('..MuiDialog-container button >> text=Next', { timeout: 1000 });
      await page.click(`.MuiDialog-container button >> text=Next`);
    } catch (e) {
      console.log(`go ahead and create the deployment`);
    }
    await page.click(`css=.MuiDialog-container button >> text=Create`);
    await page.waitForSelector('.deployment-item', { timeout: 10000 });
    await page.click(`[role="tab"]:has-text('Finished')`);
    await page.waitForSelector('.deployment-item:not(.deployment-header-item)', { timeout: 60000 });
    const datetime = await page.getAttribute('.deployment-item:not(.deployment-header-item) time', 'datetime');
    const time = dayjs(datetime);
    let earlier = dayjs().subtract(5, 'minutes');
    const now = dayjs();
    expect(time.isBetween(earlier, now));
  });

  test('allows group deployments', async ({ environment, loggedInPage: page }) => {
    console.log(`allows group deployments`);
    await page.click(`a:has-text('Deployments')`);
    await page.click(`button:has-text('Create a deployment')`);

    await page.waitForSelector('#deployment-release-selection', { timeout: 5000 });
    await page.focus('#deployment-release-selection');
    await page.type('#deployment-release-selection', 'mender');
    await page.click(`#deployment-release-selection-popup li:has-text('mender-demo-artifact')`);

    await page.waitForSelector('#deployment-device-group-selection', { timeout: 5000 });
    await page.focus('#deployment-device-group-selection');
    await page.type('#deployment-device-group-selection', 'test');
    await page.click(`#deployment-device-group-selection-popup li:has-text('testgroup')`);
    await page.click(`button:has-text('Next')`);
    if (['enterprise', 'staging'].includes(environment)) {
      await page.click(`.MuiDialog-container button >> text=Next`);
      await page.click(`.MuiDialog-container button >> text=Next`);
    }
    // adding the following to ensure we reached the end of the dialog, as this might not happen in CI runs
    try {
      await page.waitForSelector('..MuiDialog-container button >> text=Next', { timeout: 1000 });
      await page.click(`.MuiDialog-container button >> text=Next`);
    } catch (e) {
      console.log(`go ahead and create the deployment`);
    }
    await page.click(`.MuiDialog-container button >> text=Create`);
    await page.waitForSelector('.deployment-item', { timeout: 10000 });
    await page.click(`[role="tab"]:has-text('Finished')`);
    await page.waitForSelector('.deployment-item:not(.deployment-header-item)', { timeout: 60000 });
  });
});
