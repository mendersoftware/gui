import Cookies from 'universal-cookie';

import AppConstants from '../constants/appConstants';
import { DEVICE_STATES } from '../constants/deviceConstants';
import { DEPLOYMENT_STATES } from '../constants/deploymentConstants';
import { onboardingSteps } from '../constants/onboardingConstants';
import { extractErrorMessage, preformatWithRequestID } from '../helpers';
import { getUserSettings } from '../selectors';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import { getDeviceAttributes, getDevicesByStatus, getDeviceLimit, getDynamicGroups, getGroups } from './deviceActions';
import { getDeploymentsByStatus } from './deploymentActions';
import { getReleases } from './releaseActions';
import { saveUserSettings, getGlobalSettings, getRoles } from './userActions';
import { getUserOrganization } from './organizationActions';

const cookies = new Cookies();

export const commonErrorHandler = (err, errorContext, dispatch, fallback) => {
  const errMsg = extractErrorMessage(err, fallback);
  dispatch(setSnackbar(preformatWithRequestID(err.response, `${errorContext} ${errMsg}`), null, 'Copy to clipboard'));
  return Promise.reject(err);
};

export const initializeAppData = () => (dispatch, getState) => {
  let tasks = [
    dispatch(getGlobalSettings()),
    dispatch(getDeviceAttributes()),
    dispatch(getDeploymentsByStatus(DEPLOYMENT_STATES.finished, undefined, undefined, undefined, undefined, undefined, false)),
    dispatch(getDeploymentsByStatus(DEPLOYMENT_STATES.inprogress)),
    dispatch(getDevicesByStatus(DEVICE_STATES.accepted)),
    dispatch(getDevicesByStatus(DEVICE_STATES.pending)),
    dispatch(getDevicesByStatus(DEVICE_STATES.preauth)),
    dispatch(getDevicesByStatus(DEVICE_STATES.rejected)),
    dispatch(getDynamicGroups()),
    dispatch(getGroups()),
    dispatch(getReleases()),
    dispatch(getDeviceLimit()),
    dispatch(getRoles())
  ];
  const multitenancy = getState().app.features.hasMultitenancy || getState().app.features.isEnterprise || getState().app.features.isHosted;
  if (multitenancy) {
    tasks.push(dispatch(getUserOrganization()));
  }
  return Promise.all(tasks).then(() => {
    const state = getState();
    if (state.users.showHelptips && state.onboarding.showTips && !state.onboarding.complete) {
      const welcomeTip = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, {
        progress: state.onboarding.progress,
        complete: state.onboarding.complete,
        showHelptips: state.users.showHelptips,
        showTips: state.onboarding.showTips
      });
      if (welcomeTip) {
        dispatch(setSnackbar('open', 10000, '', welcomeTip, () => {}, true));
      }
    }
    const hasTrackingEnabled = getUserSettings(state).trackingConsentGiven;
    if (cookies.get('_ga') && typeof hasTrackingEnabled === 'undefined') {
      return Promise.resolve(dispatch(saveUserSettings({ trackingConsentGiven: true })));
    }
    return Promise.resolve();
  });
};

/*
  General
*/
export const setSnackbar = (message, autoHideDuration, action, children, onClick, onClose) => dispatch =>
  dispatch({
    type: AppConstants.SET_SNACKBAR,
    snackbar: {
      open: message ? true : false,
      message,
      maxWidth: '900px',
      autoHideDuration,
      action,
      children,
      onClick,
      onClose
    }
  });

export const setFirstLoginAfterSignup = firstLoginAfterSignup => dispatch =>
  dispatch({
    type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
    firstLoginAfterSignup: firstLoginAfterSignup
  });
