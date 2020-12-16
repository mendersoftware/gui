import Cookies from 'universal-cookie';

import { getToken, logout, updateMaxAge, expirySet } from './auth';

describe('getToken function', () => {
  it('returns the jwt token if set in a cookie', () => {
    jest.clearAllMocks();
    expect(getToken()).toBeTruthy();
  });
});

describe('logout function', () => {
  it('redirects and removes the JWT token', () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.remove.mockReturnValueOnce();
    logout();
    expect(window.location.replace).toHaveBeenCalledTimes(1);
    expect(cookies.remove).toHaveBeenCalledTimes(2);
  });
});

describe('updateMaxAge function', () => {
  it('extends the expiration date of the jwt token', () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.get.mockReturnValue('false');
    cookies.set.mockReturnValueOnce();
    updateMaxAge();
    expect(cookies.get).toHaveBeenCalledTimes(2);
    expect(cookies.set).toHaveBeenCalledTimes(1);
  });
  it('should not extend when the staying logged in cookie is not set', () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.get.mockReturnValue('true');
    cookies.set.mockReturnValueOnce();
    updateMaxAge();
    expect(cookies.get).toHaveBeenCalledTimes(2);
    expect(cookies.set).toHaveBeenCalledTimes(0);
  });
});

describe('expirySet function', () => {
  it('decide if the jwt token should expire based on cookie value', () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    cookies.get.mockReturnValueOnce('true');
    expect(expirySet()).toEqual(false);
    expect(cookies.get).toHaveBeenCalledTimes(1);
  });
});
