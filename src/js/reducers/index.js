import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { SET_SNACKBAR, UPLOAD_PROGRESS } from '../constants/appConstants';
import { RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS } from '../constants/organizationConstants';
import { USER_LOGOUT } from '../constants/userConstants';
import appReducer from './appReducer';
import deviceReducer from './deviceReducer';
import monitorReducer from './monitorReducer';
import organizationReducer from './organizationReducer';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  app: appReducer,
  devices: deviceReducer,
  monitor: monitorReducer,
  organization: organizationReducer,
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
          ignoredPaths: ['app.uploadsById']
        },
        serializableCheck: {
          ignoredActions: [RECEIVE_EXTERNAL_DEVICE_INTEGRATIONS, SET_SNACKBAR, UPLOAD_PROGRESS],
          ignoredActionPaths: ['uploads', 'snackbar'],
          ignoredPaths: ['app.uploadsById', 'app.snackbar', 'organization.externalDeviceIntegrations']
        }
      })
  });

export default getConfiguredStore();
