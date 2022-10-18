import { TIMEOUTS } from '../constants/appConstants';
import store from '../reducers';
import { extractErrorMessage, preformatWithRequestID } from '../helpers';

var timerArr = {};

export function setRetryTimer(err, service, errorContext, timeLeft, setSnackbar) {
  // check if logged in and if service not already retrying
  if (!timerArr[service] && (store.getState().users.byId[store.getState().users.currentUser] || {}).hasOwnProperty('email')) {
    var remaining = timeLeft - TIMEOUTS.oneSecond;
    timerArr[service] = setInterval(() => {
      remaining -= TIMEOUTS.oneSecond;
      const errMsg = extractErrorMessage(err, 'Please check your connection.');
      remaining > 0
        ? setSnackbar(preformatWithRequestID(err.response, `${errorContext} ${errMsg} Retrying in ${remaining / 1000} seconds`))
        : clearRetryTimer(service, setSnackbar);
    }, TIMEOUTS.oneSecond);
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
