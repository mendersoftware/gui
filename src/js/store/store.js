// Copyright 2019 Northern.tech AS
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
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { defaultState } from '../../../tests/mockData';
import { extractErrorMessage, preformatWithRequestID } from '../helpers';
import appSlice, { actions as appActions, constants as appConstants, selectors as appSelectors } from './appSlice';
import { getToken } from './auth';
import * as commonConstants from './commonConstants';
import * as commonSelectors from './commonSelectors';
import deploymentSlice, { actions as deploymentActions, constants as deploymentConstants, selectors as deploymentSelectors } from './deploymentsSlice';
import deviceSlice, { actions as deviceActions, constants as deviceConstants, selectors as deviceSelectors } from './devicesSlice';
import monitorSlice, { actions as monitorActions, constants as monitorConstants, selectors as monitorSelectors } from './monitorSlice';
import onboardingSlice, { actions as onboardingActions, constants as onboardingConstants, selectors as onboardingSelectors } from './onboardingSlice';
import organizationSlice, { actions as organizationActions, constants as organizationConstants, selectors as organizationSelectors } from './organizationSlice';
import releaseSlice, { actions as releaseActions, constants as releaseConstants, selectors as releaseSelectors } from './releasesSlice';
import userSlice, { actions as userActions, constants as userConstants, selectors as userSelectors } from './usersSlice';

const { settingsKeys, USER_LOGOUT } = userConstants;

// exclude 'pendings-redirect' since this is expected to persist refreshes - the rest should be better to be redone
const keys = ['sessionDeploymentChecker', settingsKeys.initialized];
const resetEnvironment = () => {
  keys.map(key => window.sessionStorage.removeItem(key));
};

resetEnvironment();

export const actions = {
  ...appActions,
  ...deploymentActions,
  ...deviceActions,
  ...monitorActions,
  ...onboardingActions,
  ...organizationActions,
  ...releaseActions,
  ...userActions
};

export const selectors = {
  ...appSelectors,
  ...commonSelectors,
  ...deploymentSelectors,
  ...deviceSelectors,
  ...monitorSelectors,
  ...onboardingSelectors,
  ...organizationSelectors,
  ...releaseSelectors,
  ...userSelectors
};

export const constants = {
  ...appConstants,
  ...commonConstants,
  ...deploymentConstants,
  ...deviceConstants,
  ...monitorConstants,
  ...onboardingConstants,
  ...organizationConstants,
  ...releaseConstants,
  ...userConstants
};

export const commonErrorFallback = 'Please check your connection.';
export const commonErrorHandler = (err, errorContext, dispatch, fallback, mightBeAuthRelated = false) => {
  const errMsg = extractErrorMessage(err, fallback);
  if (mightBeAuthRelated || getToken()) {
    dispatch(appActions.setSnackbar({ message: preformatWithRequestID(err.response, `${errorContext} ${errMsg}`), action: 'Copy to clipboard' }));
  }
  return Promise.reject(err);
};

const rootReducer = combineReducers({
  app: appSlice,
  devices: deviceSlice,
  deployments: deploymentSlice,
  monitor: monitorSlice,
  onboarding: onboardingSlice,
  organization: organizationSlice,
  releases: releaseSlice,
  users: userSlice
});

export const sessionReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = undefined;
  }
  return rootReducer(state, action);
};

export const getConfiguredStore = (options = {}) => {
  const { preloadedState = { ...defaultState }, ...config } = options;
  return configureStore({
    ...config,
    preloadedState,
    reducer: sessionReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: {
          ignoredPaths: ['app.uploadsById']
        },
        serializableCheck: {
          ignoredActions: [organizationActions.receiveExternalDeviceIntegrations.name, appActions.setSnackbar.name, appActions.uploadProgress.name],
          ignoredActionPaths: ['uploads', 'snackbar'],
          ignoredPaths: ['app.uploadsById', 'app.snackbar', 'organization.externalDeviceIntegrations']
        }
      })
  });
};

export default getConfiguredStore({ preloadedState: {} });
