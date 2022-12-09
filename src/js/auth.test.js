import Cookies from 'universal-cookie';

import { expirySet, getToken, logout, updateMaxAge } from './auth';

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
    expect(window.localStorage.removeItem).toHaveBeenCalledTimes(2);
    expect(cookies.remove).toHaveBeenCalledTimes(2);
  });
});

describe('updateMaxAge function', () => {
  it('extends the expiration date of the jwt token', async () => {
    jest.clearAllMocks();
    const cookies = new Cookies();
    window.localStorage.getItem.mockReturnValue('false');
    updateMaxAge();
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(2);
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(1);
  });
  it('should keep any long expiration from the jwt cookie when the staying logged in setting is set', async () => {
    jest.clearAllMocks();
    window.localStorage.getItem.mockReturnValue('true');
    const cookies = new Cookies();
    updateMaxAge();
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(2);
    expect(cookies.get).toHaveBeenCalledTimes(1);
    expect(cookies.set).toHaveBeenCalledTimes(0);
  });
});

describe('expirySet function', () => {
  it('decide if the jwt token should expire based on the related local storage value', async () => {
    jest.clearAllMocks();
    window.localStorage.getItem.mockReturnValue('true');
    expect(expirySet()).toEqual(false);
    expect(window.localStorage.getItem).toHaveBeenCalledTimes(1);
  });
});
