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

const store = configureStore({
  reducer: sessionReducer
});

export default store;
