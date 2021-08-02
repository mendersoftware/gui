import Cookies from 'universal-cookie';

import { getToken } from '../auth';
import AppConstants from '../constants/appConstants';
import { DEVICE_STATES } from '../constants/deviceConstants';
import { DEPLOYMENT_STATES } from '../constants/deploymentConstants';
import { SET_SHOW_HELP } from '../constants/userConstants';
import { onboardingSteps } from '../constants/onboardingConstants';
import { extractErrorMessage, preformatWithRequestID } from '../helpers';
import { getCurrentUser, getUserSettings } from '../selectors';
import { getOnboardingComponentFor } from '../utils/onboardingmanager';
import { getDeviceAttributes, getDeviceById, getDevicesByStatus, getDeviceLimit, getDynamicGroups, getGroups } from './deviceActions';
import { getDeploymentsByStatus } from './deploymentActions';
import { getReleases } from './releaseActions';
import { saveUserSettings, getGlobalSettings, getRoles, saveGlobalSettings } from './userActions';
import { getUserOrganization } from './organizationActions';

const cookies = new Cookies();

export const commonErrorFallback = 'Please check your connection.';
export const commonErrorHandler = (err, errorContext, dispatch, fallback, mightBeAuthRelated = false) => {
  const errMsg = extractErrorMessage(err, fallback);
  if (mightBeAuthRelated || getToken()) {
    dispatch(setSnackbar(preformatWithRequestID(err.response, `${errorContext} ${errMsg}`), null, 'Copy to clipboard'));
  }
  return Promise.reject(err);
};

export const initializeAppData = () => (dispatch, getState) => {
  let tasks = [
    dispatch(getGlobalSettings()),
    dispatch(getDeviceAttributes()),
    dispatch(getDeploymentsByStatus(DEPLOYMENT_STATES.finished, undefined, undefined, undefined, undefined, undefined, undefined, false)),
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
    const user = getCurrentUser(state);
    const userCookie = cookies.get(user.id);
    let { showHelptips = state.users.showHelptips, trackingConsentGiven: hasTrackingEnabled } = getUserSettings(state);
    // checks if user id is set and if cookie for helptips exists for that user
    if (userCookie && userCookie.help !== 'undefined') {
      const { help, ...crumbles } = userCookie;
      // got user cookie with pre-existing value
      showHelptips = help;
      // store only remaining cookie values, to allow relying on stored settings from now on
      if (!Object.keys(crumbles).length) {
        cookies.remove(user.id);
      } else {
        cookies.set(user.id, crumbles);
      }
    }
    if (showHelptips && state.onboarding.showTips && !state.onboarding.complete) {
      const welcomeTip = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, {
        progress: state.onboarding.progress,
        complete: state.onboarding.complete,
        showHelptips,
        showTips: state.onboarding.showTips
      });
      if (welcomeTip) {
        dispatch(setSnackbar('open', 10000, '', welcomeTip, () => {}, true));
      }
      // try to retrieve full device details for onboarding devices to ensure ips etc. are available
      // we only load the first few/ 20 devices, as it is possible the onboarding is left dangling
      // and a lot of devices are present and we don't want to flood the backend for this
      state.devices.byStatus[DEVICE_STATES.accepted].deviceIds.map(id => dispatch(getDeviceById(id)));
    }
    dispatch({ type: SET_SHOW_HELP, show: showHelptips });
    let settings = { showHelptips };
    if (cookies.get('_ga') && typeof hasTrackingEnabled === 'undefined') {
      settings.trackingConsentGiven = true;
    }
    dispatch(saveUserSettings(settings));
    // the following is used as a migration and initialization of the stored identity attribute
    // changing the default device attribute to the first non-deviceId attribute, unless a stored
    // id attribute setting exists
    const identityOptions = state.devices.filteringAttributes.identityAttributes.filter(attribute => !['id', 'Device ID', 'status'].includes(attribute));
    const { id_attribute } = state.users.globalSettings;
    if (!id_attribute && identityOptions.length) {
      dispatch(saveGlobalSettings({ id_attribute: { attribute: identityOptions[0], scope: 'identity' } }));
    } else if (typeof id_attribute === 'string') {
      let attribute = id_attribute;
      if (attribute === 'Device ID') {
        attribute = 'id';
      }
      dispatch(saveGlobalSettings({ id_attribute: { attribute, scope: 'identity' } }));
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

export const progress = (e, dispatch) => {
  const uploadProgress = (e.loaded / e.total) * 100;
  return dispatch({
    type: AppConstants.UPLOAD_PROGRESS,
    inprogress: uploadProgress !== 100,
    uploadProgress: uploadProgress < 50 ? Math.ceil(uploadProgress) : Math.round(uploadProgress)
  });
};

export const cancelFileUpload = () => (dispatch, getState) => {
  const cancelSource = getState().app.cancelSource;
  cancelSource.cancel();
  return Promise.resolve(dispatch({ type: AppConstants.UPLOAD_PROGRESS, inprogress: false, uploadProgress: 0 }));
};
