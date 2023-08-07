// Copyright 2016 Northern.tech AS
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
import jwtDecode from 'jwt-decode';
import Cookies from 'universal-cookie';

import { constants } from './store';

const { TIMEOUTS } = constants;

const cookies = new Cookies();

export const getToken = () => cookies.get('JWT', { doNotParse: true });

export const cleanUp = () => {
  cookies.remove('JWT', { path: '/' });
  cookies.remove('JWT', { path: '/ui' });
  window.localStorage.removeItem('oauth');
};

export const logout = () => {
  cleanUp();
  window.location.replace('/ui/');
};

const maxAge = 900;

export const updateMaxAge = () => {
  const userCookie = getToken();
  const oAuthExpiration = Number(window.localStorage.getItem('oauth'));
  let updateWithOAuth = false;
  if (oAuthExpiration) {
    const soon = Date.now() + maxAge * TIMEOUTS.oneSecond;
    updateWithOAuth = oAuthExpiration <= soon;
    if (updateWithOAuth) {
      window.localStorage.removeItem('oauth');
    }
  }
  if (userCookie && expirySet() && (!oAuthExpiration || updateWithOAuth)) {
    cookies.set('JWT', userCookie, { maxAge, sameSite: 'strict', secure: true, path: '/' });
  }
};

export const expirySet = () => {
  let jwt;
  try {
    jwt = jwtDecode(getToken());
  } catch {
    return false;
  }
  return !!jwt?.exp;
};
