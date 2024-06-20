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
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

import test, { expect } from '../fixtures/fixtures';
import { baseUrlToDomain, generateOtp, isLoggedIn, login, prepareCookies, processLoginForm, startClient, tenantTokenRetrieval } from '../utils/commands';
import { selectors, storagePath, timeouts } from '../utils/constants';

test.describe('Settings', () => {
  test.describe('access token feature', () => {
    test.use({ storageState: storagePath });
    test('allows access to access tokens', async ({ baseUrl, loggedInPage: page }) => {
      await page.goto(`${baseUrl}ui/settings`);
      await page.waitForSelector('css=button >> text=/Generate a token/i');
    });
    test('allows generating & revoking tokens', async ({ baseUrl, browserName, loggedInPage: page }) => {
      await page.goto(`${baseUrl}ui/settings`);
      await page.waitForSelector('css=button >> text=/Generate a token/i');
      const isRetry = await page.isVisible(`text=/revoke/i`);
      if (isRetry) {
        await page.click('text=/revoke/i');
        await page.waitForSelector('text=/revoke token/i');
        await page.click('button:has-text("Revoke token")');
      }
      await page.click('text=/generate a token/i');
      await page.waitForSelector('text=/Create new token/i');
      await page.fill('[placeholder=Name]', 'aNewToken');
      await page.click('div[role="combobox"]:has-text("a year")');
      await page.click('li[role="option"]:has-text("7 days")');
      await page.click('text=/Create token/i');
      await page.click('text=/Close/i');
      await page.waitForSelector('text=/in 7 days/i');
      await page.click('button:has-text("Revoke")');
      await page.waitForSelector('text=/revoke token/i');
      await page.click('button:has-text("Revoke token")');
      await page.click('text=/generate a token/i');
      await page.fill('[placeholder=Name]', 'aNewToken');
      await page.click('text=/Create token/i');
      await page.click('.code .MuiSvgIcon-root');
      await page.waitForSelector('text=/copied to clipboard/i');
      let token = '';
      if (browserName === 'chromium') {
        token = await page.evaluate(() => navigator.clipboard.readText());
      } else {
        token = await page.innerText('.code');
      }
      expect(token).toBeTruthy();
      await page.click('text=/Close/i');
      await page.waitForSelector('text=/in a year/i');
    });
  });
  test.describe('account upgrades', () => {
    test.use({ storageState: storagePath });
    test('allows upgrading to Professional', async ({ environment, loggedInPage: page }) => {
      test.skip(environment !== 'staging');
      await page.waitForTimeout(timeouts.default);
      const wasUpgraded = await page.isVisible(`css=#limit >> text=250`);
      if (wasUpgraded) {
        test.skip('looks like the account was upgraded already, continue with the remaining tests');
      }
      await page.click(`text=Upgrade now`);
      await page.click(`css=.planPanel >> text=Professional`);
      await page.waitForSelector('.StripeElement iframe');
      const frameHandle = await page.$('.StripeElement iframe');
      const stripeFrame = await frameHandle.contentFrame();
      await stripeFrame.fill('[name="cardnumber"]', '4242424242424242');
      await stripeFrame.fill('[name="exp-date"]', '1232');
      await stripeFrame.fill('[name="cvc"]', '123');
      await stripeFrame.fill('[name="postal"]', '12345');
      await page.click(`button:has-text('Sign up')`);
      await page.waitForSelector('text=/Card confirmed./i', { timeout: timeouts.tenSeconds });
      await page.waitForSelector('text=/Your upgrade was successful/i', { timeout: timeouts.fifteenSeconds });
      await page.waitForSelector('text=/Organization name/i', { timeout: timeouts.tenSeconds });
    });
    test('allows higher device limits once upgraded', async ({ baseUrl, environment, loggedInPage: page }) => {
      test.skip(environment !== 'staging');
      await page.waitForSelector(`css=#limit >> text=250`, { timeout: timeouts.default });
      expect(await page.isVisible(`css=#limit >> text=250`)).toBeTruthy();
      const token = await tenantTokenRetrieval(baseUrl, page);
      await startClient(baseUrl, token, 50);
      await page.goto(`${baseUrl}ui/devices`);
      await page.waitForSelector('.header-section [href="/ui/devices/pending"]', { timeout: 120000 });
      expect(await page.isVisible(`:is(.header-section [href="/ui/devices/pending"]:has-text('pending'))`)).toBeTruthy();
      const pendingNotification = await page.$eval('.header-section [href="/ui/devices/pending"]', el => el.textContent);
      expect(Number(pendingNotification.split(' ')[0])).toBeGreaterThan(10);
    });
  });

  test.describe('2FA setup', () => {
    test('supports regular 2fa setup', async ({ baseUrl, environment, loggedInPage: page }) => {
      test.skip(environment !== 'staging');
      let tfaSecret;
      try {
        tfaSecret = fs.readFileSync('secret.txt', 'utf8');
      } catch (error) {
        // moving on
      }
      if (tfaSecret) {
        test.skip('looks like the account is already 2fa enabled, continue with the remaining tests');
      }
      await page.goto(`${baseUrl}ui/settings/my-account`);
      await page.click('text=/Enable Two Factor/');
      await page.waitForSelector('.margin-top img');
      const qrCode = await page.$eval('.margin-top img', (el: HTMLImageElement) => el.src);
      const png = PNG.sync.read(Buffer.from(qrCode.slice('data:image/png;base64,'.length), 'base64'));
      const decodedQr = jsQR(png.data, png.width, png.height);
      const qrData = new URLSearchParams(decodedQr.data);
      console.log(qrData.get('secret'));
      const qrToken = await generateOtp(qrData.get('secret'));
      console.log('Generated otp:', qrToken);
      await page.fill('#token2fa', qrToken);
      await page.click(`css=button >> text=Verify`);
      await page.waitForSelector(`css=ol >> text=Verified`);
      await page.getByRole('button', { name: /save/i }).click();
    });
    test(`prevents from logging in without 2fa code`, async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible(`button:text('Log in')`)).toBeTruthy();
      // enter valid username and password
      await processLoginForm({ username, password, page, environment });
      await page.waitForTimeout(timeouts.default);
      await page.fill('#token2fa', '123456');
      await page.getByRole('button', { name: /log in/i }).click();
      // still on /login page plus an error is displayed
      expect(await page.isVisible(`button:text('Log in')`)).toBeTruthy();
      await page.waitForSelector('text=/There was a problem logging in/', { timeout: timeouts.default });
    });
    test('allows turning 2fa off again', async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username, password, page, environment });
      const newToken = await generateOtp();
      await page.fill('#token2fa', newToken);
      await page.getByRole('button', { name: /log in/i }).click();
      await isLoggedIn(page);
      await page.goto(`${baseUrl}ui/settings/my-account`);
      await page.click('text=/Enable Two Factor/');
      await page.waitForTimeout(timeouts.default);
    });
    test('allows logging in without 2fa after deactivation', async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username, password, page, environment });
      await isLoggedIn(page);
      await page.goto(`${baseUrl}ui/settings`);
    });
  });

  test.describe('Basic setting features', () => {
    const replacementPassword = 'mysecretpassword!456';

    test('allows access to user management', async ({ baseUrl, loggedInPage: page }) => {
      await page.goto(`${baseUrl}ui/settings/user-management`);
      await page.waitForSelector('text=/new user/i');
    });
    test('allows email changes', async ({ baseUrl, loggedInPage: page }) => {
      await page.goto(`${baseUrl}ui/settings/my-account`);
      await page.getByRole('button', { name: /change email/i }).click();
      expect(await page.getByLabel(/current password/i).isVisible()).toBeTruthy();
    });
    test('allows changing the password', async ({ baseUrl, environment, browserName, context, username, password }) => {
      if (browserName === 'webkit') {
        test.skip();
      }
      const domain = baseUrlToDomain(baseUrl);
      context = await prepareCookies(context, domain, '');
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username, password, page, environment });
      await page.getByRole('button', { name: username }).click();
      await page.getByText(/my profile/i).click();
      await page.getByRole('button', { name: /change password/i }).click();

      expect(await page.$eval(selectors.password, (el: HTMLInputElement) => el.value)).toBeFalsy();
      await page.getByRole('button', { exact: true, name: 'Generate' }).click();
      await page.click(selectors.passwordCurrent, { clickCount: 3 });
      await page.fill(selectors.passwordCurrent, password);
      const typedCurrentPassword = await page.$eval(selectors.passwordCurrent, (el: HTMLInputElement) => el.value);
      expect(typedCurrentPassword === password);
      expect(await page.$eval(selectors.password, (el: HTMLInputElement) => el.value)).toBeTruthy();
      await page.click(selectors.password, { clickCount: 3 });
      await page.fill(selectors.password, replacementPassword);
      const typedPassword = await page.$eval(selectors.password, (el: HTMLInputElement) => el.value);
      expect(typedPassword === replacementPassword);
      await page.fill(selectors.passwordConfirmation, replacementPassword);
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForSelector('text=/user has been updated/i', { timeout: timeouts.tenSeconds });
      await page.getByRole('button', { name: username }).click();
      await page.getByText(/log out/i).click();
      await page.getByRole('button', { name: /log in/i }).waitFor({ timeout: 3 * timeouts.oneSecond });
      expect(page.getByRole('button', { name: /log in/i }).isVisible()).toBeTruthy();
    });

    test('allows changing the password back', async ({ baseUrl, environment, browserName, context, password, username }) => {
      if (browserName === 'webkit') {
        test.skip();
      }
      const domain = baseUrlToDomain(baseUrl);
      context = await prepareCookies(context, domain, '');
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username, password: replacementPassword, page, environment });
      await page.getByRole('button', { name: username }).click();
      await page.getByText(/my profile/i).click();
      await page.getByRole('button', { name: /change password/i }).click();
      await page.fill(selectors.password, password);
      const typedPassword = await page.$eval(selectors.password, (el: HTMLInputElement) => el.value);
      if (typedPassword !== password) {
        await page.click(selectors.password, { clickCount: 3 });
        await page.fill(selectors.password, password);
      }
      await page.click(selectors.passwordConfirmation);
      await page.fill(selectors.passwordConfirmation, password);
      await page.click(selectors.passwordCurrent);
      await page.fill(selectors.passwordCurrent, replacementPassword);
      await page.getByRole('button', { name: /save/i }).click();
      await page.waitForSelector('text=/user has been updated/i', { timeout: timeouts.tenSeconds });
      await page.waitForTimeout(timeouts.default);

      const { token: newToken } = await login(username, password, baseUrl);
      expect(newToken).toBeTruthy();
    });
  });

  test.describe('Multi tenant access', () => {
    const secondaryUser = 'demo-secondary@example.com';
    test('allows adding users to tenants', async ({ baseUrl, browser, browserName, environment, loggedInPage, password }) => {
      test.skip('enterprise' !== environment || browserName !== 'chromium');
      await loggedInPage.goto(`${baseUrl}ui/settings`);
      await loggedInPage.click('text=/user management/i');
      const hasUserAlready = await loggedInPage.getByText(secondaryUser).isVisible();
      test.skip(hasUserAlready, `${secondaryUser} was added in a previous run, but success notification wasn't caught`);

      const domain = baseUrlToDomain(baseUrl);
      let newContext = await browser.newContext();
      await newContext.grantPermissions(['clipboard-read'], { origin: baseUrl });
      newContext = await prepareCookies(newContext, domain, '');
      const page = await newContext.newPage();
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username: secondaryUser, password, page, environment });
      await page.goto(`${baseUrl}ui/settings/my-account`);
      await page
        .getByText(/User ID/i)
        .locator('..')
        .locator('..')
        .getByRole('button', { name: /copy to clipboard/i })
        .click({ force: true });
      const content = await page.evaluateHandle(() => navigator.clipboard.readText());
      const uuid = await content.jsonValue();
      await page.getByText(/help/i).click();
      await page.getByRole('button', { name: secondaryUser }).click();
      expect(await page.getByText(/switch organization/i)).not.toBeVisible();

      await loggedInPage.getByRole('button', { name: /new user/i }).click();
      const passwordInput = await loggedInPage.getByPlaceholder(/password/i);
      const emailUuidInput = await loggedInPage.getByPlaceholder(/email/i);
      await emailUuidInput.click();
      await emailUuidInput.fill(uuid);
      expect(passwordInput).not.toBeVisible();
      await loggedInPage.getByRole('button', { name: /add user/i }).click();
      await page.waitForTimeout(timeouts.oneSecond);

      await page.reload();
      await page.getByRole('button', { name: secondaryUser }).click();
      expect(await page.getByText(/switch organization/i)).toBeVisible();
    });
    test('allows switching tenants', async ({ baseUrl, browser, browserName, environment, loggedInPage, password }) => {
      test.skip('enterprise' !== environment || browserName !== 'chromium');
      const domain = baseUrlToDomain(baseUrl);
      let newContext = await browser.newContext();
      newContext = await prepareCookies(newContext, domain, '');
      const page = await newContext.newPage();
      await page.goto(`${baseUrl}ui/`);
      await processLoginForm({ username: secondaryUser, password, page, environment });
      await page.getByRole('button', { name: secondaryUser }).click();
      expect(await page.getByRole('menuitem', { name: /secondary/i })).toBeVisible();
      await page.getByText(/switch organization/i).click({ force: true });
      await page.getByRole('menuitem', { name: /test/i }).click();
      await page.getByRole('button', { name: secondaryUser }).click();
      expect(await page.getByRole('menuitem', { name: /secondary/i })).not.toBeVisible();
      expect(await page.getByRole('menuitem', { name: /test/i })).toBeVisible();

      await loggedInPage.goto(`${baseUrl}ui/settings`);
      await loggedInPage.click('text=/user management/i');
      await loggedInPage.getByText(secondaryUser).click();
      await loggedInPage.getByRole('button', { name: /delete user/i }).click();
      expect(loggedInPage.getByText(/delete user\?/i)).toBeVisible();
      await loggedInPage
        .getByRole('button', { name: /delete user/i })
        .last()
        .click();

      await page.reload();
      expect(page.getByText(/log in/i)).toBeVisible();
      await processLoginForm({ username: secondaryUser, password, page, environment });
      await page.getByRole('button', { name: secondaryUser }).click();
      expect(await page.getByText(/switch organization/i)).not.toBeVisible();
    });
  });
});
