import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { defaultState } from '../../../tests/mockData';

import {
  abortDeployment,
  createDeployment,
  getDeploymentsByStatus,
  getDeploymentDevices,
  getDeviceLog,
  selectDeployment,
  setDeploymentsState,
  updateDeploymentControlMap
} from './deploymentActions';
import AppConstants from '../constants/appConstants';
import DeploymentConstants from '../constants/deploymentConstants';
import UserConstants from '../constants/userConstants';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const createdDeployment = {
  ...defaultState.deployments.byId.d1,
  id: 'created-123'
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
  receiveInprogress: { type: DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS, deploymentIds: [], deployments: {}, status: 'inprogress', total: 0 },
  remove: { type: DeploymentConstants.REMOVE_DEPLOYMENT, deploymentId: defaultState.deployments.byId.d1.id },
  select: {
    type: DeploymentConstants.SELECT_DEPLOYMENT,
    deploymentId: createdDeployment.id
  },
  selectMultiple: {
    type: DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS,
    deploymentIds: Object.keys(defaultState.deployments.byId),
    status: 'inprogress'
  },
  stats: {
    type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS,
    stats: {},
    deploymentId: createdDeployment.id
  }
};

/* eslint-disable sonarjs/no-identical-functions */
describe('deployment actions', () => {
  const store = mockStore({ ...defaultState });
  it('should allow aborting deployments', async () => {
    const expectedActions = [
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
    const expectedActions = [
      defaultResponseActions.creation,
      {
        ...defaultResponseActions.snackbar,
        snackbar: {
          ...defaultResponseActions.snackbar.snackbar,
          autoHideDuration: 8000
        }
      },
      { type: UserConstants.SET_GLOBAL_SETTINGS, settings: { ...defaultState.users.globalSettings, hasDeployments: true } },
      defaultResponseActions.receive,
      defaultResponseActions.stats
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
      defaultResponseActions.stats
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
      defaultResponseActions.stats
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
      {
        ...defaultResponseActions.receiveInprogress,
        deployments: defaultState.deployments.byId,
        deploymentIds: Object.keys(defaultState.deployments.byId),
        total: defaultState.deployments.byStatus.inprogress.total
      },
      defaultResponseActions.selectMultiple,
      { ...defaultResponseActions.stats, deploymentId: defaultState.deployments.byId.d1.id, stats: defaultState.deployments.byId.d1.stats },
      { ...defaultResponseActions.stats, deploymentId: defaultState.deployments.byId.d2.id, stats: defaultState.deployments.byId.d2.stats }
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
    const expectedActions = [defaultResponseActions.receive, defaultResponseActions.stats];
    return store.dispatch(updateDeploymentControlMap(createdDeployment.id, { something: 'continue' })).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow selecting a deployment', async () => {
    const store = mockStore({ ...defaultState });
    const expectedActions = [defaultResponseActions.select, defaultResponseActions.receive, defaultResponseActions.stats];
    return store.dispatch(selectDeployment(createdDeployment.id)).then(() => {
      const storeActions = store.getActions();
      expect(storeActions.length).toEqual(expectedActions.length);
      expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
    });
  });
  it('should allow deployment state tracking', async () => {
    const store = mockStore({ ...defaultState });
    await store.dispatch(
      setDeploymentsState({ general: { showCreationDialog: true }, [DeploymentConstants.DEPLOYMENT_STATES.finished]: { something: 'new' } })
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
          }
        }
      }
    ];
    const storeActions = store.getActions();
    expect(storeActions.length).toEqual(expectedActions.length);
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
