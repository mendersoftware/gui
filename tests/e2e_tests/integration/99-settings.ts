import * as fs from 'fs';
import { Decoder } from '@nuintun/qrcode';
import { BrowserContext, Page } from 'playwright';
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';

import { generateOtp, login, setupPage, startClient, tenantTokenRetrieval } from '../utils/commands';
import { contextOptions, testParams } from '../config';

const { baseUrl, environment, password, username } = testParams;

test.describe('Settings', () => {
  test.describe('account upgrades', () => {
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
    test.skip(environment !== 'staging');
    test('allows upgrading to Professional', async () => {
      const wasUpgraded = await page.isVisible(`css=#limit a.inline span >> text=250`);
      if (wasUpgraded) {
        test.skip('looks like the account was upgraded already, continue with the remaining tests');
      }
      await page.click(`text=Upgrade now`);
      await page.click(`css=.planPanel >> text=Professional`);
      await page.waitForSelector('.StripeElement iframe');
      const frameHandle = await page.$('.StripeElement iframe');
      const stripeFrame = await frameHandle.contentFrame();
      await stripeFrame.type('[name="cardnumber"]', '4242424242424242');
      await stripeFrame.type('[name="exp-date"]', '1232');
      await stripeFrame.type('[name="cvc"]', '123');
      await stripeFrame.type('[name="postal"]', '12345');
      await page.click(`button:has-text('Sign up')`);
      await page.waitForSelector('Your upgrade was successful', { timeout: 10000 });
      await page.waitForSelector('Organization name', { timeout: 10000 });
    });
    test('allows higher device limits once upgraded', async ({ context }) => {
      test.skip(environment !== 'staging');
      expect(await page.isVisible(`css=#limit a.inline span >> text=250`)).toBeTruthy();
      const token = await tenantTokenRetrieval(baseUrl, context, page);
      await startClient(baseUrl, token, 50);
      await page.goto(`${baseUrl}ui/#/devices`);
      await page.waitForSelector('.header-section [href="/ui/#/devices/pending"]', { timeout: 120000 });
      expect(await page.isVisible(`:is(.header-section [href="/ui/#/devices/pending"]:has-text('pending'))`)).toBeTruthy();
      const pendingNotification = await page.$eval('.header-section [href="/ui/#/devices/pending"]', el => el.textContent);
      expect(Number(pendingNotification.split(' ')[0])).toBeGreaterThan(10);
    });
  });

  test.describe('2FA setup', () => {
    let context: BrowserContext;
    let page: Page;
    test.skip(environment !== 'staging');
    test('supports regular 2fa setup', async ({ browser }) => {
      let tfaSecret;
      try {
        tfaSecret = fs.readFileSync('secret.txt', 'utf8');
      } catch (error) {
        // moving on
      }
      if (tfaSecret) {
        test.skip('looks like the account is already 2fa enabled, continue with the remaining tests');
      }
      context = await browser.newContext({ ...contextOptions.contextOptions });
      context = await login(username, password, baseUrl, context);
      page = await setupPage(environment, context, page, baseUrl);

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
      await page.type('#token2fa', qrToken);
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
    test(`prevents from logging in without 2fa code`, async ({ browser }) => {
      context = await browser.newContext({ ...contextOptions.contextOptions });
      page = await setupPage(environment, context, page, baseUrl);
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible(`button :has-text('Log in')`)).toBeTruthy();
      // enter valid username and password
      await page.type('[name=email]', username);
      await page.type('[name=password]', password);
      await page.click(`button :has-text('Log in')`);
      await page.waitForTimeout(1000);
      await page.type('[name=token2fa]', '123456');
      await page.click(`button :has-text('Log in')`);
      // still on /login page plus an error is displayed
      expect(await page.isVisible(`button :has-text('Log in')`)).toBeTruthy();
      await page.waitForSelector('text=/There was a problem logging in/', { timeout: 2000 });
    });
    test('allows turning 2fa off again', async ({ browser }) => {
      context = await browser.newContext({ ...contextOptions.contextOptions });
      page = await setupPage(environment, context, page, baseUrl);
      await page.goto(`${baseUrl}ui/#/login`);
      await page.type('[name=email]', username);
      await page.type('[name=password]', password);
      await page.click(`button :has-text('Log in')`);
      const newToken = await generateOtp();
      await page.type('[name=token2fa]', newToken);
      await page.click(`button :has-text('Log in')`);
      await page.waitForSelector('text=License information');
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('text=/Enable Two Factor/');
      await page.waitForTimeout(2000);
    });
    test('allows logging in without 2fa after deactivation', async ({ browser }) => {
      context = await browser.newContext({ ...contextOptions.contextOptions });
      page = await setupPage(environment, context, page, baseUrl);
      await page.goto(`${baseUrl}ui/#/login`);
      await page.type('[name=email]', username);
      await page.type('[name=password]', password);
      await page.click(`:is(button:has-text('Log in'))`);
      await page.goto(`${baseUrl}ui/#/settings`);
      await page.waitForSelector('text=License information');
    });
  });

  test.describe('Basic setting features', () => {
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

    const replacementPassword = 'mysecretpassword!456';

    test('allows access to user management', async () => {
      await page.goto(`${baseUrl}ui/#/settings`);
      await page.waitForSelector('text=/Global settings/i');
      await page.click('text=/user management/i');
      await page.goto(`${baseUrl}ui/#/settings/user-management`);
      const allowsUserCreation = await page.isVisible(`text=Create new user`);
      const content = await page.$('.tab-container.with-sub-panels');
      if (!allowsUserCreation) {
        console.log(content);
      }
      expect(allowsUserCreation).toBeTruthy();
    });
    test('allows email changes', async () => {
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_email');
    });
    test('allows changing the password', async ({ context }) => {
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_password');

      expect(await page.$eval('[name=password]', (el: HTMLInputElement) => el.value)).toBeFalsy();
      await page.click(`:is(button:has-text('Generate'))`);
      await page.click(`:is(button:has-text('Generate'))`);
      expect(await page.$eval('[name=password]', (el: HTMLInputElement) => el.value)).toBeTruthy();
      await page.click('[name=password]', { clickCount: 3 });
      await page.type('[name=password]', replacementPassword);
      const typedPassword = await page.$eval('[name=password]', (el: HTMLInputElement) => el.value);
      expect(typedPassword === replacementPassword);
      await page.click(`button:has-text('Save')`);
      await page.waitForSelector('text=/user has been updated/i', { timeout: 10000 });
      await page.click(`:is(.header-dropdown:has-text('${username}'))`);

      await page.click(`:is(span:has-text('Log out'))`);
      await context.clearCookies();
      // await page.waitForSelector('text=/Log in/i');
      await page.goto(`${baseUrl}ui/`);
      expect(await page.isVisible('text=/Log in/i')).toBeTruthy();
    });

    test('allows changing the password back', async ({ browser }) => {
      await page.goto(`${baseUrl}ui/`);
      const showsLogin = await page.isVisible('text=/Log in/i');
      if (showsLogin) {
        await page.waitForSelector('[name=email]');
        await page.click('[name=email]');
        await page.type('[name=email]', username);
        await page.waitForSelector('[name=password]');
        await page.click('[name=password]');
        await page.type('[name=password]', replacementPassword);
        await page.click(`:is(button:has-text('Log in'))`);
        await page.waitForSelector('text=License information');
      }
      await page.goto(`${baseUrl}ui/#/settings/my-account`);
      await page.click('#change_password');

      await page.type('[name=password]', password);
      const typedPassword = await page.$eval('[name=password]', (el: HTMLInputElement) => el.value);
      if (typedPassword !== password) {
        await page.click('[name=password]', { clickCount: 3 });
        await page.type('[name=password]', password);
      }
      await page.click(`:is(button:has-text('Save'))`);
      await page.waitForSelector('text=/user has been updated/i', { timeout: 10000 });
      await page.waitForTimeout(3000);

      const storageState = JSON.parse(process.env.STORAGE || '{}');
      context = await browser.newContext({ ...contextOptions.contextOptions, storageState });
      expect(await login(username, password, baseUrl, context)).toBeTruthy();
    });
  });
});
