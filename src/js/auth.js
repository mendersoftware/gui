var LocalStore = require('./stores/local-store');

module.exports = {
 
  isLoggedIn() {
    return LocalStore.getStorageItem("JWT");
  },

}