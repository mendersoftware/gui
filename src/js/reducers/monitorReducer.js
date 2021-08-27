import MonitorConstants from '../constants/monitorConstants';

export const initialState = {
  alerts: {
    byDeviceId: {}
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

    default:
      return state;
  }
};

export default monitorReducer;
