import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState } from '../../../tests/mockData';
import * as AppConstants from '../constants/appConstants';
import * as DeploymentConstants from '../constants/deploymentConstants';
import * as UserConstants from '../constants/userConstants';
import {
  abortDeployment,
  createDeployment,
  getDeploymentDevices,
  getDeploymentsByStatus,
  getDeploymentsConfig,
  getDeviceLog,
  saveDeltaDeploymentsConfig,
  setDeploymentsState,
  updateDeploymentControlMap
} from './deploymentActions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
};
const deploymentsConfig = {
  binaryDelta: {
    compressionLevel: 6,
    disableChecksum: false,
    disableDecompression: false,
    duplicatesWindow: 0,
    inputWindow: 0,
    instructionBuffer: 0,
    sourceWindow: 0,
    timeout: 0
  },
  binaryDeltaLimits: {
    duplicatesWindow: DeploymentConstants.limitDefault,
    inputWindow: DeploymentConstants.limitDefault,
    instructionBuffer: DeploymentConstants.limitDefault,
    sourceWindow: DeploymentConstants.limitDefault,
    timeout: { default: 60, max: 3600, min: 60 }
  },
  hasDelta: true
};

const defaultResponseActions = {
  creation: {
    type: DeploymentConstants.CREATE_DEPLOYMENT,
    deployment: { devices: [{ id: Object.keys(defaultState.devices.byId)[0], status: 'pending' }], stats: {} },
    deploymentId: createdDeployment.id
  },
  devices: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES,
    deploymentId: defaultState.deployments.byId.d1.id,
    devices: defaultState.deployments.byId.d1.devices,
    selectedDeviceIds: [defaultState.deployments.byId.d1.devices.a1.id],
    totalDeviceCount: 1
  },
  log: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG,
    deployment: {
      ...defaultState.deployments.byId.d1,
      devices: {
        ...defaultState.deployments.byId.d1.devices,
        a1: {
          ...defaultState.deployments.byId.d1.devices.a1,
          log: 'test'
        }
      }
    }
  },
  snackbar: {
    type: AppConstants.SET_SNACKBAR,
    snackbar: {
      maxWidth: '900px',
      message: 'Deployment created successfully',
      open: true
    }
  },
  receive: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT,
    deployment: createdDeployment
  },
  receiveMultiple: { type: DeploymentConstants.RECEIVE_DEPLOYMENTS, deployments: {} },
  receiveInprogress: { type: DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS, deploymentIds: [], status: 'inprogress', total: 0 },
  remove: { type: DeploymentConstants.REMOVE_DEPLOYMENT, deploymentId: defaultState.deployments.byId.d1.id },
  select: {
    type: DeploymentConstants.SELECT_DEPLOYMENT,
    deploymentId: createdDeployment.id
  },
  selectMultiple: {
    type: DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS,
    deploymentIds: Object.keys(defaultState.deployments.byId),
    status: 'inprogress'
  }
};

/* eslint-disable sonarjs/no-identical-functions */
describe('deployment actions', () => {
  it('should allow aborting deployments', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      defaultResponseActions.receiveMultiple,
      defaultResponseActions.receiveInprogress,
      defaultResponseActions.remove,
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          message: 'The deployment was successfully aborted'
        }
      }
    ];
    return store.dispatch(abortDeployment(defaultState.deployments.byId.d1.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it(`should reject aborting deployments that don't exist`, () => {
    const store = mockStore({ ...defaultState });
    const abortedDeployment = store.dispatch(abortDeployment(`${defaultState.deployments.byId.d1.id}-invalid`));
    expect(typeof abortedDeployment === Promise);
    expect(abortedDeployment).rejects.toBeTruthy();
  });
  it('should allow creating deployments without filter or group', async () => {
    const store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byStatus: {
          ...defaultState.deployments.byStatus,
          finished: { ...defaultState.deployments.byStatus.finished, total: 0 },
          inprogress: { ...defaultState.deployments.byStatus.inprogress, total: 0 },
          pending: { ...defaultState.deployments.byStatus.pending, total: 0 },
          scheduled: { ...defaultState.deployments.byStatus.scheduled, total: 0 }
        }
      }
    });
    // eslint-disable-next-line no-unused-vars
    const { id_attribute, ...retrievedSettings } = defaultState.users.globalSettings;
    const expectedActions = [
      defaultResponseActions.creation,
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...retrievedSettings } },
      { type: AppConstants.SET_OFFLINE_THRESHOLD, value: '2019-01-12T13:00:00.900Z' },
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, hasDeployments: true } },
      defaultResponseActions.receiveMultiple
    ];
    return store.dispatch(createDeployment({ devices: [Object.keys(defaultState.devices.byId)[0]] })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow creating deployments with a filter', async () => {
    const store = mockStore({ ...defaultState });
    const filter_id = '1234';
    const expectedActions = [
      { ...defaultResponseActions.creation, deployment: { devices: [], filter_id, stats: {} } },
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.receiveMultiple
    ];
    return store.dispatch(createDeployment({ filter_id })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow creating deployments with a group', async () => {
    const store = mockStore({ ...defaultState });
    const group = Object.keys(defaultState.devices.groups.byId)[0];
    const expectedActions = [
      { ...defaultResponseActions.creation, deployment: { devices: [], group, stats: {} } },
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.receiveMultiple
    ];
    return store.dispatch(createDeployment({ group })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deployments retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [
      { ...defaultResponseActions.receiveMultiple, deployments: defaultState.deployments.byId },
      {
        ...defaultResponseActions.receiveInprogress,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        total: defaultState.deployments.byStatus.inprogress.total
      },
      defaultResponseActions.selectMultiple,
      {
        ...defaultResponseActions.receiveMultiple,
        deployments: {
          [defaultState.deployments.byId.d1.id]: { ...defaultState.deployments.byId.d1, stats: defaultState.deployments.byId.d1.stats },
          [defaultState.deployments.byId.d2.id]: { ...defaultState.deployments.byId.d2, stats: defaultState.deployments.byId.d2.stats }
        }
      }
    ];
    return store
      .dispatch(getDeploymentsByStatus('inprogress', null, null, undefined, undefined, Object.keys(defaultState.devices.groups.byId)[0], 'configuration', true))
      .then(() => {
        const storeActions = store.getActions();
        expect(storeActions.length).toEqual(expectedActions.length);
        expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
      });
  });
  it('should allow deployment device log retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.log];
    return store.dispatch(getDeviceLog(Object.keys(defaultState.deployments.byId)[0], defaultState.deployments.byId.d1.devices.a1.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deployment device list retrieval', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.devices];
    return store.dispatch(getDeploymentDevices(Object.keys(defaultState.deployments.byId)[0])).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow updating a deployment to continue the execution', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.receive, defaultResponseActions.receiveMultiple];
    return store.dispatch(updateDeploymentControlMap(createdDeployment.id, { something: 'continue' })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deployment state tracking', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(
      setDeploymentsState({
        general: { showCreationDialog: true },
        [DeploymentConstants.DEPLOYMENT_STATES.finished]: { something: 'new' },
        selectedId: createdDeployment.id
      })
    );
    const expectedActions = [
      {
        type: DeploymentConstants.SET_DEPLOYMENTS_STATE,
        state: {
          ...defaultState.deployments.selectionState,
          finished: {
            ...defaultState.deployments.selectionState.finished,
            something: 'new'
          },
          general: {
            ...defaultState.deployments.selectionState.general,
            showCreationDialog: true
          },
          selectedId: createdDeployment.id
        }
      },
      defaultResponseActions.receive,
      defaultResponseActions.receiveMultiple
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });

  it('should allow retrieving config for deployments', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [{ type: DeploymentConstants.SET_DEPLOYMENTS_CONFIG, config: deploymentsConfig }];
    return store.dispatch(getDeploymentsConfig()).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow storing delta deployments settings', async () => {
    const store = mockStore({ ...defaultState });
    const changedConfig = {
      timeout: 100,
      duplicatesWindow: 734,
      compressionLevel: 5,
      disableChecksum: true,
      disableDecompression: false,
      inputWindow: 1253,
      instructionBuffer: 123,
      sourceWindow: 13
    };
    // eslint-disable-next-line no-unused-vars
    const { hasDelta, ...expectedConfig } = deploymentsConfig;
    const expectedActions = [
      { type: DeploymentConstants.SET_DEPLOYMENTS_CONFIG, config: { ...expectedConfig, binaryDelta: { ...expectedConfig.binaryDelta, ...changedConfig } } },
      { type: AppConstants.SET_SNACKBAR, snackbar: { maxWidth: '900px', message: 'Settings saved successfully', open: true } }
    ];
    return store.dispatch(saveDeltaDeploymentsConfig(changedConfig)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
});
