import { combineReducers, configureStore } from '@reduxjs/toolkit';

import appReducer from './appReducer';
import deploymentReducer from './deploymentReducer';
import deviceReducer from './deviceReducer';
import monitorReducer from './monitorReducer';
import organizationReducer from './organizationReducer';
import onboardingReducer from './onboardingReducer';
import releaseReducer from './releaseReducer';
import userReducer from './userReducer';
import { USER_LOGOUT } from '../constants/userConstants';
import { SET_SNACKBAR, UPLOAD_PROGRESS } from '../constants/appConstants';

const rootReducer = combineReducers({
  app: appReducer,
  devices: deviceReducer,
  deployments: deploymentReducer,
  monitor: monitorReducer,
  onboarding: onboardingReducer,
  organization: organizationReducer,
  releases: releaseReducer,
  users: userReducer
});

const sessionReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    state = undefined;
  }
  return rootReducer(state, action);
};

export const getConfiguredStore = config =>
  configureStore({
    ...config,
    reducer: sessionReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        immutableCheck: {
          ignoredPaths: ['app.cancelSource.token']
        },
        serializableCheck: {
          ignoredActions: [SET_SNACKBAR, UPLOAD_PROGRESS],
          ignoredActionPaths: ['cancelSource.token', 'snackbar'],
          ignoredPaths: ['app.cancelSource.token', 'app.snackbar']
        }
      })
  });

export default getConfiguredStore();
