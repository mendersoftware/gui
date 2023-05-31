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
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import test, { expect } from '../fixtures/fixtures';
import { compareImages } from '../utils/commands';
import { selectors } from '../utils/constants';

test.describe('Auditlogs', () => {
  test.use({ storageState: 'storage.json' });

  const secret = 'super secret something text';
  test('will track remote terminal sessions', async ({ environment, loggedInPage: page }) => {
    test.skip(!['enterprise', 'staging'].includes(environment));
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    await page.click(`text=/troubleshooting/i`);
    // the deviceconnect connection might not be established right away
    const terminalLaunchButton = await page.waitForSelector('text=/Remote Terminal session/i', { timeout: 10000 });
    await terminalLaunchButton.scrollIntoViewIfNeeded();
    await page.click(`css=.expandedDevice >> text=Remote Terminal session`);
    await page.waitForSelector(`text=Connection with the device established`, { timeout: 10000 });
    expect(await page.isVisible('.terminal.xterm canvas')).toBeTruthy();

    // the terminal content might take a bit to get painted - thus the waiting
    await page.click(selectors.terminalElement, { timeout: 3000 });

    await page.type(selectors.terminalText, 'passwd');
    await page.keyboard.press('Enter');
    const expectedPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalSecretContent.png');
    const elementHandle = await page.$(selectors.terminalElement);
    await elementHandle.screenshot({ path: expectedPath });
    await page.type(selectors.terminalText, secret);

    const screenShotPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalSecretContent-actual.png');
    await elementHandle.screenshot({ path: screenShotPath });
    const { pass } = compareImages(expectedPath, screenShotPath);
    expect(pass).toBeTruthy();
    await page.click(`button:has-text('Close')`);
    await page.click('[aria-label="close"]'); // short-form
    await page.click(`.leftNav.navLink:has-text('Audit log')`);

    await page.click(`.auditlogs-list-item :text('CLOSE_TERMINAL')`);
    await page.click(`button:has-text('Play')`);
    expect(await page.isVisible(`.MuiDrawer-paper a:has-text('Download'), .MuiDrawer-paper button:has-text('Download')`)).toBeTruthy();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(`.MuiDrawer-paper a:has-text('Download'), .MuiDrawer-paper button:has-text('Download')`)
    ]);
    const downloadTargetPath = await download.path();
    expect(downloadTargetPath).toBeTruthy();

    const checkDownloadedReplayForSecret = async (path, secret) => {
      const fileStream = fs.createReadStream(path);
      const lines = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });
      for await (const line of lines) {
        const search = `const transfer = '[{"content":`;
        if (line.includes(search)) {
          const encodedText = line.substring(line.indexOf(search) + search.length, line.lastIndexOf(`}]';`));
          const content = JSON.parse(Buffer.from(encodedText, 'base64').toString());
          const decodedContent = String.fromCharCode(...content.data);
          expect(decodedContent).not.toContain(secret);
          fileStream.close();
          return;
        }
      }
    };
    await checkDownloadedReplayForSecret(downloadTargetPath, 'secret something');
  });
});
