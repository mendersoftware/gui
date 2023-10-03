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
import axios from 'axios';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import * as fs from 'fs';
import https from 'https';
import md5 from 'md5';

import test, { expect } from '../fixtures/fixtures';
import { selectors, timeouts } from '../utils/constants';

dayjs.extend(isBetween);

test.describe('Files', () => {
  const fileName = 'mender-demo-artifact.mender';
  test.use({ storageState: 'storage.json' });

  test('allows file uploads', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    // create an artifact to download first
    await page.click(`button:has-text('Upload')`);
    await page.locator('.MuiDialog-paper .dropzone input').setInputFiles(`fixtures/${fileName}`);
    await page.click(`.MuiDialog-paper button:has-text('Upload')`);
    // give some extra time for the upload
    await page.waitForTimeout(timeouts.fiveSeconds);
  });

  test('allows release notes manipulation', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    await page.getByText(/demo-artifact/i).click();
    expect(await page.getByRole('heading', { name: /Release notes/i }).isVisible()).toBeTruthy();
    // layout based locators are not an option here, since the edit button is also visible on the nearby tags section
    // and the selector would get confused due to the proximity - so instead we loop over all the divs
    await page
      .locator('div')
      .filter({ hasText: /^Add release notes here Edit$/i })
      .getByRole('button')
      .click();
    const input = await page.getByPlaceholder(/release notes/i);
    await input.fill('foo notes');
    await page.getByTestId('CheckIcon').click();
    expect(input).not.toBeVisible();
    expect(await page.getByText('foo notes').isVisible()).toBeTruthy();
  });

  test('allows release tags manipulation', async ({ baseUrl, loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    const alreadyTagged = await page.getByText('some, tags').isVisible();
    test.skip(alreadyTagged, 'looks like the release was tagged already');
    await page.getByText(/demo-artifact/i).click();
    expect(await page.getByRole('heading', { name: /Release notes/i }).isVisible()).toBeTruthy();
    expect(await page.getByRole('button', { name: 'some' }).isVisible()).not.toBeTruthy();
    // layout based locators are not an option here, since the edit button is also visible on the nearby release notes section
    // and the selector would get confused due to the proximity - so instead we loop over all the divs
    const theDiv = await page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: /tags/i }), hasNotText: /notes/i })
      .filter({ has: page.getByRole('button', { name: /edit/i }) });
    const editButton = await theDiv.getByRole('button', { name: /edit/i });
    await editButton.click();
    const input = await page.getByPlaceholder(/enter release tags/i);
    await input.fill('some,tags');
    await page.getByTestId('CheckIcon').click();
    expect(input).not.toBeVisible();
    await page.goto(`${baseUrl}ui/releases`);
    expect(await page.getByText('some, tags').isVisible()).toBeTruthy();
  });

  test('allows release tags reset', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    await page.getByText(/demo-artifact/i).click();
    const theDiv = await page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: /tags/i }), hasNotText: /notes/ })
      .filter({ has: page.getByRole('button', { name: /edit/i }) });
    const editButton = await theDiv.getByRole('button', { name: /edit/i });
    await editButton.click();
    const alreadyTagged = await page.getByRole('button', { name: 'some' }).isVisible();
    if (alreadyTagged) {
      await page.getByRole('button', { name: 'some' }).getByTestId('CancelIcon').click();
      await page.getByRole('button', { name: 'tags' }).getByTestId('CancelIcon').click();
      await page.getByTestId('CheckIcon').click();
      expect(await page.getByText('add release tags').isVisible()).toBeTruthy();
      await editButton.click();
    }
    await page.getByPlaceholder(/enter release tags/i).fill('someTag');
    await page.getByTestId('CheckIcon').click();
    await page.press('body', 'Escape');
    expect(await page.getByText('someTag').isVisible()).toBeTruthy();
  });

  test('allows release tags filtering', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    expect(await page.getByText('someTag').isVisible()).toBeTruthy();
    await page.getByPlaceholder(/select tags/i).fill('foo,');
    expect(await page.getByText('someTag').isVisible()).not.toBeTruthy();
    await page.getByText(/Clear filter/i).click();
    expect(await page.getByText('someTag').isVisible()).toBeTruthy();
  });

  // test('allows uploading custom file creations', () => {
  //   cy.exec('mender-artifact write rootfs-image -f core-image-full-cmdline-qemux86-64.ext4 -t qemux86-64 -n release1 -o qemux86-64_release_1.mender')
  //     .then(result => {
  //       expect(result.code).to.be.equal(0)
  //         const encoding = 'base64'
  //         const fileName = 'qemux86-64_release_1.mender'
  //         cy.readFile(fileName, encoding).then(fileContent => {
  //           cy.get('.dropzone input')
  //             .upload({ fileContent, fileName, encoding, mimeType: 'application/octet-stream' })
  //             .wait(10000) // give some extra time for the upload
  //         })
  //       })
  // })

  test('allows artifact downloads', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    await page.click(`text=/mender-demo-artifact/i`);
    await page.click('.expandButton');
    const downloadButton = await page.getByText(/download artifact/i);
    expect(await downloadButton.isVisible()).toBeTruthy();
    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
    let downloadTargetPath = await download.path();
    const downloadError = await download.failure();
    if (downloadError) {
      const downloadUrl = download.url();
      const response = await axios.get(downloadUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }), responseType: 'arraybuffer' });
      const fileData = Buffer.from(response.data, 'binary');
      downloadTargetPath = `./${download.suggestedFilename()}`;
      fs.writeFileSync(downloadTargetPath, fileData);
    }
    const newFile = await fs.readFileSync(downloadTargetPath);
    const testFile = await fs.readFileSync(`fixtures/${fileName}`);
    expect(md5(newFile)).toEqual(md5(testFile));
  });

  test('allows file transfer', async ({ browserName, environment, loggedInPage: page }) => {
    // TODO adjust test to better work with webkit, for now it should be good enough to assume file transfers work there too if the remote terminal works
    test.skip(!['enterprise', 'staging'].includes(environment) || ['webkit'].includes(browserName));
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    await page.click(`text=/troubleshooting/i`);
    // the deviceconnect connection might not be established right away
    await page.waitForSelector('text=/file transfer/i', { timeout: timeouts.tenSeconds });
    await page.click(`css=.expandedDevice >> text=file transfer`);
    await page.waitForSelector(`text=Connection with the device established`, { timeout: timeouts.tenSeconds });
    await page.locator('.dropzone input').setInputFiles(`fixtures/${fileName}`);
    await page.click(selectors.placeholderExample, { clickCount: 3 });
    await page.type(selectors.placeholderExample, `/tmp/${fileName}`);
    await page.click(`button:text("Upload"):below(:text("Destination directory"))`);
    await page.click('css=button >> text=Download');
    await page.type(selectors.placeholderExample, `/tmp/${fileName}`);
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('button:text("Download"):below(:text("file on the device"))')]);
    const downloadTargetPath = await download.path();
    const newFile = await fs.readFileSync(downloadTargetPath);
    const testFile = await fs.readFileSync(`fixtures/${fileName}`);
    expect(md5(newFile)).toEqual(md5(testFile));
  });
});
