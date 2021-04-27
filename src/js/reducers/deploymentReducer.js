import DeploymentConstants from '../constants/deploymentConstants';

export const initialState = {
  byId: {
    // [id]: { stats, devices: { [deploymentId]: { id, log } } }
  },
  byStatus: {
    finished: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
    inprogress: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
    pending: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
    scheduled: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
  },
  deploymentDeviceLimit: 5000,
  selectedDeployment: null
};

const deploymentReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeploymentConstants.CREATE_DEPLOYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deploymentId]: {
            ...DeploymentConstants.deploymentPrototype,
            ...action.deployment
          }
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
      // eslint-disable-next-line no-unused-vars
      const { [action.deploymentId]: removedDeployment, ...remainder } = state.byId;
      return {
        ...state,
        byId: remainder
      };
    }
    case DeploymentConstants.RECEIVE_DEPLOYMENT:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.deployment.id]: action.deployment
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
    case DeploymentConstants.RECEIVE_INPROGRESS_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_PENDING_DEPLOYMENTS:
    case DeploymentConstants.RECEIVE_SCHEDULED_DEPLOYMENTS:
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
            deploymentIds: action.deploymentIds,
            total: action.total
          }
        }
      };
    case DeploymentConstants.SELECT_INPROGRESS_DEPLOYMENTS:
    case DeploymentConstants.SELECT_PENDING_DEPLOYMENTS:
    case DeploymentConstants.SELECT_SCHEDULED_DEPLOYMENTS:
    case DeploymentConstants.SELECT_FINISHED_DEPLOYMENTS:
      return {
        ...state,
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...state.byStatus[action.status],
            selectedDeploymentIds: action.deploymentIds
          }
        }
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
