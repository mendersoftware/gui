import Cookies from 'universal-cookie';
import AppConstants from '../constants/appConstants';
import { DEVICE_STATES } from '../constants/deviceConstants';
import { getDevicesByStatus } from './deviceActions';
import { getReleases } from './releaseActions';
import { getDeploymentsByStatus } from './deploymentActions';
import { getGlobalSettings, setOnboardingState } from './userActions';
import { getStoredOnboardingState } from '../selectors';
import { getCurrentOnboardingState, determineProgress, persistOnboardingState, onboardingSteps } from '../utils/onboardingmanager';

const cookies = new Cookies();

export const sortTable = (table, column, direction) => dispatch =>
  dispatch({
    type: AppConstants.SORT_TABLE,
    table: table,
    column: column,
    direction: direction
  });

/*
  General
*/
export const setSnackbar = (message, duration, action, component, onClick, onClose) => dispatch =>
  dispatch({
    type: AppConstants.SET_SNACKBAR,
    snackbar: {
      open: message ? true : false,
      message: message,
      maxWidth: '900px',
      autoHideDuration: duration,
      action: action,
      children: component,
      onClick: onClick,
      onClose: onClose
    }
  });

export const getOnboardingState = () => (dispatch, getState) => {
  let promises = Promise.resolve(getCurrentOnboardingState());
  const userId = getState().users.currentUser;
  const onboardingKey = `${userId}-onboarding`;
  let savedState = JSON.parse(window.localStorage.getItem(onboardingKey)) || {};
  if (!Object.keys(savedState).length || !savedState.complete) {
    const requests = [
      dispatch(getGlobalSettings()),
      dispatch(getDevicesByStatus(DEVICE_STATES.accepted)),
      dispatch(getDevicesByStatus(DEVICE_STATES.pending)),
      dispatch(getDevicesByStatus(DEVICE_STATES.preauth)),
      dispatch(getDevicesByStatus(DEVICE_STATES.rejected)),
      dispatch(getReleases()),
      dispatch(getDeploymentsByStatus('finished', undefined, undefined, undefined, undefined, undefined, false))
    ];
    promises = Promise.all(requests).then(() => {
      const userCookie = cookies.get(`${userId}-onboarded`);
      const store = getState();
      const acceptedDevices = store.devices.byStatus[DEVICE_STATES.accepted].deviceIds;
      const pendingDevices = store.devices.byStatus[DEVICE_STATES.pending].deviceIds;
      const devices = Object.values(store.devices.byId);
      const releases = Object.values(store.releases.byId);
      const pastDeployments = store.deployments.byStatus.finished.deploymentIds;
      const deviceType =
        acceptedDevices.length && store.devices.byId[acceptedDevices[0]].hasOwnProperty('attributes')
          ? store.devices.byId[acceptedDevices[0]].attributes.device_type
          : null;
      const onboarding = getStoredOnboardingState(store.getState());
      savedState = { ...savedState, ...onboarding };
      const progress = savedState.progress || determineProgress(acceptedDevices, pendingDevices, releases, pastDeployments);
      const state = {
        complete: !!(
          savedState.complete ||
          Boolean(userCookie) ||
          store.users.onboarding.complete ||
          (acceptedDevices.length > 1 && pendingDevices.length > 0 && releases.length > 1 && pastDeployments.length > 1) ||
          (acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2) ||
          (acceptedDevices.length >= 1 && pendingDevices.length > 0 && releases.length >= 2 && pastDeployments.length >= 2) ||
          progress >= Object.keys(onboardingSteps).length - 1 ||
          store.users.onboarding.disable
        ),
        showTips: savedState.showTips != null ? savedState.showTips : true,
        deviceType: savedState.deviceType || store.users.onboarding.deviceType || deviceType,
        approach: savedState.approach || (deviceType || '').startsWith('qemu') ? 'virtual' : 'physical' || store.users.onboarding.approach,
        artifactIncluded: savedState.artifactIncluded || store.users.onboarding.artifactIncluded,
        progress
      };
      persistOnboardingState(state);
      state.devices = devices;
      return Promise.resolve(state);
    });
  } else {
    promises = Promise.resolve(savedState);
  }

  return promises
    .then(state => {
      const progress = Object.keys(onboardingSteps).findIndex(step => step === 'deployments-past-completed');
      state.showArtifactCreation = Math.abs(state.progress - progress) <= 1;
      if (state.showArtifactCreation) {
        // although it would be more appropriate to do this in the app component, this happens here because in the app component we would need to track
        // redirects, if we want to still allow navigation across the UI while the dialog is visible
        window.location.replace('#/releases');
      }
      return dispatch(setOnboardingState(state));
    })
    .catch(e => console.log(e));
};

export const setFirstLoginAfterSignup = firstLoginAfterSignup => dispatch =>
  dispatch({
    type: AppConstants.SET_FIRST_LOGIN_AFTER_SIGNUP,
    firstLoginAfterSignup: firstLoginAfterSignup
  });
