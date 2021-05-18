import { Decoder } from '@nuintun/qrcode';
import { BrowserContext, Page } from 'playwright';
import { test, expect } from '@playwright/test';

import { generateOtp, login, setupPage, startClient } from '../utils/commands';
import { contextOptions, testParams } from '../config';

const { baseUrl, environment, password, username } = testParams;

test.describe('Settings', () => {
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

  test.describe('account upgrades', () => {
    test.skip(environment !== 'staging');
    test('allows upgrading to Professional', async () => {
      await page.click(`:is(button:has-text('Upgrade now'))`);
      await page.click(`Organization`);
      await page.click(`:is(button:has-text('Upgrade now'))`);
      await page.click(`:is(.planPanel:has-text('Professional'))`);
      await page.waitForSelector('.StripeElement iframe');
      await page.type('[name="cardnumber"]', '4242424242424242');
      await page.type('[name="exp-date"]', '1232');
      await page.type('[name="cvc"]', '123');
      await page.type('[name="postal"]', '12345');
      await page.click(`:is(button:has-text('Sign up'))`);
      await page.waitForSelector('Your upgrade was successful!', { timeout: 10000 });
      await page.waitForSelector('Organization name', { timeout: 10000 });
    });
    test('allows higher device limits once upgraded', async ({ context }) => {
      test.skip(environment !== 'staging');
      expect(await page.isVisible(`:is(#limit a.inline span:has-text('250'))`)).toBeTruthy();
      const cookies = await context.cookies();
      const token = cookies.find(cookie => cookie.name === 'tenantToken').value;
      await startClient(baseUrl, token, 50);
      await page.goto(`${baseUrl}ui/#/devices`);
      await page.waitForSelector('.header-section [href="/ui/#/devices/pending"]', { timeout: 120000 });
      expect(await page.isVisible(`:is(.header-section [href="/ui/#/devices/pending"]:has-text('pending'))`)).toBeTruthy();
      const pendingNotification = await page.$eval('.header-section [href="/ui/#/devices/pending"]', el => el.textContent);
      expect(Number(pendingNotification.split(' ')[0])).toBeGreaterThan(10);
    });
    test.describe('2FA setup', () => {
      test.skip(environment !== 'staging');
      test('supports regular 2fa setup', async ({ context }) => {
        await page.goto(`${baseUrl}ui/#/settings/my-account`);
        await page.click('Enable Two Factor');
        await page.waitForSelector('.margin-top img');
        const qrcode = new Decoder();
        const qrImg = await page.$eval('.margin-top img', (el: HTMLImageElement) => el.src);
        const decodedQr = await qrcode.scan(qrImg);
        const qrData = new URLSearchParams(decodedQr.data);
        const qrToken = await generateOtp(qrData.get('secret'));
        console.log('Generated otp:', qrToken);
        await page.type('#token2fa', qrToken);
        await page.click(`:is(button:has-text('Verify'))`);
        await page.waitForSelector(`:is(ol:has-text('Verified'))`);
        await page.click(`:is(button:has-text('Save'))`);
        await page.click(`:is(.header-dropdown:has-text('${username}'))`);
        await page.click(`:is(span:has-text('Log out'))`);
        await page.waitForTimeout(1000);
        await context.clearCookies();
        await page.goto(`${baseUrl}ui/`);
        expect(await page.isVisible('Log in')).toBeTruthy();
      });
      test(`prevents from logging in without 2fa code`, async ({ context }) => {
        await page.goto(`${baseUrl}ui/`);
        await context.clearCookies();
        expect(await page.isVisible('Log in')).toBeTruthy();
        // enter valid username and password
        await page.type('[name=email]', username);
        await page.type('[name=password]', password);
        await page.click(`:is(button:has-text('Log in'))`);
        await page.waitForTimeout(1000);
        await page.click(`:is(button:has-text('Log in'))`);
        // still on /login page plus an error is displayed
        expect(await page.isVisible('Log in')).toBeTruthy();
        expect(await page.isVisible('There was a problem logging in')).toBeTruthy();
      });
      test('allows turning 2fa off again', async () => {
        await page.goto(`${baseUrl}ui/#/login`);
        await page.type('[name=email]', username);
        await page.type('[name=password]', password);
        await page.click(`:is(button:has-text('Log in'))`);
        const newToken = await generateOtp();
        await page.type('[name=password]', newToken);
        await page.click(`:is(button:has-text('Log in'))`);
        await page.waitForSelector('text=License information');
        await page.goto(`${baseUrl}ui/#/settings/my-account`);
        await page.click('Enable Two Factor');
        await page.waitForTimeout(2000);
      });
      test('allows logging in without 2fa after deactivation', async () => {
        await page.goto(`${baseUrl}ui/#/login`);
        await page.type('[name=email]', username);
        await page.type('[name=password]', password);
        await page.click(`:is(button:has-text('Log in'))`);
        await page.goto(`${baseUrl}ui/#/settings`);
        expect(await page.isVisible('My profile')).toBeTruthy();
      });
    });
  });

  test.describe('Basic setting features', () => {
    const replacementPassword = 'mysecretpassword!456';

    test('allows access to user management', async () => {
      await page.goto(`${baseUrl}ui/#/settings`);
      await page.waitForSelector('text=/Global settings/i');
      await page.click('text=/user management/i');
      expect(await page.isVisible(`:is(button:has-text('Create new user'))`)).toBeTruthy();
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
