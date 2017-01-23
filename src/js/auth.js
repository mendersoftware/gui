var LocalStore = require('./stores/local-store');
import { Router, hashHistory } from 'react-router';

module.exports = {
 
  isLoggedIn() {
    return LocalStore.getStorageItem("JWT");
  },

  unauthorizedRedirect(req) {
    // clear storage and redirect on 401 invalid token
    req.on('response', function (res) {
      if (res.status === 401) {
        localStorage.removeItem("JWT");
        hashHistory.replace("/login");
      }
    });
  },

}