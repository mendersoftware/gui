import { SORTING_OPTIONS } from '../constants/appConstants';
import DeviceConstants from '../constants/deviceConstants';
import MonitorConstants from '../constants/monitorConstants';
import { duplicateFilter } from '../helpers';

export const initialState = {
  byId: {
    // [deviceId]: {
    //   ...,
    //   twinsByIntegration: { [external.provider.id]: twinData }
    // }
  },
  byStatus: {
    [DeviceConstants.DEVICE_STATES.accepted]: { deviceIds: [], total: 0 },
    active: { deviceIds: [], total: 0 },
    inactive: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.pending]: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.preauth]: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.rejected]: { deviceIds: [], total: 0 }
  },
  selectedDevice: null,
  deviceList: {
    deviceIds: [],
    ...DeviceConstants.DEVICE_LIST_DEFAULTS,
    selectedAttributes: [],
    selectedIssues: [],
    selection: [],
    sort: {
      direction: SORTING_OPTIONS.desc
      // key: null,
      // scope: null
    },
    state: DeviceConstants.DEVICE_STATES.accepted,
    total: 0
  },
  filters: [
    // { key: 'device_type', value: 'raspberry', operator: '$eq', scope: 'inventory' }
  ],
  filteringAttributes: { identityAttributes: [], inventoryAttributes: [], tagAttributes: [] },
  filteringAttributesLimit: 10,
  total: 0,
  limit: 0,
  groups: {
    byId: {
      // groupName: { deviceIds: [], total: 0, filters: [] },
      // dynamo: { deviceIds: [], total: 3, filters: [{ a: 1 }] }
    },
    selectedGroup: undefined
  }
};

const deviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeviceConstants.RECEIVE_GROUPS:
    case DeviceConstants.RECEIVE_DYNAMIC_GROUPS:
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: { ...state.groups.byId, ...action.groups }
        }
      };
    case DeviceConstants.ADD_TO_GROUP: {
      let group = {
        deviceIds: action.deviceIds,
        filters: [],
        total: 1
      };
      if (state.groups.byId[action.group]) {
        group = {
          filters: [],
          ...state.groups.byId[action.group],
          deviceIds: [...state.groups.byId[action.group].deviceIds, ...action.deviceIds],
          total: state.groups.byId[action.group].total + 1
        };
        group.deviceIds.filter(duplicateFilter);
      }
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [action.group]: group
          }
        }
      };
    }
    case DeviceConstants.REMOVE_FROM_GROUP: {
      const { deviceIds = [], total = 0, ...maybeExistingGroup } = state.groups.byId[action.group] || {};
      const group = {
        ...maybeExistingGroup,
        deviceIds: deviceIds.filter(id => !action.deviceIds.includes(id)),
        total: Math.max(total - action.deviceIds.length, 0)
      };
      let byId = {};
      let selectedGroup = state.groups.selectedGroup;
      if (group.total || group.deviceIds.length) {
        byId = {
          ...state.groups.byId,
          [action.group]: group
        };
      } else if (state.groups.selectedGroup === action.group) {
        selectedGroup = undefined;
        // eslint-disable-next-line no-unused-vars
        const { [action.group]: removal, ...remainingById } = state.groups.byId;
        byId = remainingById;
      }
      return {
        ...state,
        groups: {
          ...state.groups,
          byId,
          selectedGroup
        }
      };
    }
    case DeviceConstants.ADD_DYNAMIC_GROUP:
    case DeviceConstants.ADD_STATIC_GROUP:
    case DeviceConstants.RECEIVE_GROUP_DEVICES:
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: { ...state.groups.byId, [action.groupName]: action.group }
        }
      };
    case DeviceConstants.REMOVE_DYNAMIC_GROUP:
    case DeviceConstants.REMOVE_STATIC_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: action.groups
        }
      };
    case DeviceConstants.SELECT_GROUP:
      return {
        ...state,
        deviceList: {
          ...state.deviceList,
          deviceIds: state.groups.byId[action.group] && state.groups.byId[action.group].deviceIds.length > 0 ? state.groups.byId[action.group].deviceIds : []
        },
        groups: {
          ...state.groups,
          selectedGroup: action.group
        }
      };
    case DeviceConstants.SELECT_DEVICE:
      return { ...state, selectedDevice: action.deviceId };
    case DeviceConstants.SET_DEVICE_LIST_STATE:
      return { ...state, deviceList: action.state };
    case DeviceConstants.SET_FILTER_ATTRIBUTES:
      return { ...state, filteringAttributes: action.attributes };

    case DeviceConstants.RECEIVE_DEVICES:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.devicesById
        }
      };
    case DeviceConstants.SET_DEVICE_FILTERS: {
      const filters = action.filters.filter(filter => filter.key && filter.operator && filter.scope && typeof filter.value !== 'undefined');
      return {
        ...state,
        filters
      };
    }

    case DeviceConstants.SET_INACTIVE_DEVICES:
      return {
        ...state,
        byStatus: {
          ...state.byStatus,
          active: {
            total: action.activeDeviceTotal
          },
          inactive: {
            total: action.inactiveDeviceTotal
          }
        }
      };

    case DeviceConstants.SET_PENDING_DEVICES:
    case DeviceConstants.SET_REJECTED_DEVICES:
    case DeviceConstants.SET_PREAUTHORIZED_DEVICES:
    case DeviceConstants.SET_ACCEPTED_DEVICES: {
      const statusDeviceInfo = action.total || action.forceUpdate ? { deviceIds: action.deviceIds, total: action.total } : state.byStatus[action.status];
      return {
        ...state,
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...statusDeviceInfo
          }
        }
      };
    }

    case DeviceConstants.SET_ACCEPTED_DEVICES_COUNT:
    case DeviceConstants.SET_PENDING_DEVICES_COUNT:
    case DeviceConstants.SET_REJECTED_DEVICES_COUNT:
    case DeviceConstants.SET_PREAUTHORIZED_DEVICES_COUNT:
      return {
        ...state,
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...state.byStatus[action.status],
            total: action.count
          }
        }
      };
    case DeviceConstants.SET_TOTAL_DEVICES:
      return { ...state, total: action.count };
    case DeviceConstants.SET_DEVICE_LIMIT:
      return { ...state, limit: action.limit };
    case DeviceConstants.RECEIVE_DEVICE:
    case DeviceConstants.RECEIVE_DEVICE_CONFIG:
    case DeviceConstants.RECEIVE_DEVICE_CONNECT:
    case MonitorConstants.RECEIVE_DEVICE_MONITOR_CONFIG: {
      const { device } = action;
      return {
        ...state,
        byId: {
          ...state.byId,
          [device.id]: {
            ...state.byId[device.id],
            ...device
          }
        }
      };
    }
    default:
      return state;
  }
};

export default deviceReducer;
