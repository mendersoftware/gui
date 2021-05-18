const { v4: uuid } = require('uuid');
// import * as playwrightGlobalSetup from 'jest-playwright-preset/setup';
// import { chromium } from 'playwright';

// module.exports = async function globalSetup(globalConfig) {
//   await playwrightGlobalSetup(globalConfig);

//   let browser = await chromium.launch();
//   let context = await browser.newContext({ ignoreHTTPSErrors: true });
//   const page = await context.newPage();

//   // your login function
//   // await doLogin(page);

//   // store authentication data
//   const storage = await page.context().storageState();
//   process.env.STORAGE = JSON.stringify(storage);
// };

import { folio as base } from '@playwright/test';

type TestFixtures = {
  baseUrl: string;
  config: Object;
  username: string;
  password: string;
  demoDeviceName: string;
};

const defaultConfig = {
  baseUrl: 'https://docker.mender.io/',
  username: 'mender-demo@example.com',
  password: 'mysecretpassword!123',
  demoDeviceName: 'release-v1'
};

const stagingConfig = {
  username: `${uuid()}@example.com`,
  password: uuid()
};

const urls = {
  localhost: 'https://docker.mender.io/',
  staging: 'https://staging.hosted.mender.io/',
  production: 'https://hosted.mender.io/'
};

const fixtures = base.extend<{}, TestFixtures, { environment: string; usernameParam: string; passwordParam: string }>();
fixtures.contextOptions.override(async ({ contextOptions }, runTest) => {
  await runTest({
    ...contextOptions,
    acceptDownloads: true,
    ignoreHTTPSErrors: true,
    recordVideo: process.env.PWVIDEO ? { dir: 'screenshots' } : undefined,
    viewport: { width: 1600, height: 900 }
  });
});

fixtures.browserOptions.override(async ({ browserOptions }, runTest) => {
  await runTest({
    ...browserOptions, // Default options
    args: ['--disable-dev-shm-usage', '--disable-web-security'],
    slowMo: 100
  });
});

fixtures.environment.initParameter('test environment', process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : 'localhost');
fixtures.usernameParam.initParameter('username ', `${uuid()}@example.com`);
fixtures.passwordParam.initParameter('password', uuid());

fixtures.config.init(async ({}, run) => {
  await run(defaultConfig);
}, {});

fixtures.baseUrl.init(async ({ environment }, run) => {
  const baseUrl = urls[environment] || defaultConfig.baseUrl;
  await run(baseUrl);
}, {});

fixtures.username.init(async ({ environment, usernameParam }, run) => {
  let username = defaultConfig.username;
  if (environment === 'staging') {
    username = usernameParam;
  }
  // if (!process.env.TEST_USERNAME) {
  //   process.env.TEST_USERNAME = username;
  // }
  await run(username);
}, {});

fixtures.password.init(async ({ environment, passwordParam }, run) => {
  let password = defaultConfig.password;
  if (environment === 'staging') {
    password = passwordParam;
  }
  // if (!process.env.TEST_PASSWORD) {
  //   process.env.TEST_PASSWORD = password;
  // }
  await run(password);
}, {});

fixtures.demoDeviceName.init(async ({ environment }, run) => {
  let demoDeviceName = defaultConfig.demoDeviceName;
  if (environment === 'staging') {
    demoDeviceName = 'release-v1';
  }
  await run(demoDeviceName);
}, {});

export const { beforeAll, afterAll, beforeEach, afterEach, it, expect, describe } = fixtures.build();
