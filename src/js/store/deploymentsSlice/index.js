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

import * as deploymentsConstants from './constants';
import * as deploymentsSelectors from './selectors';
import { constants as storeConstants } from '../store';

const { deploymentPrototype, DEPLOYMENT_STATES, DEPLOYMENT_ROUTES, DEFAULT_PENDING_INPROGRESS_COUNT, limitDefault } = deploymentsConstants;
const { DEVICE_LIST_DEFAULTS } = storeConstants;

export const sliceName = 'deployments';

export const initialState = {
  byId: {
    // [id]: { statistics: { status: {}, total_size }, devices: { [deploymentId]: { id, log } }, totalDeviceCount }
  },
  byStatus: {
    finished: { deploymentIds: [], total: 0 },
    inprogress: { deploymentIds: [], total: 0 },
    pending: { deploymentIds: [], total: 0 },
    scheduled: { deploymentIds: [], total: 0 }
  },
  config: {
    binaryDelta: {
      timeout: -1,
      duplicatesWindow: -1,
      compressionLevel: -1,
      disableChecksum: false,
      disableDecompression: false,
      inputWindow: -1,
      instructionBuffer: -1,
      sourceWindow: -1
    },
    binaryDeltaLimits: {
      timeout: { ...limitDefault, default: 60, max: 3600, min: 60 },
      sourceWindow: limitDefault,
      inputWindow: limitDefault,
      duplicatesWindow: limitDefault,
      instructionBuffer: limitDefault
    }
  },
  deploymentDeviceLimit: 5000,
  selectedDeviceIds: [],
  selectionState: {
    finished: { ...DEVICE_LIST_DEFAULTS, endDate: undefined, search: '', selection: [], startDate: undefined, total: 0, type: '' },
    inprogress: { ...DEVICE_LIST_DEFAULTS, perPage: DEFAULT_PENDING_INPROGRESS_COUNT, selection: [] },
    pending: { ...DEVICE_LIST_DEFAULTS, perPage: DEFAULT_PENDING_INPROGRESS_COUNT, selection: [] },
    scheduled: { ...DEVICE_LIST_DEFAULTS, selection: [] },
    general: {
      state: DEPLOYMENT_ROUTES.active.key,
      showCreationDialog: false,
      showReportDialog: false,
      reportType: null // DeploymentConstants.DEPLOYMENT_TYPES.configuration|DeploymentConstants.DEPLOYMENT_TYPES.software
    },
    selectedId: undefined
  }
};

export const deploymentsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    createdDeployment: (state, action) => {
      state.byId[action.payload.id] = {
        ...deploymentPrototype,
        ...action.payload
      };
      state.byStatus[DEPLOYMENT_STATES.pending].total = state.byStatus[DEPLOYMENT_STATES.pending].total + 1;
      state.byStatus[DEPLOYMENT_STATES.pending].deploymentIds = [...state.byStatus.pending.deploymentIds, action.payload.id];
      (state.selectionState[DEPLOYMENT_STATES.pending].selection = [action.payload.id, ...state.selectionState[DEPLOYMENT_STATES.pending].selection]),
        (state.selectionState[DEPLOYMENT_STATES.pending].total = state.selectionState[DEPLOYMENT_STATES.pending].total + 1);
    },
    removedDeployment: (state, action) => {
      // eslint-disable-next-line no-unused-vars
      const { [action.payload]: removedDeployment, ...remainder } = state.byId;
      state.byId = remainder;
    },
    receivedDeployment: (state, action) => {
      state.byId[action.payload.id] = {
        ...(state.byId[action.payload.id] || {}),
        ...action.payload
      };
    },
    receivedDeploymentDeviceLog: (state, action) => {
      const { deploymentId, deviceId, log } = action.payload;
      state.byId[deploymentId].devices[deviceId].log = log;
    },
    receivedDeploymentDevices: (state, action) => {
      const { id, devices, selectedDeviceIds, totalDeviceCount } = action.payload;
      state.byId[id].devices = devices;
      state.byId[id].totalDeviceCount = totalDeviceCount;
      state.selectedDeviceIds = selectedDeviceIds;
    },
    receivedDeployments: (state, action) => {
      state.byId = {
        ...state.byId,
        ...action.payload
      };
    },
    receivedDeploymentsForStatus: (state, action) => {
      const { status, deploymentIds, total } = action.payload;
      state.byStatus[status].deploymentIds = deploymentIds;
      state.byStatus[status].total = total;
    },
    selectDeploymentsForStatus: (state, action) => {
      const { status, deploymentIds, total } = action.payload;
      state.selectionState[status].selection = deploymentIds;
      state.selectionState[status].total = total;
    },
    setDeploymentsState: (state, action) => {
      state.selectionState = action.payload;
    },
    setDeploymentsConfig: (state, action) => {
      state.config = action.payload;
    }
  }
});

export const actions = deploymentsSlice.actions;
export const constants = deploymentsConstants;
export const selectors = deploymentsSelectors;
export default deploymentsSlice.reducer;
