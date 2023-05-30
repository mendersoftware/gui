// Copyright 2020 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import Cookies from 'universal-cookie';

import { DEVICE_STATES } from '../constants/deviceConstants';
import {
  SET_DEMO_ARTIFACT_PORT,
  SET_ONBOARDING_APPROACH,
  SET_ONBOARDING_ARTIFACT_INCLUDED,
  SET_ONBOARDING_COMPLETE,
  SET_ONBOARDING_DEVICE_TYPE,
  SET_ONBOARDING_PROGRESS,
  SET_SHOW_CREATE_ARTIFACT,
  SET_SHOW_ONBOARDING_HELP,
  SET_SHOW_ONBOARDING_HELP_DIALOG,
  onboardingSteps as onboardingStepNames
} from '../constants/onboardingConstants';
import { SET_SHOW_HELP } from '../constants/userConstants';
import { getDemoDeviceAddress } from '../helpers';
import { getUserCapabilities, getUserSettings } from '../selectors';
import Tracking from '../tracking';
import { applyOnboardingFallbacks, onboardingSteps } from '../utils/onboardingmanager';
import { saveUserSettings } from './userActions';

const cookies = new Cookies();

const getCurrentOnboardingState = state => {
  const { showTipsDialog, showCreateArtifactDialog, ...onboardingState } = state.onboarding; // eslint-disable-line no-unused-vars
  const { onboarding = {} } = getUserSettings(state);
  return { ...onboardingState, ...onboarding };
};

const deductOnboardingState = ({ devicesById, devicesByStatus, onboardingState, pastDeployments, releases, userCapabilities, userId }) => {
  const { canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases } = userCapabilities;
  const userCookie = cookies.get(`${userId}-onboarded`);
  const acceptedDevices = devicesByStatus[DEVICE_STATES.accepted].deviceIds;
  const pendingDevices = devicesByStatus[DEVICE_STATES.pending].deviceIds;
  let deviceType = onboardingState.deviceType ?? [];
  deviceType =
    !deviceType.length && acceptedDevices.length && devicesById[acceptedDevices[0]].hasOwnProperty('attributes')
      ? devicesById[acceptedDevices[0]].attributes.device_type
      : deviceType;
  const progress = applyOnboardingFallbacks(onboardingState.progress || determineProgress(acceptedDevices, pendingDevices, releases, pastDeployments));
  return {
    complete: !!(
      Boolean(userCookie) ||
      onboardingState.complete ||
      (acceptedDevices.length > 1 && pendingDevices.length > 0 && releases.length > 1 && pastDeployments.length > 1) ||
      (acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2) ||
      (acceptedDevices.length >= 1 && pendingDevices.length > 0 && releases.length >= 2 && pastDeployments.length >= 2) ||
      Object.keys(onboardingSteps).findIndex(step => step === progress) >= Object.keys(onboardingSteps).length - 1 ||
      onboardingState.disable ||
      ![canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases].every(i => i)
    ),
    showTips: onboardingState.showTips != null ? onboardingState.showTips : true,
    deviceType,
    approach: onboardingState.approach || (deviceType.some(type => type.startsWith('qemu')) ? 'virtual' : 'physical'),
    artifactIncluded: onboardingState.artifactIncluded,
    progress
  };
};

export const getOnboardingState = () => (dispatch, getState) => {
  const store = getState();
  let onboardingState = getCurrentOnboardingState(store);
  if (!onboardingState.complete) {
    const userId = getState().users.currentUser;
    onboardingState = deductOnboardingState({
      devicesById: store.devices.byId,
      devicesByStatus: store.devices.byStatus,
      onboardingState,
      pastDeployments: store.deployments.byStatus.finished.deploymentIds,
      releases: Object.values(store.releases.byId),
      userCapabilities: getUserCapabilities(store),
      userId
    });
  }
  onboardingState.progress = onboardingState.progress || onboardingStepNames.ONBOARDING_START;
  const demoDeviceAddress = `http://${getDemoDeviceAddress(Object.values(store.devices.byId), onboardingState.approach)}`;
  onboardingState.address = store.onboarding.demoArtifactPort ? `${demoDeviceAddress}:${store.onboarding.demoArtifactPort}` : demoDeviceAddress;
  const progress = Object.keys(onboardingSteps).findIndex(step => step === onboardingStepNames.ARTIFACT_CREATION_DIALOG);
  const currentProgress = Object.keys(onboardingSteps).findIndex(step => step === onboardingState.progress);
  onboardingState.showArtifactCreation = Math.abs(currentProgress - progress) <= 1;
  if (onboardingState.showArtifactCreation && !onboardingState.complete && onboardingState.showTips && store.users.showHelptips) {
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

export const setDemoArtifactPort = port => dispatch => dispatch({ type: SET_DEMO_ARTIFACT_PORT, value: port });

export const setOnboardingComplete = val => dispatch => {
  let tasks = [Promise.resolve(dispatch({ type: SET_ONBOARDING_COMPLETE, complete: val }))];
  if (val) {
    tasks.push(Promise.resolve(dispatch({ type: SET_SHOW_ONBOARDING_HELP, show: false })));
    tasks.push(Promise.resolve(dispatch(advanceOnboarding(onboardingStepNames.ONBOARDING_FINISHED))));
  }
  return Promise.all(tasks);
};

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
