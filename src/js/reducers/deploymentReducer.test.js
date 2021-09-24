import reducer, { initialState } from './deploymentReducer';
import DeploymentConstants from '../constants/deploymentConstants';
import { defaultState } from '../../../tests/mockData';

describe('device reducer', () => {
  it('should return the initial state', async () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVE_DEPLOYMENT', async () => {
    expect(reducer(undefined, { type: DeploymentConstants.RECEIVE_DEPLOYMENT, deployment: defaultState.deployments.byId.d1 }).byId.d1).toEqual(
      defaultState.deployments.byId.d1
    );
    expect(reducer(initialState, { type: DeploymentConstants.RECEIVE_DEPLOYMENT, deployment: defaultState.deployments.byId.d1 }).byId.d1).toEqual(
      defaultState.deployments.byId.d1
    );
  });
  it('should handle RECEIVE_DEPLOYMENT_STATS', async () => {
    const { stats } = defaultState.deployments.byId.d1;
    expect(
      reducer(undefined, { type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS, deploymentId: defaultState.deployments.byId.d1.id, stats }).byId.d1.stats
    ).toBeTruthy();
    expect(
      reducer(initialState, { type: DeploymentConstants.RECEIVE_DEPLOYMENT_STATS, deploymentId: defaultState.deployments.byId.d1.id, stats }).byId.d1.stats
    ).toBeTruthy();
  });
  it('should handle RECEIVE_DEPLOYMENT_DEVICE_LOG', async () => {
    const { devices } = defaultState.deployments.byId.d1;
    expect(
      reducer(undefined, { type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG, deployment: defaultState.deployments.byId.d1 }).byId.d1.devices.a1.id
    ).toEqual(devices.a1.id);
    expect(
      reducer(initialState, { type: DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG, deployment: defaultState.deployments.byId.d1 }).byId.d1.devices.a1.id
    ).toEqual(devices.a1.id);
  });

  it('should handle RECEIVE_<deploymentstatus>_DEPLOYMENTS', async () => {
    Object.values(DeploymentConstants.DEPLOYMENT_STATES).forEach(status => {
      expect(
        reducer(undefined, { type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds: ['a1'], total: 1, status }).byStatus[
          status
        ]
      ).toEqual({ deploymentIds: ['a1'], total: 1 });
      expect(
        reducer(initialState, { type: DeploymentConstants[`RECEIVE_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds: ['a1'], total: 1, status }).byStatus[
          status
        ]
      ).toEqual({ deploymentIds: ['a1'], total: 1 });
    });
  });
  it('should handle SELECT_<deploymentstatus>_DEPLOYMENTS', async () => {
    Object.values(DeploymentConstants.DEPLOYMENT_STATES).forEach(status => {
      expect(
        reducer(undefined, { type: DeploymentConstants[`SELECT_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds: ['a1'], status }).selectionState[status]
          .selection
      ).toEqual(['a1']);
      expect(
        reducer(initialState, { type: DeploymentConstants[`SELECT_${status.toUpperCase()}_DEPLOYMENTS`], deploymentIds: ['a1'], status }).selectionState[status]
          .selection
      ).toEqual(['a1']);
    });
  });
  it('should handle SELECT_DEPLOYMENT', async () => {
    expect(reducer(undefined, { type: DeploymentConstants.SELECT_DEPLOYMENT, deploymentId: 'a1' }).selectedDeployment).toEqual('a1');
    expect(reducer(initialState, { type: DeploymentConstants.SELECT_DEPLOYMENT, deploymentId: 'a1' }).selectedDeployment).toEqual('a1');
  });
  it('should handle SET_DEPLOYMENTS_STATE', async () => {
    const newState = { something: 'new' };
    expect(reducer(undefined, { type: DeploymentConstants.SET_DEPLOYMENTS_STATE, state: newState }).selectionState).toEqual(newState);
    expect(reducer(initialState, { type: DeploymentConstants.SET_DEPLOYMENTS_STATE, state: newState }).selectionState).toEqual(newState);
  });
  it('should handle REMOVE_DEPLOYMENT', async () => {
    let state = reducer(undefined, { type: DeploymentConstants.RECEIVE_DEPLOYMENT, deployment: defaultState.deployments.byId.d1 });
    expect(reducer(state, { type: DeploymentConstants.REMOVE_DEPLOYMENT, deploymentId: defaultState.deployments.byId.d1.id }).byId).toEqual({});
    expect(reducer(initialState, { type: DeploymentConstants.REMOVE_DEPLOYMENT, deploymentId: 'a1' }).byId).toEqual({});
  });
  it('should handle CREATE_DEPLOYMENT', async () => {
    expect(reducer(undefined, { type: DeploymentConstants.CREATE_DEPLOYMENT, deployment: { name: 'test' }, deploymentId: 'test' }).byId.test.devices).toEqual(
      {}
    );
    expect(
      reducer(initialState, { type: DeploymentConstants.CREATE_DEPLOYMENT, deployment: { name: 'test' }, deploymentId: 'a1' }).byStatus.pending.deploymentIds
    ).toContain('a1');
  });
});
