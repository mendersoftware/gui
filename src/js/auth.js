import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const getToken = () => cookies.get('JWT', { doNotParse: true });

export const cleanUp = () => {
  cookies.remove('noExpiry', { path: '/' });
  cookies.remove('noExpiry', { path: '/ui' });
  cookies.remove('JWT', { path: '/' });
  cookies.remove('JWT', { path: '/ui' });
  window.localStorage.removeItem('oauth');
};

export const logout = () => {
  cleanUp();
  window.location.replace('#/login');
};

const maxAge = 900;

export const updateMaxAge = () => {
  const userCookie = getToken();
  const oAuthExpiration = Number(window.localStorage.getItem('oauth'));
  let updateWithOAuth = false;
  if (oAuthExpiration) {
    const soon = Date.now() + maxAge * 1000;
    updateWithOAuth = oAuthExpiration <= soon;
    if (updateWithOAuth) {
      window.localStorage.removeItem('oauth');
    }
  }
  if (userCookie && expirySet() && (!oAuthExpiration || updateWithOAuth)) {
    cookies.set('JWT', userCookie, { maxAge, sameSite: 'strict', secure: true, path: '/' });
  }
};

export const expirySet = () => cookies.get('noExpiry') !== 'true';
