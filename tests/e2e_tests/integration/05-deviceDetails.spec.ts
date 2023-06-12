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
import * as path from 'path';

import test, { expect } from '../fixtures/fixtures';
import { compareImages } from '../utils/commands';
import { selectors, timeouts } from '../utils/constants';

const terminalReferenceFileMap = {
  default: 'terminalContent.png',
  webkit: 'terminalContent-webkit.png'
};

test.describe('Device details', () => {
  test.use({ storageState: 'storage.json' });

  test('has basic inventory', async ({ demoDeviceName, loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    await page.click(`text=/inventory/i`);
    expect(await page.isVisible(`css=.expandedDevice >> text=Linux`)).toBeTruthy();
    expect(await page.isVisible(`css=.expandedDevice >> text=mac`)).toBeTruthy();
    expect(await page.isVisible(`css=.expandedDevice >> text=${demoDeviceName}`)).toBeTruthy();
  });

  test('can open a terminal', async ({ browserName, loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    await page.click(`text=/troubleshooting/i`);
    // the deviceconnect connection might not be established right away
    const terminalLaunchButton = await page.waitForSelector('text=/Remote Terminal session/i', { timeout: timeouts.tenSeconds });
    await terminalLaunchButton.scrollIntoViewIfNeeded();
    await page.click(`css=.expandedDevice >> text=Remote Terminal session`);
    await page.waitForSelector(`text=Connection with the device established`, { timeout: timeouts.tenSeconds });
    expect(await page.isVisible('.terminal.xterm canvas')).toBeTruthy();

    // the terminal content might take a bit to get painted - thus the waiting
    await page.click(selectors.terminalElement, { timeout: timeouts.default });

    // the terminal content differs a bit depending on the device id, thus the higher threshold allowed
    // NB! without the screenshot-name argument the options don't seem to be applied
    // NB! screenshots should only be taken by running the docker composition (as in CI) - never in open mode,
    // as the resizing option on `allowSizeMismatch` only pads the screenshot with transparent pixels until
    // the larger size is met (when diffing screenshots of multiple sizes) and does not scale to fit!
    const elementHandle = await page.$(selectors.terminalElement);
    expect(elementHandle).toBeTruthy();
    if (['chromium', 'webkit'].includes(browserName)) {
      const screenShotPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalContent-actual.png');
      await elementHandle.screenshot({ path: screenShotPath });

      const expectedPath = path.join(__dirname, '..', 'fixtures', terminalReferenceFileMap[browserName] ?? terminalReferenceFileMap.default);
      const { pass } = compareImages(expectedPath, screenShotPath);
      expect(pass).toBeTruthy();

      await page.type(selectors.terminalText, 'top');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(timeouts.default);

      await elementHandle.screenshot({ path: screenShotPath });
      const { pass: pass2 } = compareImages(expectedPath, screenShotPath);
      expect(pass2).not.toBeTruthy();
    }
  });
});
