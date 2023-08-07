// Copyright 2023 Northern.tech AS
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
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { extractErrorMessage, getComparisonCompatibleVersion, stringToBoolean } from '../helpers';
import { getIsEnterprise } from '../selectors';

const featureFlags = [
  'hasAddons',
  'hasAuditlogs',
  'hasMultitenancy',
  'hasDeltaProgress',
  'hasDeviceConfig',
  'hasDeviceConnect',
  'hasReleaseTags',
  'hasReporting',
  'hasMonitor',
  'isEnterprise'
];

export const parseEnvironmentInfo = () => (dispatch, getState) => {
  const state = getState();
  let onboardingComplete = state.onboarding.complete || !!JSON.parse(window.localStorage.getItem('onboardingComplete') ?? 'false');
  let demoArtifactPort = 85;
  let environmentData = {};
  let environmentFeatures = {};
  let versionInfo = {};
  if (mender_environment) {
    const {
      features = {},
      demoArtifactPort: port,
      disableOnboarding,
      hostAddress,
      hostedAnnouncement,
      integrationVersion,
      isDemoMode,
      menderVersion,
      menderArtifactVersion,
      metaMenderVersion,
      recaptchaSiteKey,
      services = {},
      stripeAPIKey,
      trackerCode
    } = mender_environment;
    onboardingComplete = stringToBoolean(features.isEnterprise) || stringToBoolean(disableOnboarding) || onboardingComplete;
    demoArtifactPort = port || demoArtifactPort;
    environmentData = {
      hostedAnnouncement: hostedAnnouncement || state.app.hostedAnnouncement,
      hostAddress: hostAddress || state.app.hostAddress,
      recaptchaSiteKey: recaptchaSiteKey || state.app.recaptchaSiteKey,
      stripeAPIKey: stripeAPIKey || state.app.stripeAPIKey,
      trackerCode: trackerCode || state.app.trackerCode
    };
    environmentFeatures = {
      ...featureFlags.reduce((accu, flag) => ({ ...accu, [flag]: stringToBoolean(features[flag]) }), {}),
      isHosted: window.location.hostname.includes('hosted.mender.io'),
      isDemoMode: stringToBoolean(isDemoMode || features.isDemoMode)
    };
    versionInfo = {
      docs: isNaN(integrationVersion.charAt(0)) ? '' : integrationVersion.split('.').slice(0, 2).join('.'),
      remainder: {
        Integration: getComparisonCompatibleVersion(integrationVersion),
        'Mender-Client': getComparisonCompatibleVersion(menderVersion),
        'Mender-Artifact': menderArtifactVersion,
        'Meta-Mender': metaMenderVersion,
        Deployments: services.deploymentsVersion,
        Deviceauth: services.deviceauthVersion,
        Inventory: services.inventoryVersion,
        GUI: services.guiVersion
      }
    };
  }
  return Promise.all([
    dispatch(setOnboardingComplete(onboardingComplete)),
    dispatch(setDemoArtifactPort(demoArtifactPort)),
    dispatch(actions.setFeatures(environmentFeatures)),
    dispatch(actions.setVersionInformation({ docsVersion: versionInfo.docs, value: versionInfo.remainder })),
    dispatch(actions.setEnvironmentData(environmentData)),
    dispatch(getLatestReleaseInfo())
  ]);
};

const maybeAddOnboardingTasks = ({ devicesByStatus, dispatch, showHelptips, onboardingState, tasks }) => {
  if (!(showHelptips && onboardingState.showTips) || onboardingState.complete) {
    return tasks;
  }
  const welcomeTip = getOnboardingComponentFor(onboardingSteps.ONBOARDING_START, {
    progress: onboardingState.progress,
    complete: onboardingState.complete,
    showHelptips,
    showTips: onboardingState.showTips
  });
  if (welcomeTip) {
    tasks.push(
      dispatch(actions.setSnackbar({ message: 'open', autoHideDuration: TIMEOUTS.refreshDefault, children: welcomeTip, onClick: () => {}, onClose: true }))
    );
  }
  // try to retrieve full device details for onboarding devices to ensure ips etc. are available
  // we only load the first few/ 20 devices, as it is possible the onboarding is left dangling
  // and a lot of devices are present and we don't want to flood the backend for this
  return devicesByStatus[DEVICE_STATES.accepted].deviceIds.reduce((accu, id) => {
    accu.push(dispatch(getDeviceById(id)));
    return accu;
  }, tasks);
};

const processUserCookie = (user, showHelptips) => {
  const userCookie = cookies.get(user.id);
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
  return showHelptips;
};

export const useAppInit = () => {
  const dispatch = useDispatch();
  const isEnterprise = useSelector(getIsEnterprise);
  const { hasMultitenancy, isHosted } = useSelector(getFeatures);
  const user = useSelector(getCurrentUser);
  let { columnSelection = [], showHelptips, trackingConsentGiven: hasTrackingEnabled } = useSelector(getUserSettingsSelector);

  const retrieveAppData = () => {
    let tasks = [
      dispatch(parseEnvironmentInfo()),
      dispatch(getUserSettings()),
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
      dispatch(getIntegrations()),
      dispatch(getReleases()),
      dispatch(getDeviceLimit()),
      dispatch(getRoles()),
      dispatch(setFirstLoginAfterSignup(cookies.get('firstLoginAfterSignup')))
    ];
    const multitenancy = hasMultitenancy || isHosted || isEnterprise;
    if (multitenancy) {
      tasks.push(dispatch(getUserOrganization()));
    }
    return Promise.all(tasks);
  };

  const interpretAppData = () => {
    let tasks = [];
    tasks.push(dispatch(setDeviceListState({ selectedAttributes: columnSelection.map(column => ({ attribute: column.key, scope: column.scope })) })));
    // checks if user id is set and if cookie for helptips exists for that user
    showHelptips = processUserCookie(user, showHelptips);
    tasks = maybeAddOnboardingTasks({ devicesByStatus: state.devices.byStatus, dispatch, tasks, onboardingState: state.onboarding, showHelptips });
    tasks.push(Promise.resolve(dispatch({ type: SET_SHOW_HELP, show: showHelptips })));
    let settings = { showHelptips };
    if (cookies.get('_ga') && typeof hasTrackingEnabled === 'undefined') {
      settings.trackingConsentGiven = true;
    }
    tasks.push(dispatch(saveUserSettings(settings)));
    // the following is used as a migration and initialization of the stored identity attribute
    // changing the default device attribute to the first non-deviceId attribute, unless a stored
    // id attribute setting exists
    const identityOptions = state.devices.filteringAttributes.identityAttributes.filter(attribute => !['id', 'Device ID', 'status'].includes(attribute));
    const { id_attribute } = state.users.globalSettings;
    if (!id_attribute && identityOptions.length) {
      tasks.push(dispatch(saveGlobalSettings({ id_attribute: { attribute: identityOptions[0], scope: 'identity' } })));
    } else if (typeof id_attribute === 'string') {
      let attribute = id_attribute;
      if (attribute === 'Device ID') {
        attribute = 'id';
      }
      tasks.push(dispatch(saveGlobalSettings({ id_attribute: { attribute, scope: 'identity' } })));
    }
    return Promise.all(tasks);
  };

  const initializeAppData = () =>
    dispatch(retrieveAppData())
      .then(() => dispatch(interpretAppData()))
      // this is allowed to fail if no user information are available
      .catch(err => console.log(extractErrorMessage(err)))
      .then(() => dispatch(getOnboardingState()));

  return initializeAppData();
};
