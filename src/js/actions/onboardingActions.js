import Cookies from 'universal-cookie';

import { DEVICE_STATES } from '../constants/deviceConstants';
import {
  onboardingSteps as onboardingStepNames,
  SET_ONBOARDING_PROGRESS,
  SET_SHOW_ONBOARDING_HELP,
  SET_ONBOARDING_DEVICE_TYPE,
  SET_ONBOARDING_APPROACH,
  SET_ONBOARDING_ARTIFACT_INCLUDED,
  SET_SHOW_CREATE_ARTIFACT,
  SET_SHOW_ONBOARDING_HELP_DIALOG,
  SET_ONBOARDING_COMPLETE
} from '../constants/onboardingConstants';
import { SET_SHOW_HELP } from '../constants/userConstants';

import { applyOnboardingFallbacks, onboardingSteps } from '../utils/onboardingmanager';
import { getDemoDeviceAddress } from '../helpers';
import { getUserCapabilities, getUserSettings } from '../selectors';
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
  const { canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases } = getUserCapabilities(store);
  if (!onboardingState.complete) {
    const userId = getState().users.currentUser;
    const userCookie = cookies.get(`${userId}-onboarded`);
    const acceptedDevices = store.devices.byStatus[DEVICE_STATES.accepted].deviceIds;
    const pendingDevices = store.devices.byStatus[DEVICE_STATES.pending].deviceIds;
    const releases = Object.values(store.releases.byId);
    const pastDeployments = store.deployments.byStatus.finished.deploymentIds;
    let deviceType = onboardingState.deviceType ?? [];
    deviceType =
      !deviceType.length && acceptedDevices.length && store.devices.byId[acceptedDevices[0]].hasOwnProperty('attributes')
        ? store.devices.byId[acceptedDevices[0]].attributes.device_type
        : deviceType;
    const progress = applyOnboardingFallbacks(onboardingState.progress || determineProgress(acceptedDevices, pendingDevices, releases, pastDeployments));
    const state = {
      complete: !!(
        Boolean(userCookie) ||
        store.onboarding.complete ||
        (acceptedDevices.length > 1 && pendingDevices.length > 0 && releases.length > 1 && pastDeployments.length > 1) ||
        (acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2) ||
        (acceptedDevices.length >= 1 && pendingDevices.length > 0 && releases.length >= 2 && pastDeployments.length >= 2) ||
        Object.keys(onboardingSteps).findIndex(step => step === progress) >= Object.keys(onboardingSteps).length - 1 ||
        store.onboarding.disable ||
        ![canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases].every(i => i)
      ),
      showTips: onboardingState.showTips != null ? onboardingState.showTips : true,
      deviceType,
      approach: onboardingState.approach || (deviceType.some(type => type.startsWith('qemu')) ? 'virtual' : 'physical') || store.onboarding.approach,
      artifactIncluded: onboardingState.artifactIncluded || store.onboarding.artifactIncluded,
      progress
    };
    onboardingState = state;
  }
  onboardingState.progress = onboardingState.progress || onboardingSteps.ONBOARDING_START;
  onboardingState.address = getDemoDeviceAddress(Object.values(store.devices.byId), onboardingState.approach, store.onboarding.demoArtifactPort);
  const progress = Object.keys(onboardingSteps).findIndex(step => step === onboardingStepNames.ARTIFACT_CREATION_DIALOG);
  const currentProgress = Object.keys(onboardingSteps).findIndex(step => step === onboardingState.progress);
  onboardingState.showArtifactCreation = Math.abs(currentProgress - progress) <= 1;
  if (onboardingState.showArtifactCreation && !onboardingState.complete && onboardingState.showTips) {
    dispatch(setShowCreateArtifactDialog(true));
    onboardingState.progress = onboardingStepNames.ARTIFACT_CREATION_DIALOG;
    // although it would be more appropriate to do this in the app component, this happens here because in the app component we would need to track
    // redirects, if we want to still allow navigation across the UI while the dialog is visible
    if (!window.location.pathname.includes('/ui/releases')) {
      window.location.replace('/ui/releases');
    }
  }
  return Promise.resolve(dispatch(setOnboardingState(onboardingState)));
};

export const setShowOnboardingHelp =
  (show, update = true) =>
  (dispatch, getState) => {
    let tasks = [dispatch({ type: SET_SHOW_ONBOARDING_HELP, show })];
    if (update) {
      const { onboarding = {} } = getUserSettings(getState());
      tasks.push(dispatch(saveUserSettings({ onboarding: { ...onboarding, showTips: show }, showHelptips: show })));
      tasks.push(dispatch({ type: SET_SHOW_HELP, show }));
    }
    return Promise.all(tasks);
  };

const setOnboardingProgress = value => dispatch => dispatch({ type: SET_ONBOARDING_PROGRESS, value });

export const setOnboardingDeviceType =
  (value, update = true) =>
  (dispatch, getState) => {
    let tasks = [dispatch({ type: SET_ONBOARDING_DEVICE_TYPE, value })];
    if (update) {
      const { onboarding = {} } = getUserSettings(getState());
      tasks.push(dispatch(saveUserSettings({ onboarding: { ...onboarding, deviceType: value } })));
    }
    return Promise.all(tasks);
  };

export const setOnboardingApproach =
  (value, update = true) =>
  (dispatch, getState) => {
    let tasks = [dispatch({ type: SET_ONBOARDING_APPROACH, value })];
    if (update) {
      const { onboarding = {} } = getUserSettings(getState());
      tasks.push(dispatch(saveUserSettings({ onboarding: { ...onboarding, approach: value } })));
    }
    return Promise.all(tasks);
  };

const setOnboardingArtifactIncluded = value => dispatch => dispatch({ type: SET_ONBOARDING_ARTIFACT_INCLUDED, value });

export const setShowCreateArtifactDialog = show => dispatch => dispatch({ type: SET_SHOW_CREATE_ARTIFACT, show });

export const setShowDismissOnboardingTipsDialog = show => dispatch => dispatch({ type: SET_SHOW_ONBOARDING_HELP_DIALOG, show });

export const setOnboardingComplete = val => dispatch =>
  Promise.resolve(dispatch({ type: SET_ONBOARDING_COMPLETE, complete: val })).then(() => {
    if (val) {
      return Promise.all([
        Promise.resolve(dispatch({ type: SET_SHOW_ONBOARDING_HELP, show: false })),
        Promise.resolve(dispatch(advanceOnboarding(onboardingStepNames.ONBOARDING_FINISHED)))
      ]);
    }
    return Promise.resolve();
  });

export const setOnboardingCanceled = () => dispatch =>
  Promise.all([
    Promise.resolve(dispatch(setShowOnboardingHelp(false))),
    Promise.resolve(dispatch(setShowDismissOnboardingTipsDialog(false))),
    Promise.resolve(dispatch({ type: SET_ONBOARDING_COMPLETE, complete: true }))
  ])
    // using ONBOARDING_FINISHED_NOTIFICATION to ensure we get the intended onboarding state set after
    // _advancing_ the onboarding progress
    .then(() => dispatch(advanceOnboarding(onboardingStepNames.ONBOARDING_FINISHED_NOTIFICATION)))
    // since we can't advance after ONBOARDING_CANCELED, track the step manually here
    .then(() => Tracking.event({ category: 'onboarding', action: onboardingSteps.ONBOARDING_CANCELED }));

const setOnboardingState = state => dispatch =>
  Promise.all([
    dispatch(setOnboardingComplete(state.complete)),
    dispatch(setOnboardingDeviceType(state.deviceType, false)),
    dispatch(setOnboardingApproach(state.approach, false)),
    dispatch(setOnboardingArtifactIncluded(state.artifactIncluded)),
    dispatch(setShowOnboardingHelp(state.showTips, false)),
    dispatch(setOnboardingProgress(state.progress)),
    dispatch(setShowCreateArtifactDialog(state.showArtifactCreation && !state.complete && state.showTips)),
    dispatch(saveUserSettings({ onboarding: state }))
  ]);

export const advanceOnboarding = stepId => (dispatch, getState) => {
  const steps = Object.keys(onboardingSteps);
  const progress = steps.findIndex(step => step === getState().onboarding.progress);
  const stepIndex = steps.findIndex(step => step === stepId);
  // if there is no progress set yet, the onboarding state deduction hasn't happened
  // and the subsequent settings persistence would overwrite what we stored
  if (progress > stepIndex || getState().onboarding.progress === null) {
    return;
  }
  const madeProgress = steps[stepIndex + 1];
  const state = { ...getCurrentOnboardingState(getState()), progress: madeProgress };
  state.complete = stepIndex + 1 >= Object.keys(onboardingSteps).findIndex(step => step === onboardingStepNames.ONBOARDING_FINISHED) ? true : state.complete;
  Tracking.event({ category: 'onboarding', action: stepId });
  return Promise.all([dispatch(setOnboardingProgress(madeProgress)), dispatch(saveUserSettings({ onboarding: state }))]);
};

const determineProgress = (acceptedDevices, pendingDevices, releases, pastDeployments) => {
  const steps = Object.keys(onboardingSteps);
  let progress = -1;
  progress = pendingDevices.length > 1 ? steps.findIndex(step => step === onboardingStepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING) : progress;
  progress = acceptedDevices.length >= 1 ? steps.findIndex(step => step === onboardingStepNames.APPLICATION_UPDATE_REMINDER_TIP) : progress;
  progress =
    acceptedDevices.length > 1 && releases.length > 1 ? steps.findIndex(step => step === onboardingStepNames.APPLICATION_UPDATE_REMINDER_TIP) : progress;
  progress =
    acceptedDevices.length > 1 && releases.length > 1 && pastDeployments.length > 1
      ? steps.findIndex(step => step === onboardingStepNames.DEPLOYMENTS_PAST_COMPLETED)
      : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 1
      ? steps.findIndex(step => step === onboardingStepNames.ARTIFACT_MODIFIED_ONBOARDING)
      : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2
      ? steps.findIndex(step => step === onboardingStepNames.ONBOARDING_FINISHED)
      : progress;
  return steps[progress];
};
