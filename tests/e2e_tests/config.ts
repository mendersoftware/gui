import { ChromiumEnv, PlaywrightOptions, setConfig, test } from '@playwright/test';
import { v4 as uuid } from 'uuid';
import { baseUrlToDomain } from './utils/commands';

setConfig({
  forbidOnly: !!process.env.CI,
  // Two retries for each test.
  retries: 2,
  testDir: 'integration',
  timeout: 60000,
  workers: 1
});

// type TestFixtures = {
//   baseUrl: string;
//   config: Object;
//   username: string;
//   password: string;
//   demoDeviceName: string;
// };

const defaultConfig = {
  baseUrl: 'https://docker.mender.io/',
  username: 'mender-demo@example.com',
  password: 'mysecretpassword!123',
  demoDeviceName: 'release-v1'
};

process.env.STAGING_USER = process.env.STAGING_USER ?? `${uuid()}@example.com`;
process.env.STAGING_PASSWORD = process.env.STAGING_PASSWORD ?? uuid();

const urls = {
  localhost: 'https://docker.mender.io/',
  staging: 'https://staging.hosted.mender.io/',
  production: 'https://hosted.mender.io/'
};

export const testParams = {
  baseUrl: urls[process.env.TEST_ENVIRONMENT] || urls.localhost,
  environment: process.env.TEST_ENVIRONMENT,
  username: process.env.TEST_ENVIRONMENT === 'staging' ? process.env.STAGING_USER : defaultConfig.username,
  password: process.env.TEST_ENVIRONMENT === 'staging' ? process.env.STAGING_PASSWORD : defaultConfig.password,
  demoDeviceName: defaultConfig.demoDeviceName
};

const options: PlaywrightOptions = {
  acceptDownloads: true,
  args: ['--disable-dev-shm-usage', '--disable-web-security'],
  // to ease running the test locally and "headful" uncomment and modify the below option to match your preferred browser installation
  // this might also require adjusting the `runWith` call at the bottom of the file
  // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  slowMo: 50,
  screenshot: 'only-on-failure',
  // headless: false,
  timeout: 60000,
  ignoreHTTPSErrors: true,
  viewport: { width: 1600, height: 900 },
  storageState: {
    cookies: [{ name: 'cookieconsent_status', value: 'allow', path: '/', domain: baseUrlToDomain(testParams.baseUrl) }]
  }
};

export const contextOptions = {
  contextOptions: {
    ...options
  }
};

test.runWith(new ChromiumEnv(options), { tag: 'chrome' });
