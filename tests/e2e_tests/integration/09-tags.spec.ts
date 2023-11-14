// Copyright 2023 Northern.tech AS
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
import { v4 as uuidv4 } from 'uuid';

import test, { expect } from '../fixtures/fixtures';
import { selectors, storagePath, timeouts } from '../utils/constants';

const key0 = uuidv4();
const value0 = uuidv4();

test.describe('Device details', () => {
  test.use({ storageState: storagePath });

  test('create tags', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`${selectors.deviceListItem} div:last-child`);
    await page.waitForTimeout(timeouts.oneSecond);
    await page.waitForTimeout(timeouts.oneSecond);
    await page.getByPlaceholder('Key').click();
    await page.getByPlaceholder('Key').fill(key0);
    await page.getByPlaceholder('Value').click();
    await page.getByPlaceholder('Value').fill(value0);
    await page.getByRole('button', { name: 'Save' }).click();
    const keyElement = await page.getByText(key0);
    await expect(keyElement !== undefined).toBeTruthy();
    const valueElement = await page.getByText(value0);
    await expect(valueElement !== undefined).toBeTruthy();
  });

  test('delete tags', async ({ loggedInPage: page }) => {
    await page.click(`.leftNav :text('Devices')`);
    await page.click(`${selectors.deviceListItem} div:last-child`);
    await page.waitForTimeout(timeouts.oneSecond);
    await page.locator('[data-testid="EditIcon"]').nth(1).click();
    await page.waitForTimeout(timeouts.oneSecond);
    await page.getByPlaceholder('Key').fill('');
    await page.getByPlaceholder('Value').fill('');
    await page.getByRole('button', { name: 'Save' }).click();
    const keyElement = await page.getByText(key0);
    expect(keyElement == undefined);
    const valueElement = await page.getByText(value0);
    expect(valueElement == undefined);
  });
});
