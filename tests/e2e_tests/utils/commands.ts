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
import { BrowserContext, Page } from '@playwright/test';
import axios from 'axios';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as https from 'https';
import jwtDecode from 'jwt-decode';
import { authenticator } from 'otplib';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { v4 as uuid } from 'uuid';

export const getPeristentLoginInfo = () => {
  let loginInfo;
  try {
    const content = fs.readFileSync('loginInfo.json', 'utf8');
    loginInfo = JSON.parse(content);
    return loginInfo;
  } catch (error) {
    loginInfo = { username: process.env.STAGING_USER ?? `${uuid()}@example.com`, password: process.env.STAGING_PASSWORD ?? uuid() };
  }
  fs.writeFileSync('loginInfo.json', JSON.stringify(loginInfo));
  return loginInfo;
};

export const prepareCookies = async (context: BrowserContext, domain: string, userId: string, token: string) => {
  await context.addCookies([
    { name: 'JWT', value: token, path: '/', domain },
    { name: `${userId}-onboarded`, value: 'true', path: '/', domain },
    { name: 'cookieconsent_status', value: 'allow', path: '/', domain }
  ]);
  return context;
};

const updateConfigFileWithUrl = (fileName, serverUrl = 'https://docker.mender.io', token = '') => {
  const connectConfigFile = fs.readFileSync(`dockerClient/${fileName}.json`, 'utf8');
  const connectConfig = JSON.parse(connectConfigFile);
  connectConfig.ServerURL = serverUrl;
  if (token) {
    connectConfig.TenantToken = token;
  }
  fs.writeFileSync(`dockerClient/${fileName}-test.json`, JSON.stringify(connectConfig));
};

const deviceType = 'qemux86-64';
const artifactName = 'original';
const updateInterval = 5;
const attributes = {
  device_type: deviceType,
  client_version: 'mender-2.2.0',
  artifact_name: artifactName,
  kernel: 'test Linux version',
  mac_enp0: '12.34'
};
const clientArgs = [
  'run',
  ...Object.entries(attributes).map(([key, value]) => `--inventory-attribute="${key}:${value}"`),
  `--device-type=${deviceType}`,
  `--artifact-name=${artifactName}`,
  `--auth-interval=${updateInterval}`,
  `--inventory-interval=${updateInterval}`,
  `--update-interval=${updateInterval}`
];
export const startClient = async (baseUrl, token, count) => {
  const srippedBaseUrl = baseUrl.replace(/\/$/, '');
  const args = [...clientArgs, `--count=${count}`, `--server-url=${srippedBaseUrl}`];
  if (token) {
    args.push(`--tenant-token=${token}`);
  }
  console.log(`starting using: ./mender-stress-test-client ${args.join(' ')}`);
  const child = spawn('./mender-stress-test-client', args);
  child.on('error', err => console.error(`${err}`));
  child.on('message', err => console.error(`${err}`));
  child.on('spawn', err => console.error(`${err}`));
  // child.stdout.on('data', data => {
  //   console.log(`stdout mstc: ${data}`);
  // });
  child.stderr.on('data', data => {
    console.error(`stderr mstc: ${data}`);
  });
  child.on('close', code => {
    console.log(`child process exited with code ${code}`);
  });
};

export const startDockerClient = async (baseUrl, token) => {
  const projectRoot = process.cwd();
  const srippedBaseUrl = baseUrl.replace(/\/$/, '');
  updateConfigFileWithUrl('mender', srippedBaseUrl, token);
  updateConfigFileWithUrl('mender-connect', srippedBaseUrl, token);
  // NB! to run the tests against a running local Mender backend, uncomment & adjust the following
  // const localNetwork = ['--network', 'menderintegration_mender'];
  const localNetwork = baseUrl.includes('docker.mender.io') ? ['--network', 'gui-tests_mender'] : [];
  const args = [
    'run',
    '-d',
    '--name',
    'connect-client',
    ...localNetwork,
    '-v',
    `${projectRoot}/dockerClient/mender-test.json:/etc/mender/mender.conf`,
    '-v',
    `${projectRoot}/dockerClient/mender-connect-test.json:/etc/mender/mender-connect.conf`,
    'mendersoftware/mender-client-docker-addons:master'
  ];
  console.log(`starting with: ${token}`);
  console.log(`starting using: docker ${args.join(' ')}`);
  const child = spawn('docker', args);
  child.on('error', err => console.error(`${err}`));
  child.on('message', err => console.error(`${err}`));
  child.on('spawn', err => console.error(`${err}`));
  // child.stdout.on('data', data => {
  //   console.log(`stdout docker: ${data}`);
  // });
  child.stderr.on('data', data => {
    console.error(`stderr docker: ${data}`);
  });
  child.on('close', code => {
    console.log(`child process exited with code ${code}`);
  });
  return Promise.resolve();
};

export const stopDockerClient = async () => {
  console.log('stopping: docker');
  const child = spawn('docker stop connect-client && docker rm connect-client', {
    shell: true
  });
  child.on('error', err => console.error(`${err}`));
  child.on('message', err => console.error(`${err}`));
  child.on('spawn', err => console.error(`${err}`));
  child.stderr.on('data', data => console.error(`stderr docker: ${data}`));
  child.on('close', code => console.log(`child process exited with code ${code}`));
  return Promise.resolve();
};

export const login = async (username: string, password: string, baseUrl: string) => {
  const request = await axios({
    url: `${baseUrl}api/management/v1/useradm/auth/login`,
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });

  if (request.status !== 200) {
    throw 'oh no';
  }

  const token = request.data;
  const userId = jwtDecode(token).sub;
  return { token, userId };
};

export const tenantTokenRetrieval = async (baseUrl: string, page: Page) => {
  await page.goto(`${baseUrl}ui/settings/organization-and-billing`);
  await page.waitForSelector('.tenant-token-text');
  const token = await page.$eval('.tenant-token-text', el => el.textContent);
  console.log(token);
  return token;
};

let previousSecret;
export const generateOtp = async (otpSecret?) => {
  let filesecret;
  try {
    filesecret = fs.readFileSync('secret.txt', 'utf8');
    console.log(filesecret);
  } catch (error) {
    console.log('no secret.txt found - moving on...');
  }
  previousSecret = otpSecret ?? previousSecret ?? filesecret;
  const secret = previousSecret;
  if (!secret) {
    throw new Error('No secret has been provided.');
  }
  fs.writeFileSync('secret.txt', secret);
  console.log(`2fa secret: ${secret}`);
  return authenticator.generate(secret);
};

const protocol = 'https://';
export const baseUrlToDomain = (baseUrl: string) => baseUrl.substring(baseUrl.indexOf(protocol) + protocol.length, baseUrl.length - 1);

export const compareImages = (expectedPath, actualPath, options = { threshold: 0.1, usePercentage: true }) => {
  const { threshold, usePercentage } = options;
  if (!fs.existsSync(expectedPath)) {
    fs.copyFileSync(actualPath, expectedPath);
  }
  const img1 = PNG.sync.read(fs.readFileSync(actualPath));
  const img2 = PNG.sync.read(fs.readFileSync(expectedPath));
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, options);
  const diffPath = path.join(__dirname, '..', 'test-results', 'diffs');
  if (!fs.existsSync(diffPath)) {
    fs.mkdirSync(diffPath);
  }
  fs.writeFileSync(path.join(diffPath, `diff-${Date.now()}.png`), PNG.sync.write(diff));
  const pass = usePercentage ? (numDiffPixels / (width * height)) * 100 < threshold : numDiffPixels < threshold;
  return { pass, numDiffPixels };
};
