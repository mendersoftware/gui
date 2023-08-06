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
    await page.waitForSelector(`text=Download Artifact`, { timeout: timeouts.default });
    expect(await page.isVisible(`text=Download Artifact`)).toBeTruthy();
    // unfortunately the firefox integration gets flaky with the download attribute set + the chrome + webkit integrations time out
    // waiting for the download event almost every time => work around by getting the file
    const locator = await page.locator('text=Download Artifact');
    const downloadUrl = await locator.getAttribute('href');
    const download = await axios.get(downloadUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }), responseType: 'arraybuffer' });
    const newFile = download.data;
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
