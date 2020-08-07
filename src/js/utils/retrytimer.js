import store from '../reducers';
import { preformatWithRequestID } from '../helpers';

var timerArr = {};

export function setRetryTimer(err, service, msg, timeLeft, setSnackbar) {
  // check if logged in and if service not already retrying
  if (!timerArr[service] && (store.getState().users.byId[store.getState().users.currentUser] || {}).hasOwnProperty('email')) {
    var remaining = timeLeft - 1000;
    timerArr[service] = setInterval(() => {
      remaining -= 1000;
      remaining > 0
        ? setSnackbar(preformatWithRequestID(err.response, `${msg} Retrying in ${remaining / 1000} seconds`))
        : clearRetryTimer(service, setSnackbar);
    }, 1000);
  }
}

export function clearRetryTimer(service, setSnackbar) {
  if (timerArr[service]) {
    clearInterval(timerArr[service]);
    delete timerArr[service];
    setSnackbar('');
  }
}

export function clearAllRetryTimers(setSnackbar) {
  for (var service in timerArr) {
    clearRetryTimer(service, setSnackbar);
  }
  setSnackbar('');
}
