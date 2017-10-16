var AppActions = require('../actions/app-actions');
var AppStore = require('../stores/app-store');
var timerArr = {};

export function setRetryTimer(service, msg, timeLeft) {
  // check if logged in and if service not already retrying
  if (!timerArr[service] && AppStore.getCurrentUser().hasOwnProperty("email") ) {
  
    var remaining = timeLeft;
    timerArr[service] = setInterval(function() {
      remaining -= 1000;
      remaining > 0 ? AppActions.setSnackbar(msg + " Retrying in " + remaining/1000 + " seconds") : clearRetryTimer(service);
    }, 1000);
  }
}

export function clearRetryTimer(service) {
  if (timerArr[service]) {
    clearInterval(timerArr[service]);
    delete timerArr[service];
    AppActions.setSnackbar("");
  }

}

export function clearAllRetryTimers() {
  for (var service in timerArr) {
    clearRetryTimer(service);
  }
  AppActions.setSnackbar("");
}