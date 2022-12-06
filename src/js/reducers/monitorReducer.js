import * as MonitorConstants from '../constants/monitorConstants';
import { DEVICE_LIST_DEFAULTS, DEVICE_ISSUE_OPTIONS } from '../constants/deviceConstants';

export const initialState = {
  alerts: {
    alertList: { ...DEVICE_LIST_DEFAULTS, total: 0 },
    byDeviceId: {}
  },
  issueCounts: {
    byType: {
      [DEVICE_ISSUE_OPTIONS.authRequests.key]: { filtered: 0, total: 0 },
      [DEVICE_ISSUE_OPTIONS.monitoring.key]: { filtered: 0, total: 0 },
      [DEVICE_ISSUE_OPTIONS.offline.key]: { filtered: 0, total: 0 }
    }
  },
  settings: {
    global: {
      channels: {
        ...Object.keys(MonitorConstants.alertChannels).reduce((accu, item) => ({ ...accu, [item]: { enabled: true } }), {})
      }
    }
  }
};

const monitorReducer = (state = initialState, action) => {
  switch (action.type) {
    case MonitorConstants.CHANGE_ALERT_CHANNEL:
      return {
        ...state,
        settings: {
          ...state.settings,
          global: {
            ...state.settings.global,
            channels: {
              ...state.settings.global.channels,
              [action.channel]: { enabled: action.enabled }
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_DEVICE_ALERTS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          byDeviceId: {
            ...state.alerts.byDeviceId,
            [action.deviceId]: {
              ...state.alerts.byDeviceId[action.deviceId],
              alerts: action.alerts
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          byDeviceId: {
            ...state.alerts.byDeviceId,
            [action.deviceId]: {
              ...state.alerts.byDeviceId[action.deviceId],
              latest: action.alerts
            }
          }
        }
      };
    case MonitorConstants.RECEIVE_DEVICE_ISSUE_COUNTS:
      return {
        ...state,
        issueCounts: {
          ...state.issueCounts,
          byType: {
            ...state.issueCounts.byType,
            [action.issueType]: action.counts
          }
        }
      };
    case MonitorConstants.SET_ALERT_LIST_STATE:
      return {
        ...state,
        alerts: {
          ...state.alerts,
          alertList: action.value
        }
      };

    default:
      return state;
  }
};

export default monitorReducer;
