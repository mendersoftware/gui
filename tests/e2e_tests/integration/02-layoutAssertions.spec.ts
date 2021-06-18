import { expect } from '@playwright/test';
import test from '../fixtures/fixtures';

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
    await page.click(`.leftNav :text('Devices')`);
    let hasAcceptedDevice = false;
    try {
      hasAcceptedDevice = Boolean(await page.waitForSelector('.deviceListItem', { timeout: 10000 }));
    } catch (e) {
      console.log(`no accepted device present so far`);
    }
    if (!hasAcceptedDevice) {
      await page.waitForSelector(`text=pending authorization`, { timeout: 60000 });
      await page.click(`text=pending authorization`);
      await page.click('.deviceListItem input');
      await page.click('.MuiSpeedDial-fab');
      await page.hover('#device-actions-actions');
      await page.click('[aria-label="accept"]');
    }
    await page.click(`.MuiSelect-root:left-of(:text("Filters"))`);
    await page.click(`css=.MuiPaper-root >> text=/Accepted/i`);
    await page.waitForSelector(`css=.deviceListItem >> text=/release/`, { timeout: 60000 });
    const element = await page.textContent('.deviceListItem');
    expect(element.includes('release')).toBeTruthy();
    await page.click('.deviceListItem');
    expect(await page.isVisible('text=Authentication status')).toBeTruthy();
  });

  test('can group a device', async ({ loggedInPage: page }) => {
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
