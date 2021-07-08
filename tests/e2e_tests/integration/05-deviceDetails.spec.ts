import { expect } from '@playwright/test';
import * as path from 'path';

import test from '../fixtures/fixtures';
import { compareImages } from '../utils/commands';

test.describe('Device details', () => {
  test.use({ storageState: 'storage.json' });

  test('has basic inventory', async ({ demoDeviceName, loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem`);
    await page.click(`text=/show 1\\d+ more/i`);
    expect(await page.isVisible(`css=.expandedDevice >> text=Linux`)).toBeTruthy();
    expect(await page.isVisible(`css=.expandedDevice >> text=mac`)).toBeTruthy();
    expect(await page.isVisible(`css=.expandedDevice >> text=qemux86-64`)).toBeTruthy();
    expect(await page.isVisible(`css=.expandedDevice >> text=${demoDeviceName}`)).toBeTruthy();
  });

  test('can open a terminal', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem`);
    // the deviceconnect connection might not be established right away
    await page.waitForSelector('text=/Remote Terminal session/i', { timeout: 10000 });
    await page.click(`css=.expandedDevice >> text=Remote Terminal session`);
    await page.waitForSelector(`text=Connection with the device established`, { timeout: 10000 });
    expect(await page.isVisible('.terminal.xterm canvas')).toBeTruthy();

    const terminalElement = '.terminal.xterm';
    // the terminal content might take a bit to get painted - thus the waiting
    await page.click(terminalElement, { timeout: 3000 });

    // the terminal content differs a bit depending on the device id, thus the higher threshold allowed
    // NB! without the screenshot-name argument the options don't seem to be applied
    // NB! screenshots should only be taken by running the docker composition (as in CI) - never in open mode,
    // as the resizing option on `allowSizeMismatch` only pads the screenshot with transparent pixels until
    // the larger size is met (when diffing screenshots of multiple sizes) and does not scale to fit!
    let elementHandle = await page.$('.terminal.xterm .xterm-text-layer');
    const screenShotPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalContent-actual.png');
    await elementHandle.screenshot({ path: screenShotPath });

    const expectedPath = path.join(__dirname, '..', 'fixtures', 'terminalContent.png');
    const { pass } = compareImages(expectedPath, screenShotPath);
    expect(pass).toBeTruthy();

    await page.type('.terminal.xterm textarea', 'top');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    await elementHandle.screenshot({ path: screenShotPath });
    const { pass: pass2 } = compareImages(expectedPath, screenShotPath);
    expect(pass2).not.toBeTruthy();
  });
});
