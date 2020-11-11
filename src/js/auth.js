import Cookies from 'universal-cookie';
const cookies = new Cookies();

export function getToken() {
  return cookies.get('JWT');
}

export function logout() {
  cookies.remove('JWT', { path: '/' });
  window.location.replace('#/login');
}

export function updateMaxAge() {
  const userCookie = getToken();
  if (userCookie && expirySet()) {
    cookies.set('JWT', userCookie, { maxAge: 900, sameSite: 'strict', path: '/' });
  }
}

export function expirySet() {
  return cookies.get('noExpiry') !== 'true';
}
