import Cookies from 'universal-cookie';

import OnboardingConstants from '../constants/onboardingConstants';
import { DEVICE_STATES } from '../constants/deviceConstants';
import { onboardingSteps } from '../utils/onboardingmanager';
import { getDemoDeviceAddress } from '../helpers';
import { getUserSettings } from '../selectors';
import Tracking from '../tracking';
import { saveUserSettings } from './userActions';

const cookies = new Cookies();

const getCurrentOnboardingState = state => {
  const { showTipsDialog, showCreateArtifactDialog, ...onboardingState } = state.onboarding; // eslint-disable-line no-unused-vars
  const { onboarding = {} } = getUserSettings(state);
  return { ...onboardingState, ...onboarding };
};

export const getOnboardingState = () => (dispatch, getState) => {
  const store = getState();
  let onboardingState = getCurrentOnboardingState(store);
  if (!onboardingState.complete) {
    const userId = getState().users.currentUser;
    const userCookie = cookies.get(`${userId}-onboarded`);
    const acceptedDevices = store.devices.byStatus[DEVICE_STATES.accepted].deviceIds;
    const pendingDevices = store.devices.byStatus[DEVICE_STATES.pending].deviceIds;
    const releases = Object.values(store.releases.byId);
    const pastDeployments = store.deployments.byStatus.finished.deploymentIds;
    const deviceType =
      acceptedDevices.length && store.devices.byId[acceptedDevices[0]].hasOwnProperty('attributes')
        ? store.devices.byId[acceptedDevices[0]].attributes.device_type
        : null;
    const progress = onboardingState.progress || determineProgress(acceptedDevices, pendingDevices, releases, pastDeployments);
    const state = {
      complete: !!(
        Boolean(userCookie) ||
        store.onboarding.complete ||
        (acceptedDevices.length > 1 && pendingDevices.length > 0 && releases.length > 1 && pastDeployments.length > 1) ||
        (acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2) ||
        (acceptedDevices.length >= 1 && pendingDevices.length > 0 && releases.length >= 2 && pastDeployments.length >= 2) ||
        Object.keys(onboardingSteps).findIndex(step => step === progress) >= Object.keys(onboardingSteps).length - 1 ||
        store.onboarding.disable
      ),
      showTips: onboardingState.showTips != null ? onboardingState.showTips : true,
      deviceType: onboardingState.deviceType || store.onboarding.deviceType || deviceType,
      approach: onboardingState.approach || (deviceType || '').startsWith('qemu') ? 'virtual' : 'physical' || store.onboarding.approach,
      artifactIncluded: onboardingState.artifactIncluded || store.onboarding.artifactIncluded,
      progress
    };
    onboardingState = state;
  }
  onboardingState.address = getDemoDeviceAddress(Object.values(store.devices.byId), onboardingState.approach, store.onboarding.demoArtifactPort);
  const progress = Object.keys(onboardingSteps).findIndex(step => step === 'deployments-past-completed');
  const currentProgress = Object.keys(onboardingSteps).findIndex(step => step === onboardingState.progress);
  onboardingState.showArtifactCreation = Math.abs(currentProgress - progress) <= 1;
  if (onboardingState.showArtifactCreation) {
    // although it would be more appropriate to do this in the app component, this happens here because in the app component we would need to track
    // redirects, if we want to still allow navigation across the UI while the dialog is visible
    dispatch(setShowCreateArtifactDialog(onboardingSteps.showArtifactCreation));
    window.location.replace('#/releases');
  }
  return Promise.resolve(dispatch(setOnboardingState(onboardingState)));
};

export const setShowOnboardingHelp = show => dispatch => dispatch({ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show });

export const setOnboardingProgress = value => dispatch => dispatch({ type: OnboardingConstants.SET_ONBOARDING_PROGRESS, value });

export const setOnboardingDeviceType = value => dispatch => dispatch({ type: OnboardingConstants.SET_ONBOARDING_DEVICE_TYPE, value });

export const setOnboardingApproach = value => dispatch => dispatch({ type: OnboardingConstants.SET_ONBOARDING_APPROACH, value });

export const setOnboardingArtifactIncluded = value => dispatch => dispatch({ type: OnboardingConstants.SET_ONBOARDING_ARTIFACT_INCLUDED, value });

export const setShowCreateArtifactDialog = show => dispatch => dispatch({ type: OnboardingConstants.SET_SHOW_CREATE_ARTIFACT, show });

export const setShowDismissOnboardingTipsDialog = show => dispatch => dispatch({ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP_DIALOG, show });

export const setOnboardingComplete = val => dispatch => {
  if (val) {
    advanceOnboarding('onboarding-finished');
  }
  return Promise.all([
    dispatch({ type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: val }),
    dispatch({ type: OnboardingConstants.SET_SHOW_ONBOARDING_HELP, show: !val })
  ]);
};

export const setOnboardingCanceled = () => dispatch =>
  Promise.all([
    dispatch(setShowOnboardingHelp(false)),
    dispatch(setShowDismissOnboardingTipsDialog(false)),
    dispatch({ type: OnboardingConstants.SET_ONBOARDING_COMPLETE, complete: true })
  ]).then(() => Promise.resolve(advanceOnboarding('onboarding-canceled')));

const setOnboardingState = state => dispatch =>
  Promise.all([
    dispatch(setOnboardingComplete(state.complete)),
    dispatch(setOnboardingDeviceType(state.deviceType)),
    dispatch(setOnboardingApproach(state.approach)),
    dispatch(setOnboardingArtifactIncluded(state.artifactIncluded)),
    dispatch(setShowOnboardingHelp(state.showTips)),
    dispatch(setOnboardingProgress(state.progress)),
    dispatch(setShowCreateArtifactDialog(state.showArtifactCreation)),
    dispatch(saveUserSettings({ onboarding: state }))
  ]);

export const advanceOnboarding = stepId => (dispatch, getState) => {
  const steps = Object.keys(onboardingSteps);
  const progress = steps.findIndex(step => step === getState().onboarding.progress);
  const stepIndex = steps.findIndex(step => step === stepId);
  if (progress > stepIndex) {
    return;
  }
  const madeProgress = steps[stepIndex + 1];
  dispatch(setOnboardingProgress(madeProgress));
  const state = { ...getCurrentOnboardingState(getState()), progress: madeProgress };
  state.complete = stepIndex + 1 >= Object.keys(onboardingSteps).length - 1 ? true : state.complete;
  dispatch(saveUserSettings({ onboarding: state }));
  Tracking.event({ category: 'onboarding', action: stepId });
};

const determineProgress = (acceptedDevices, pendingDevices, releases, pastDeployments) => {
  const steps = Object.keys(onboardingSteps);
  let progress = -1;
  progress = pendingDevices.length > 1 ? steps.findIndex(step => step === 'devices-pending-accepting-onboarding') : progress;
  progress = acceptedDevices.length >= 1 ? steps.findIndex(step => step === 'application-update-reminder-tip') : progress;
  progress = acceptedDevices.length > 1 && releases.length > 1 ? steps.findIndex(step => step === 'application-update-reminder-tip') : progress;
  progress =
    acceptedDevices.length > 1 && releases.length > 1 && pastDeployments.length > 1 ? steps.findIndex(step => step === 'deployments-past-completed') : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 1
      ? steps.findIndex(step => step === 'artifact-modified-onboarding')
      : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2 ? steps.findIndex(step => step === 'onboarding-finished') : progress;
  return steps[progress];
};
