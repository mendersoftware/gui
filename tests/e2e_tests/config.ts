import { PlaywrightTestConfig } from '@playwright/test';
import * as path from 'path';

const contextArgs = {
  acceptDownloads: true,
  ignoreHTTPSErrors: true,
  viewport: { width: 1600, height: 900 }
};

export const contextOptions = {
  ...contextArgs,
  contextOptions: contextArgs,
  // slowMo: 50,
  screenshot: 'only-on-failure',
  video: 'retry-with-video',
  // headless: false,
  launchOptions: {
    ...contextArgs,
    args: process.env.TEST_ENVIRONMENT === 'staging' ? [] : ['--disable-dev-shm-usage', '--disable-web-security']
    // to ease running the test locally and "headful" uncomment and modify the below option to match your preferred browser installation
    // this might also require adjusting the `runWith` call at the bottom of the file
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
};

const options: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [
        ['line'],
        [
          '@bgotink/playwright-coverage',
          {
            sourceRoot: __dirname,
            exclude: ['**/webpack/**', '**/src/less/**'],
            resultDir: path.join(__dirname, 'coverage'),
            // Configure the reports to generate.
            // The value is an array of istanbul reports, with optional configuration attached.
            reports: [['lcov'], ['text-summary', { file: null }]],
            rewritePath: ({ relativePath }) => {
              let sourcePath;
              if (process.env.GUI_REPOSITORY) {
                sourcePath = path.join(process.env.GUI_REPOSITORY, relativePath.substring(relativePath.indexOf('/')));
              } else {
                sourcePath = path.join(__dirname, '..', '..', relativePath.substring(relativePath.indexOf('/')));
              }
              return sourcePath;
            }
          }
        ],
        ['junit', { outputFile: 'junit/results.xml' }]
      ]
    : 'line',
  // Two retries for each test.
  retries: 2,
  testDir: 'integration',
  timeout: 60000,
  use: contextOptions
};

export default options;
