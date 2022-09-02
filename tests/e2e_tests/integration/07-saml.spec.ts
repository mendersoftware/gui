import axios from 'axios';
import * as fs from 'fs';
import * as https from 'https';

import test, { expect } from '../fixtures/fixtures';

const timeoutFourSeconds = 4000;
const timeoutOneSecond = 1000;
const samlSettings = {
  'credentials': {
    'chromium': {
      'login': 'morty',
      'password': 'panic',
      'email': 'msmith@samltest.id'
    },
    'firefox': {
      'login': 'rick',
      'password': 'psych',
      'email': 'rsanchez@samltest.id'
    },
    'webkit': {
      'login': 'sheldon',
      'password': 'bazinga',
      'email': 'scooper@samltest.id'
    }
  },
  'idp_url': 'https://samltest.id/saml/idp'
};
let metadataId;
let jwt;

test.describe('SAML Login', () => {
  test.use({ storageState: 'storage.json' });
  test.describe('SAML login via sso/id/login', () => {
    test.afterAll(async ({ environment, baseUrl, browserName }, testInfo) => {
      if (environment !== 'staging') {
        return;
      }
      console.log(`Finished ${testInfo.title} with status ${testInfo.status}. Cleaning up.`);
      const response = await axios({
        url: `${baseUrl}api/management/v1/useradm/users?email=${encodeURIComponent(samlSettings.credentials[browserName].email)}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      const responseStatus = await response.status;
      if (responseStatus != 200 || response.data.length < 1) {
        console.log(`${samlSettings.credentials[browserName].email} does not exist.`);
      } else {
        expect(response.status).toBe(200);
        const userId = response.data[0]['id'];
        const responseDelete = await axios({
          url: `${baseUrl}api/management/v1/useradm/users/${userId}`,
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        });
        expect(response.status).toBe(200);
        console.log(`removed user ${samlSettings.credentials[browserName].email}/${userId}.`);
      }
    });

    // Setups the SAML/SSO login with samltest.id Identity Provider
    test('Set up SAML', async ({ environment, context, baseUrl, page }) => {
      test.skip(environment !== 'staging');
      test.setTimeout(320000);
      const storage = await context.storageState();
      jwt = storage['cookies'].find(cookie => cookie.name === 'JWT').value;

      const idpResponse = await axios({
        url: samlSettings.idp_url,
        method: 'GET'
      });
      expect(idpResponse.status).toBe(200);
      const metadata = idpResponse.data;

      console.log(`running with ${baseUrl}`);
      console.log(`IdP metadata len=${metadata.length} loaded and uploading`);

      await page.goto(`${baseUrl}ui/settings/organization-and-billing`);
      await expect(page).toHaveURL(`${baseUrl}ui/settings/organization-and-billing`);
      // Check input[type="checkbox"]
      await page.locator('input[type="checkbox"]').check();
      // Click text=input with the text editor
      await page.locator('text=input with the text editor').click();

      // Click .view-lines
      await page.locator('.view-lines').click();

      console.log('typing metadata');
      await page.locator('[aria-label="Editor content\\;Press Alt\\+F1 for Accessibility Options\\."]').type(metadata.replace(/(?:\r\n|\r|\n)/g, ''));
      console.log('typing metadata done.');
      // The screenshot saves the view of the typed metadata
      await page.screenshot({ 'path': 'saml-edit-saving.png' });
      // Click text=Save >> nth=1
      await page.locator('text=Save').nth(1).click();
      console.log('typing metadata done. waiting for Entity ID to be present on page.');
      await page.waitForSelector('text=Entity ID');
      console.log('waiting over continuing.');

      const response = await axios({
        url: `${baseUrl}api/management/v1/useradm/sso/idp/metadata`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });
      expect(response.status).toBe(200);
      metadataId = response.data[0]['id'];
      console.log(`got metadata id: ${metadataId}`);

      await page.goto(`${baseUrl}ui/settings/organization-and-billing`);
      await page.locator('text=View metadata in the text editor').click();
      // Click text=Download file
      const [download] = await Promise.all([page.waitForEvent('download'), page.locator('text=Download file').click()]);
      const downloadTargetPath = await download.path();
      expect(downloadTargetPath).toBeTruthy();
      const spMetadaData = fs.readFileSync(downloadTargetPath, 'utf8');
      console.log(`downloaded SP metadata length=${spMetadaData.length}`);

      await page.goto(`${baseUrl}ui/settings/organization-and-billing`);

      const expectedLoginUrl = `${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/login`;
      const findResults = await page.locator('span', { 'hasText': expectedLoginUrl });
      await expect(findResults).toHaveText(expectedLoginUrl);
      console.log(`got span with login url: ${await findResults.count()}`);

      const expectedAcsUrl = `${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/acs`;
      const findResultsAcs = await page.locator('span', { 'hasText': expectedAcsUrl });
      await expect(findResultsAcs).toHaveText(expectedAcsUrl);
      console.log(`got span with acs url: ${await findResultsAcs.count()}`);

      const expectedSpMetaUrl = `${baseUrl}api/management/v1/useradm/sso/sp/metadata/${metadataId}`;
      const findResultsSpMeta = await page.locator('span', { 'hasText': expectedSpMetaUrl });
      await expect(findResultsSpMeta).toHaveText(expectedSpMetaUrl);
      console.log(`got span with SP metadata url: ${await findResultsSpMeta.count()}`);

      const serviceProviderMetadata = spMetadaData.replaceAll('Signed="true"', 'Signed="false"');
      fs.writeFileSync('fixtures/service_provider_metadata.xml', serviceProviderMetadata);

      await page.goto('https://samltest.id/upload.php');
      await page.waitForSelector('input[id=uploader]');
      const handle = await page.$('input[id="uploader"]');
      await handle.setInputFiles('fixtures/service_provider_metadata.xml');
      // Click input:has-text("Upload")
      await page.locator('input:has-text("Upload")').click();
      await expect(page).toHaveURL('https://samltest.id/upload.php');

      console.log('uploaded file, making screen shot, after waiting 4s');
      await page.waitForTimeout(timeoutFourSeconds);
      // Let's save the image after the upload
      await page.screenshot({ path: 'saml-uploaded.png' });
    });

    // Creates a user with login that matches Identity privder (samltest.id) user email
    test('Creates a user without a password', async ({ environment, browserName, baseUrl, page }) => {
      test.skip(environment !== 'staging');
      const response = await axios({
        url: `${baseUrl}api/management/v1/useradm/users?email=${encodeURIComponent(samlSettings.credentials[browserName].email)}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });

      const responseStatus = await response.status;
      if (responseStatus != 200 || response.data.length < 1) {
        await page.goto(`${baseUrl}ui/settings/user-management`);
        // Click text=Create new user
        await page.locator('text=Create new user').click();
        // Click [placeholder="Email"]
        await page.locator('[placeholder="Email"]').click();
        // Fill [placeholder="Email"]
        await page.locator('[placeholder="Email"]').fill(samlSettings.credentials[browserName].email);
        // Click text=Create user
        await page.locator('text=Create user').click();
        await page.waitForTimeout(timeoutOneSecond);
        await expect(page.locator(`text=${samlSettings.credentials[browserName].email}`)).toHaveText(samlSettings.credentials[browserName].email);
        console.log(`${samlSettings.credentials[browserName].email} created.`);
      } else {
        console.log(`${samlSettings.credentials[browserName].email} already exists.`);
      }
    });

    // This test calls auth/sso/${id}/login, where id is the id of the identity provider
    // and verifies that login is successful.
    test('User can login via sso/login endpoint', async ({ environment, browserName, baseUrl, browser }) => {
      test.skip(environment !== 'staging');
      console.log(`logging in via ${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/login (credentials set:${browserName})`);
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${baseUrl}api/management/v1/useradm/auth/sso/${metadataId}/login`);
      await page.waitForTimeout(timeoutFourSeconds);
      // This screenshot saves the view right after the first redirection
      await page.screenshot({ path: 'saml-redirected.png' });

      // Click input[name="j_username"]
      await page.locator('input[name="j_username"]').click();

      // Fill input[name="j_username"]
      await page.locator('input[name="j_username"]').fill(samlSettings.credentials[browserName].login);

      // Click input[name="j_password"]
      await page.locator('input[name="j_password"]').click();

      // Fill input[name="j_password"]
      await page.locator('input[name="j_password"]').fill(samlSettings.credentials[browserName].password);

      // Click button:has-text("Login")
      await page.locator('button:has-text("Login")').click();
      await page.waitForSelector('text=Accept');
      // This screen shot saves the summary of the data that will be sent in assertion
      await page.screenshot({ path: 'saml-logging-in.png' });

      // Click text=Accept
      await page.locator('text=Accept').click();
      // confirm we have logged in successfully
      await page.screenshot({ path: 'saml-logging-in-accept.png' });
      await page.waitForSelector('text=License information');
      await page.waitForSelector(`text=${samlSettings.credentials[browserName].email}`);
    });
  });
});
