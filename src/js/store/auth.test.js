// Copyright 2020 Northern.tech AS
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
import Cookies from 'universal-cookie';

import { expirySet, getToken, logout, updateMaxAge } from './auth';

const nonExpiringToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTNkMGY4Yy1hZWRlLTQwMzAtYjM5MS03ZDUwMjBlYjg3M2UiLCJzdWIiOiJhMzBhNzgwYi1iODQzLTUzNDQtODBlMy0wZmQ5NWE0ZjZmYzMiLCJpYXQiOjE2MDYyMTA1NjksIm1lbmRlci50ZW5hbnQiOiI1Zjg1YzE3YmNlNjJiN2ZhN2Y1ZjcwNDAiLCJtZW5kZXIudXNlciI6dHJ1ZSwiaXNzIjoiTWVuZGVyIFVzZXJzIiwic2NwIjoibWVuZGVyLioiLCJtZW5kZXIucGxhbiI6InByb2Zlc3Npb25hbCIsIm5iZiI6MTYwNjIxMDU2OX0.wqnYb55UK7lPNt6YDJ_lG7NoGBAoYwwrNS9hA0L2qFU7dSQFjKNlF1gC1zA0vejQhrecX7yHJI9pMh_OL9q2VDa7ekQ8GYtA9Hzc3qmA1oxwJp_QwayaJxZ9eekyXzN08SCKlNU5Nuphu9hkXlLzVlsYXJaY0DmB4nG17xN5z5PJwZLVteWt_yg0LCbiiPkP_bxT5xurBay48VExTK19GVfhWjdzUuTGfctAAMd-Agja4Ng85RrU9yKGNboilO1-uyPB1L60IEKdBRZW_B61690zzaacYAByCOJ5bdOLmCUpGAWDRrfTaxvpy6zCPhu3u4xog5OqqhA0VAJeCz4SWg';

describe('getToken function', () => {
  it('returns the jwt token if set in a cookie', async () => {
    jest.clearAllMocks();
    expect(getToken()).toBeTruthy();
  });
});

describe('logout function', () => {
  it('redirects and removes the JWT token', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    logout();
    expect(window.location.replace).toHaveBeenCalledTimes(1);
    expect(window.localStorage.removeItem).toHaveBeenCalledTimes(1);
    expect(cookies.remove).toHaveBeenCalledTimes(2);
  });
});

describe('updateMaxAge function', () => {
  it('extends the expiration date of the jwt token', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    updateMaxAge();
    expect(cookies.get).toHaveBeenCalledTimes(2);
    expect(cookies.set).toHaveBeenCalledTimes(1);
  });
  it('should keep any long expiration from the jwt cookie when the staying logged in setting is set', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.get.mockReturnValueOnce(nonExpiringToken).mockReturnValueOnce(nonExpiringToken);
    updateMaxAge();
    expect(cookies.get).toHaveBeenCalledTimes(2);
    expect(cookies.set).toHaveBeenCalledTimes(0);
  });
});

describe('expirySet function', () => {
  it('decide if the jwt token should expire based on the cookie information', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    expect(expirySet()).toEqual(true);
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(0);
  });
  it('decide if the jwt token should expire based on the cookie information - pt. 2', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.get.mockReturnValueOnce(nonExpiringToken);
    expect(expirySet()).toEqual(false);
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(0);
  });
});
