import * as fs from 'fs';
import axios from 'axios';
import https from 'https';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween.js';
import md5 from 'md5';
import test, { expect } from '../fixtures/fixtures';
import { selectors } from '../utils/constants';

dayjs.extend(isBetween);

test.describe('Files', () => {
  const fileName = 'mender-demo-artifact.mender';
  test.use({ storageState: 'storage.json' });

  test('allows file uploads', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    // create an artifact to download first
    await page.click(`button:has-text('Upload')`);
    await page.setInputFiles('.MuiDialog-paper .dropzone input', `fixtures/${fileName}`);
    await page.click(`.MuiDialog-paper button:has-text('Upload')`);
    // give some extra time for the upload
    await page.waitForTimeout(5000);
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

  test('allows artifact downloads', async ({ browserName, loggedInPage: page }) => {
    await page.click(`.leftNav :text('Releases')`);
    await page.click('.expandButton');
    await page.waitForSelector(`text=Download Artifact`, { timeout: 2000 });
    expect(await page.isVisible(`text=Download Artifact`)).toBeTruthy();
    let newFile;
    // the option for webkit is the proper way, but unfortunately the firefox integration gets flaky with the download
    // + the chrome integration times out waiting for the download event almost every time => work around by getting the file
    if (browserName === 'webkit') {
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator(`text=Download Artifact`).click()]);
      const path = await download.path();
      newFile = await fs.readFileSync(path);
    } else {
      const locator = await page.locator('text=Download Artifact');
      const downloadUrl = await locator.getAttribute('href');
      const download = await axios.get(downloadUrl, { httpsAgent: new https.Agent({ rejectUnauthorized: false }), responseType: 'arraybuffer' });
      newFile = download.data;
    }
    const testFile = await fs.readFileSync(`fixtures/${fileName}`);
    expect(md5(newFile)).toEqual(md5(testFile));
  });

  test('allows file transfer', async ({ browserName, environment, loggedInPage: page }) => {
    // TODO adjust test to better work with webkit, for now it should be good enough to assume file transfers work there too if the remote terminal works
    test.skip(!['enterprise', 'staging'].includes(environment) || ['webkit'].includes(browserName));
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`.deviceListItem div:last-child`);
    // the deviceconnect connection might not be established right away
    await page.waitForSelector('text=/file transfer/i', { timeout: 10000 });
    await page.click(`css=.expandedDevice >> text=file transfer`);
    await page.waitForSelector(`text=Connection with the device established`, { timeout: 10000 });
    await page.setInputFiles('.MuiDialog-paper .dropzone input', `fixtures/${fileName}`);
    await page.click(selectors.placeholderExample, { clickCount: 3 });
    await page.type(selectors.placeholderExample, `/tmp/${fileName}`);
    await page.click('css=button >> text=Upload');
    await page.click('css=.navLink >> text=Download');
    await page.type(selectors.placeholderExample, `/tmp/${fileName}`);
    expect(await page.isVisible(`css=button >> text=Download`)).toBeTruthy();
    const [download] = await Promise.all([page.waitForEvent('download'), page.click(`css=button >> text=Download`)]);
    const downloadTargetPath = await download.path();
    const newFile = await fs.readFileSync(downloadTargetPath);
    const testFile = await fs.readFileSync(`fixtures/${fileName}`);
    expect(md5(newFile)).toEqual(md5(testFile));
  });
});
