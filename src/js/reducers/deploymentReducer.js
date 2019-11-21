import * as DeploymentConstants from '../constants/deploymentConstants';

const initialState = {
  byId: {
    // [id]: { stats, devices: [ { id, log } ] }
  },
  byStatus: {
    pending: { deploymentIds: [], total: 0 },
    inprogress: { deploymentIds: [], total: 0 },
    finished: { deploymentIds: [], total: 0 }
  },
  deploymentRelease: null,
  deploymentDeviceLimit: 5000,
  selectedDeploymentsList: [],
  selectedDeployment: null
};

const deploymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeploymentConstants.CREATE_DEPLOYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: action.deployment
        },
        byStatus: {
          ...state.byStatus,
          pending: {
            ...state.byStatus.pending,
            deploymentIds: [...state.byStatus.pending.deploymentIds, action.deploymentId],
            total: state.byStatus.pending.total + 1
          }
        }
      };
    case DeploymentConstants.REMOVE_DEPLOYMENT: {
      const byId = state.byId;
      delete byId[action.deploymentId];
      return {
        ...state,
        byId
      };
    }
    case DeploymentConstants.RECEIVE_DEPLOYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deployment.id]: {
            ...state.byId[action.deployment.id],
            ...action.deployment
          }
        }
      };
    case DeploymentConstants.RECEIVE_DEPLOYMENT_STATS:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...state.byId[action.deploymentId],
            stats: action.stats
          }
        }
      };
    case DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICE_LOG:
    case DeploymentConstants.RECEIVE_DEPLOYMENT_DEVICES:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...state.byId[action.deploymentId],
            devices: action.devices
          }
        }
      };

    case DeploymentConstants.RECEIVE_DEPLOYMENTS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.deployments
        },
        selectedDeploymentsList: action.deploymentIds
      };

    case DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_PENDING_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_FINISHED_DEPLOYMENTS:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.deployments
        },
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...state.byStatus[action.status],
            deploymentIds: action.deploymentIds
          }
        }
      };
    case DeploymentConstants.RECEIVE_PENDING_DEPLOYMENTS_COUNT:
    case DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS_COUNT:
    case DeploymentConstants.RECEIVE_FINISHED_DEPLOYMENTS_COUNT:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.deployments
        },
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...state.byStatus[action.status],
            total: action.deploymentIds.length
          }
        }
      };
    case DeploymentConstants.SET_DEPLOYMENT_RELEASE:
      return {
        ...state,
        deploymentRelease: action.release
      };
    case DeploymentConstants.SELECT_DEPLOYMENT:
      return {
        ...state,
        selectedDeployment: action.deploymentId
      };
    default:
      return state;
  }
};

export default deploymentReducer;
