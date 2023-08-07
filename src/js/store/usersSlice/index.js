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
import { createSlice } from '@reduxjs/toolkit';

import * as usersConstants from './constants';
import * as usersSelectors from './selectors';

const { defaultPermissionSets, rolesById } = usersConstants;

export const sliceName = 'users';

export const initialState = {
  byId: {},
  currentUser: null,
  customColumns: [],
  jwtToken: null,
  qrCode: null,
  globalSettings: {
    id_attribute: undefined,
    previousFilters: [],
    previousPhases: [],
    retries: 0
  },
  settingsInitialized: false,
  showHelptips: true,
  showConnectDeviceDialog: false,
  permissionSetsById: {
    ...defaultPermissionSets
  },
  rolesById: {
    ...rolesById
  },
  userSettings: {
    columnSelection: [],
    onboarding: {}
  },
  userSettingsInitialized: false
};

export const usersSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    receivedQrCode: (state, action) => {
      state.qrCode = action.payload;
    },
    successfullyLoggedIn: (state, action) => {
      state.jwtToken = action.payload;
    },
    receivedUserList: (state, action) => {
      state.byId = action.payload;
    },
    receivedActivationCode: (state, action) => {
      state.activationCode = action.payload;
    },
    receivedUser: (state, action) => {
      state.byId[action.payload.id] = action.payload;
      state.currentUser = action.payload.id;
    },
    createdUser: (state, action) => {
      // the new user gets a 0 as id, since this will be overwritten by the retrieved userlist anyway + there is no way to know the id before
      state.byId[0] = action.payload;
    },
    removedUser: (state, action) => {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload]: removedUser, ...byId } = state.byId;
      state.byId = byId;
      state.currentUser = state.currentUser === action.payload ? null : state.currentUser;
    },
    updatedUser: (state, action) => {
      state.byId[action.payload.id] = {
        ...state.byId[action.payload.id],
        ...action.payload
      };
    },
    receivedPermissionSets: (state, action) => {
      state.permissionSetsById = action.payload;
    },
    receivedRoles: (state, action) => {
      state.rolesById = action.payload;
    },
    createdRole: (state, action) => {
      state.rolesById[action.payload.name] = {
        ...state.rolesById[action.payload.name],
        ...action.payload
      };
    },
    removedRole: (state, action) => {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload]: toBeRemoved, ...rolesById } = state.rolesById;
      state.rolesById = rolesById;
    },
    setCustomColumns: (state, action) => {
      state.customColumns = action.payload;
    },
    setGlobalSettings: (state, action) => {
      state.settingsInitialized = true;
      state.globalSettings = {
        ...state.globalSettings,
        ...action.payload
      };
    },
    setUserSettings: (state, action) => {
      state.userSettingsInitialized = true;
      state.userSettings = {
        ...state.userSettings,
        ...action.payload
      };
    },
    setShowHelp: (state, action) => {
      state.showHelptips = action.payload;
    },
    setShowConnectDevice: (state, action) => {
      state.showConnectDeviceDialog = action.payload;
    }
  }
});

export const actions = usersSlice.actions;
export const constants = usersConstants;
export const selectors = usersSelectors;
export default usersSlice.reducer;
