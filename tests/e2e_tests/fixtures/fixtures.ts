import { test as coveredTest, expect } from '@bgotink/playwright-coverage';
import { Page, test as nonCoveredTest } from '@playwright/test';

import { baseUrlToDomain, getPeristentLoginInfo, login } from '../utils/commands';

type TestFixtures = {
  baseUrl: string;
  config: unknown;
  environment: string;
  loggedInPage: Page;
  username: string;
  password: string;
  demoDeviceName: string;
};

const urls = {
  localhost: 'https://docker.mender.io/',
  staging: 'https://staging.hosted.mender.io/',
  production: 'https://hosted.mender.io/'
};

const defaultConfig = {
  baseUrl: urls.localhost,
  username: 'mender-demo@example.com',
  password: 'mysecretpassword!123',
  demoDeviceName: 'original'
};

const test = (process.env.TEST_ENVIRONMENT === 'staging' ? nonCoveredTest : coveredTest).extend<TestFixtures>({
  loggedInPage: async ({ baseUrl, browserName, context, password, username }, use) => {
    // const storageState = JSON.parse(process.env.STORAGE || '{}');
    // let context: BrowserContext = await browser.newContext({ storageState });
    if (!['firefox', 'webkit'].includes(browserName)) {
      await context.grantPermissions(['clipboard-read'], { origin: baseUrl });
    }
    const domain = baseUrlToDomain(baseUrl);
    const { token, userId } = await login(username, password, baseUrl);
    await context.addCookies([
      { name: 'JWT', value: token, path: '/', domain },
      { name: `${userId}-onboarded`, value: 'true', path: '/', domain },
      { name: 'cookieconsent_status', value: 'allow', path: '/', domain }
    ]);
    const page = await context.newPage();
    await page.goto(`${baseUrl}ui/`);
    await page.evaluate(() => localStorage.setItem(`onboardingComplete`, 'true'));
    await page.waitForSelector('text=License information');
    await use(page);
    await context.storageState({ path: 'storage.json' });
  },
  // eslint-disable-next-line no-empty-pattern
  environment: async ({}, use) => {
    const environment = process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : 'localhost';
    await use(environment);
  },
  username: async ({ environment }, use) => {
    let username = defaultConfig.username;
    if (environment === 'staging') {
      username = getPeristentLoginInfo().username;
    }
    await use(username);
  },
  password: async ({ environment }, use) => {
    let password = defaultConfig.password;
    if (environment === 'staging') {
      password = getPeristentLoginInfo().password;
    }
    await use(password);
  },
  baseUrl: async ({ environment }, use) => {
    const baseUrl = urls[environment] || defaultConfig.baseUrl;
    await use(baseUrl);
  },
  demoDeviceName: defaultConfig.demoDeviceName
});

export { expect };
export default test;
