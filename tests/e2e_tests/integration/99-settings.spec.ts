import * as fs from 'fs';
import { Decoder } from '@nuintun/qrcode';
import { expect } from '@playwright/test';
import { PNG } from 'pngjs';

import test from '../fixtures/fixtures';
import { baseUrlToDomain, generateOtp, login, startClient, tenantTokenRetrieval } from '../utils/commands';

test.describe('Settings', () => {
  test.describe('account upgrades', () => {
    test.use({ storageState: 'storage.json' });
    test('allows upgrading to Professional', async ({ environment, loggedInPage: page }) => {
      test.skip(environment !== 'staging');
      await page.waitForTimeout(1000);
      const wasUpgraded = await page.isVisible(`css=#limit a.inline span >> text=250`);
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
      await page.waitForSelector('text=/Card confirmed./i', { timeout: 10000 });
      await page.waitForSelector('text=/Your upgrade was successful/i', { timeout: 15000 });
      await page.waitForSelector('text=/Organization name/i', { timeout: 10000 });
    });
    test('allows higher device limits once upgraded', async ({ baseUrl, environment, loggedInPage: page }) => {
      test.skip(environment !== 'staging');
      await page.waitForSelector(`css=#limit a.inline span >> text=250`, { timeout: 2000 });
      expect(await page.isVisible(`css=#limit a.inline span >> text=250`)).toBeTruthy();
      const token = await tenantTokenRetrieval(baseUrl, page);
      await startClient(baseUrl, token, 50);
      await page.goto(`${baseUrl}ui/#/devices`);
      await page.waitForSelector('.header-section [href="/ui/#/devices/pending"]', { timeout: 120000 });
      expect(await page.isVisible(`:is(.header-section [href="/ui/#/devices/pending"]:has-text('pending'))`)).toBeTruthy();
      const pendingNotification = await page.$eval('.header-section [href="/ui/#/devices/pending"]', el => el.textContent);
      expect(Number(pendingNotification.split(' ')[0])).toBeGreaterThan(10);
    });
  });

  test.describe('2FA setup', () => {
    test('supports regular 2fa setup', async ({ baseUrl, context, environment, username, password }) => {
      test.skip(environment !== 'staging');
      const { token, userId } = await login(username, password, baseUrl);
      const domain = baseUrlToDomain(baseUrl);
      await context.addCookies([
        { name: 'JWT', value: token, path: '/', domain },
        { name: `${userId}-onboarded`, value: 'true', path: '/', domain },
        { name: 'cookieconsent_status', value: 'allow', path: '/', domain }
      ]);
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui`);

      let tfaSecret;
      try {
        tfaSecret = fs.readFileSync('secret.txt', 'utf8');
      } catch (error) {
        // moving on
      }
      if (tfaSecret) {
        test.skip('looks like the account is already 2fa enabled, continue with the remaining tests');
      }
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('text=/Enable Two Factor/');
      await page.waitForSelector('.margin-top img');
      const qrCode = await page.$eval('.margin-top img', (el: HTMLImageElement) => el.src);
      const png = PNG.sync.read(Buffer.from(qrCode.slice('data:image/png;base64,'.length), 'base64'));
      const qrcode = new Decoder();
      const decodedQr = await qrcode.decode(Uint8ClampedArray.from(png.data), png.width, png.height);
      const qrData = new URLSearchParams(decodedQr.data);
      console.log(qrData.get('secret'));
      const qrToken = await generateOtp(qrData.get('secret'));
      console.log('Generated otp:', qrToken);
      await page.fill('#token2fa', qrToken);
      await page.click(`css=button >> text=Verify`);
      await page.waitForSelector(`css=ol >> text=Verified`);
      await page.click(`css=button >> text=Save`);
      await page.click(`css=.header-dropdown >> text=${username}`);
      await page.click(`css=span >> text='Log out'`);
      await page.waitForTimeout(1000);
      await context.clearCookies();
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible(`button :has-text('Log in')`)).toBeTruthy();
    });
    test(`prevents from logging in without 2fa code`, async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible(`button :has-text('Log in')`)).toBeTruthy();
      // enter valid username and password
      await page.fill('[name=email]', username);
      await page.fill('[name=password]', password);
      await page.click(`button :has-text('Log in')`);
      await page.waitForTimeout(1000);
      await page.fill('[name=token2fa]', '123456');
      await page.click(`button :has-text('Log in')`);
      // still on /login page plus an error is displayed
      expect(await page.isVisible(`button :has-text('Log in')`)).toBeTruthy();
      await page.waitForSelector('text=/There was a problem logging in/', { timeout: 2000 });
    });
    test('allows turning 2fa off again', async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/#/login`);
      await page.fill('[name=email]', username);
      await page.fill('[name=password]', password);
      await page.click(`button :has-text('Log in')`);
      const newToken = await generateOtp();
      await page.fill('[name=token2fa]', newToken);
      await page.click(`button :has-text('Log in')`);
      await page.waitForSelector('text=License information');
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('text=/Enable Two Factor/');
      await page.waitForTimeout(2000);
    });
    test('allows logging in without 2fa after deactivation', async ({ baseUrl, environment, page, password, username }) => {
      test.skip(environment !== 'staging');
      await page.goto(`${baseUrl}ui/#/login`);
      await page.fill('[name=email]', username);
      await page.fill('[name=password]', password);
      await page.click(`:is(button:has-text('Log in'))`);
      await page.goto(`${baseUrl}ui/#/settings`);
      await page.waitForSelector('text=License information');
    });
  });

  test.describe('Basic setting features', () => {
    const replacementPassword = 'mysecretpassword!456';

    test('allows access to user management', async ({ baseUrl, loggedInPage: page }) => {
      // test.use({ storageState: 'storage.json' });
      await page.goto(`${baseUrl}ui/#/settings`);
      await page.waitForSelector('text=/Global settings/i');
      await page.click('text=/user management/i');
      await page.goto(`${baseUrl}ui/#/settings/user-management`);
      const isVisible = await page.isVisible(`text=/Create new user/i`);
      if (!isVisible) {
        console.log('settings may not be loaded - move around');
        await page.goto(`${baseUrl}ui/#/help`);
        await page.goto(`${baseUrl}ui/#/settings/user-management`);
      }
      await page.waitForSelector('css=button >> text=Create new user');
    });
    test('allows email changes', async ({ baseUrl, loggedInPage: page }) => {
      // test.use({ storageState: 'storage.json' });
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_email');
    });
    test('allows changing the password', async ({ baseUrl, context, loggedInPage: page, username, password }) => {
      // test.use({ storageState: 'storage.json' });
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_password');

      expect(await page.$eval('[name=password]', (el: HTMLInputElement) => el.value)).toBeFalsy();
      await page.click(`:is(button:has-text('Generate'))`);
      await page.click(`:is(button:has-text('Generate'))`);
      await page.click('[name=current_password]', { clickCount: 3 });
      await page.fill('[name=current_password]', password);
      const typedCurrentPassword = await page.$eval('[name=current_password]', (el: HTMLInputElement) => el.value);
      expect(typedCurrentPassword === password);
      expect(await page.$eval('[name=password]', (el: HTMLInputElement) => el.value)).toBeTruthy();
      await page.click('[name=password]', { clickCount: 3 });
      await page.fill('[name=password]', replacementPassword);
      const typedPassword = await page.$eval('[name=password]', (el: HTMLInputElement) => el.value);
      expect(typedPassword === replacementPassword);
      await page.fill('[name=password_confirmation]', replacementPassword);
      await page.click(`button:has-text('Save')`);
      await page.waitForSelector('text=/user has been updated/i', { timeout: 10000 });
      await page.click(`:is(.header-dropdown:has-text('${username}'))`);

      await page.click(`:is(span:has-text('Log out'))`);
      await context.clearCookies();
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible('text=/Log in/i')).toBeTruthy();
    });

    test('allows changing the password back', async ({ baseUrl, context, password, username }) => {
      const { token, userId } = await login(username, replacementPassword, baseUrl);
      const domain = baseUrlToDomain(baseUrl);
      await context.addCookies([
        { name: 'JWT', value: token, path: '/', domain },
        { name: `${userId}-onboarded`, value: 'true', path: '/', domain },
        { name: 'cookieconsent_status', value: 'allow', path: '/', domain }
      ]);
      const page = await context.newPage();
      await page.goto(`${baseUrl}ui`);
      await page.waitForSelector('text=/License information/i');
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_password');

      await page.fill('[name=password]', password);
      const typedPassword = await page.$eval('[name=password]', (el: HTMLInputElement) => el.value);
      if (typedPassword !== password) {
        await page.click('[name=password]', { clickCount: 3 });
        await page.fill('[name=password]', password);
      }
      await page.click('[name=password_confirmation]');
      await page.fill('[name=password_confirmation]', password);
      await page.click('[name=current_password]');
      await page.fill('[name=current_password]', replacementPassword);
      await page.click(`:is(button:has-text('Save'))`);
      await page.waitForSelector('text=/user has been updated/i', { timeout: 10000 });
      await page.waitForTimeout(3000);

      const { token: newToken } = await login(username, password, baseUrl);
      expect(newToken).toBeTruthy();
    });
  });
});
