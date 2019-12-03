import * as DeviceConstants from '../constants/deviceConstants';

const initialState = {
  byId: {},
  byStatus: {
    [DeviceConstants.DEVICE_STATES.accepted]: { deviceIds: [], total: 0 },
    active: { deviceIds: [], total: 0 },
    inactive: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.pending]: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.preauth]: { deviceIds: [], total: 0 },
    [DeviceConstants.DEVICE_STATES.rejected]: { deviceIds: [], total: 0 }
  },
  selectedDevice: null,
  selectedDeviceList: [],
  filters: [],
  filteringAttributes: [],
  filteringAttributesLimit: 10,
  total: 0,
  limit: 500,
  groups: {
    byId: {
      // [DeviceConstants.UNGROUPED_GROUP.id]: { deviceIds: [], total: 0 }
    },
    selectedGroup: null
  }
};

const deviceReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeviceConstants.RECEIVE_GROUPS: {
      const byId = action.groups.reduce(
        (accu, group) => {
          if (!accu[group]) {
            accu[group] = { deviceIds: [], total: 0 };
          }
          return accu;
        },
        { ...state.groups.byId }
      );
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: { ...byId }
        }
      };
    }
    case DeviceConstants.ADD_TO_GROUP: {
      let group = {
        deviceIds: [action.deviceId],
        total: 1
      };
      if (state.groups.byId[action.group]) {
        group = {
          ...state.groups.byId[action.group],
          deviceIds: [...state.groups.byId[action.group].deviceIds, action.deviceId],
          total: state.groups.byId[action.group].total + 1
        };
      }
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [action.group]: {
              ...group
            }
          }
        }
      };
    }
    case DeviceConstants.ADD_GROUP:
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [action.group]: {
              deviceIds: [],
              total: 0
            }
          }
        }
      };
    case DeviceConstants.REMOVE_FROM_GROUP: {
      const deviceIdsIndex = state.groups.byId[action.group].deviceIds.findIndex(item => item === action.deviceId);
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [action.group]: {
              ...state.groups.byId[action.group],
              deviceIds: [
                ...state.groups.byId[action.group].deviceIds.slice(0, deviceIdsIndex),
                ...state.groups.byId[action.group].deviceIds.slice(deviceIdsIndex + 1)
              ],
              total: state.groups.byId[action.group].total - 1
            }
          }
        }
      };
    }
    case DeviceConstants.SELECT_GROUP:
      return {
        ...state,
        selectedDeviceList:
          state.groups.byId[action.group] && state.groups.byId[action.group].deviceIds.length > 0 ? state.groups.byId[action.group].deviceIds : [],
        groups: {
          ...state.groups,
          selectedGroup: action.group
        }
      };
    case DeviceConstants.SELECT_DEVICE:
      return { ...state, selectedDevice: action.deviceId };
    case DeviceConstants.SELECT_DEVICES:
      return { ...state, selectedDeviceList: action.deviceIds };
    case DeviceConstants.RECEIVE_GROUP_DEVICES:
      return {
        ...state,
        selectedDeviceList: action.deviceIds,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [action.group]: {
              deviceIds:
                action.deviceIds.length === action.total || action.deviceIds.length > state.groups.byId[action.group].deviceIds
                  ? action.deviceIds
                  : state.groups.byId[action.group].deviceIds,
              total: action.total
            }
          }
        }
      };
    case DeviceConstants.SET_FILTER_ATTRIBUTES:
      return { ...state, filteringAttributes: action.attributes };
    case DeviceConstants.RECEIVE_DEVICE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.device.id]: {
            ...state.byId[action.device.id],
            ...action.device
          }
        }
      };
    case DeviceConstants.RECEIVE_DEVICES_LIST: {
      const devicesById = action.devices.reduce((accu, device) => {
        delete device.updated_ts;
        accu[device.id] = { ...state.byId[device.id], ...device };
        return accu;
      }, {});
      return {
        ...state,
        selectedDeviceList: Object.keys(devicesById),
        byId: {
          ...state.byId,
          ...devicesById
        }
      };
    }
    case DeviceConstants.RECEIVE_DEVICES:
      return {
        ...state,
        byId: {
          ...state.byId,
          ...action.devicesById
        }
      };
    case DeviceConstants.RECEIVE_ALL_DEVICE_IDS: {
      const devicesById = action.deviceIds.reduce((accu, deviceId) => {
        accu[deviceId] = state.byId[deviceId];
        return accu;
      }, {});
      return {
        ...state,
        byId: {
          ...state.byId,
          ...devicesById
        }
      };
    }
    case DeviceConstants.SET_DEVICE_FILTERS: {
      return {
        ...state,
        filters: action.filters
      };
    }

    case DeviceConstants.SET_INACTIVE_DEVICES:
      return {
        ...state,
        byStatus: {
          ...state.byStatus,
          active: {
            deviceIds: action.activeDeviceIds,
            total: action.activeDeviceIds.length
          },
          inactive: {
            deviceIds: action.inactiveDeviceIds,
            total: action.inactiveDeviceIds.length
          }
        }
      };

    case DeviceConstants.SET_PENDING_DEVICES:
    case DeviceConstants.SET_REJECTED_DEVICES:
    case DeviceConstants.SET_PREAUTHORIZED_DEVICES:
    case DeviceConstants.SET_ACCEPTED_DEVICES: {
      const deviceListSelection = action.total ? state.selectedDeviceList : action.deviceIds;
      const statusDeviceInfo = action.total ? { deviceIds: action.deviceIds, total: action.total } : state.byStatus[action.status];
      return {
        ...state,
        selectedDeviceList: deviceListSelection,
        byStatus: {
          ...state.byStatus,
          [action.status]: {
            ...statusDeviceInfo
          }
        }
      };
    }

    case DeviceConstants.SET_UNGROUPED_DEVICES: {
      const ungroupedGroup = action.deviceIds
        ? {
            [DeviceConstants.UNGROUPED_GROUP.id]: {
              deviceIds: action.deviceIds,
              total: action.deviceIds.length
            }
          }
        : {};
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            ...ungroupedGroup
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
    case DeviceConstants.RECEIVE_DEVICE_AUTH: {
      const { auth_sets, identity_data, status } = action.device;
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.device.id]: {
            ...state.byId[action.device.id],
            identity_data,
            auth_sets,
            status
          }
        }
      };
    }
    // TODO!!!
    case DeviceConstants.UPDATE_DEVICE_AUTHSET:
    case DeviceConstants.REMOVE_DEVICE_AUTHSET:
    case DeviceConstants.ADD_DEVICE_AUTHSET:
    case DeviceConstants.DECOMMISION_DEVICE:
      return state;
    default:
      return state;
  }
};

export default deviceReducer;
