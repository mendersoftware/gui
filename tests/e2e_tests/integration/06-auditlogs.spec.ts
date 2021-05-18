import { BrowserContext, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { compareImages, login, setupPage } from '../utils/commands';
import { contextOptions, testParams } from '../config';

const { baseUrl, environment, password, username } = testParams;

test.describe('Auditlogs', () => {
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

  test.describe('remote terminal logging', () => {
    const secret = 'super secret something text';
    test('will track remote terminal sessions - pt1', async () => {
      test.skip(!['enterprise', 'staging'].includes(environment));
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

      let elementHandle = await page.$('.terminal.xterm .xterm-text-layer');
      await page.type('.terminal.xterm textarea', 'passwd');
      await page.keyboard.press('Enter');
      const expectedPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalSecretContent.png');
      await elementHandle.screenshot({ path: expectedPath });
      await page.type('.terminal.xterm textarea', secret);

      const screenShotPath = path.join(__dirname, '..', 'test-results', 'diffs', 'terminalSecretContent-actual.png');
      await elementHandle.screenshot({ path: screenShotPath });
      const { pass } = compareImages(expectedPath, screenShotPath);
      expect(pass).toBeTruthy();
      await page.click(`button :text('Close')`);
      await page.click('[aria-label="close"]'); // short-form
      await page.click(`.leftNav.navLink:has-text('Audit log')`);

      await page.click(`.auditlogs-list-item :text('CLOSE_TERMINAL')`);
      await page.click(`button :text('Play')`);
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
});
