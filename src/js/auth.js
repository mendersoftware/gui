import cookie from 'react-cookie';
import { hashHistory } from 'react-router';

export function isLoggedIn() {
  return cookie.load('JWT');
}

export function unauthorizedRedirect(req) {
  //  redirect on 401 invalid token
  req.on('response', function (res) {
    if (res.status === 401) {
      logout();
    }
  });
}

export function logout() {
  cookie.remove('JWT');
  hashHistory.replace("/login");
}


export function updateMaxAge() {
  var userCookie = cookie.load('JWT');
  if (userCookie && expirySet()) {
    cookie.save("JWT", userCookie, {maxAge: 900});
  }
}

export function expirySet() {
  return (cookie.load("noExpiry") !== "true");
}