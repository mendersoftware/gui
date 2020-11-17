import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const getToken = () => cookies.get('JWT');

export const logout = () => {
  cookies.remove('JWT');
  window.location.replace('#/login');
};

export const updateMaxAge = () => {
  const userCookie = getToken();
  if (userCookie && expirySet()) {
    cookies.set('JWT', userCookie, { maxAge: 900, sameSite: 'strict' });
  }
};

export const expirySet = () => cookies.get('noExpiry') !== 'true';
