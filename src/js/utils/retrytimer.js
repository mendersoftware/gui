import { getToken } from '../auth';
import { TIMEOUTS } from '../constants/appConstants';
import { extractErrorMessage, preformatWithRequestID } from '../helpers';

let timers = {};

export function setRetryTimer(err, service, errorContext, timeLeft, setSnackbar) {
  // check if logged in and if service not already retrying
  if (!timers[service] && getToken()) {
    let remaining = timeLeft - TIMEOUTS.oneSecond;
    timers[service] = setInterval(() => {
      remaining -= TIMEOUTS.oneSecond;
      const errMsg = extractErrorMessage(err, 'Please check your connection.');
      remaining > 0
        ? setSnackbar(preformatWithRequestID(err.response, `${errorContext} ${errMsg} Retrying in ${remaining / 1000} seconds`))
        : clearRetryTimer(service, setSnackbar);
    }, TIMEOUTS.oneSecond);
  }
}

export function clearRetryTimer(service, setSnackbar) {
  if (timers[service]) {
    clearInterval(timers[service]);
    delete timers[service];
    setSnackbar('');
  }
}

export function clearAllRetryTimers(setSnackbar) {
  Object.keys(timers).map(service => clearRetryTimer(service, setSnackbar));
  setSnackbar('');
}
