import cookie from 'react-cookie';
import { Router, hashHistory } from 'react-router';

module.exports = {
 
  isLoggedIn() {
    return cookie.load('JWT');
  },

  unauthorizedRedirect(req) {
    //  redirect on 401 invalid token
    req.on('response', function (res) {
      if (res.status === 401) {
        hashHistory.replace("/login");
      }
    });
  },

}