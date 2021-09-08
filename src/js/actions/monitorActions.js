import { commonErrorHandler, setSnackbar } from './appActions';
import Api from '../api/general-api';
import MonitorConstants from '../constants/monitorConstants';

const apiUrlv1 = '/api/management/v1';
export const monitorApiUrlv1 = `${apiUrlv1}/devicemonitor`;

const defaultPerPage = 20;
const defaultPage = 1;

export const getDeviceAlerts = (id, config = {}) => dispatch => {
  const { page = defaultPage, perPage = defaultPerPage, issuedBefore, issuedAfter, sortAscending = false } = config;
  const issued_after = issuedAfter ? `&issued_after=${issuedAfter}` : '';
  const issued_before = issuedBefore ? `&issued_before=${issuedBefore}` : '';
  return Api.get(`${monitorApiUrlv1}/devices/${id}/alerts?page=${page}&per_page=${perPage}${issued_after}${issued_before}&sort_ascending=${sortAscending}`)
    .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
    .then(res =>
      Promise.resolve(
        dispatch({
          type: MonitorConstants.RECEIVE_DEVICE_ALERTS,
          deviceId: id,
          alerts: res.data
        })
      )
    );
};

export const getLatestDeviceAlerts = (id, config = {}) => dispatch => {
  const { page = defaultPage, perPage = 10 } = config;
  return Api.get(`${monitorApiUrlv1}/devices/${id}/alerts/latest?page=${page}&per_page=${perPage}`)
    .catch(err => commonErrorHandler(err, `Retrieving device alerts for device ${id} failed:`, dispatch))
    .then(res =>
      Promise.resolve(
        dispatch({
          type: MonitorConstants.RECEIVE_LATEST_DEVICE_ALERTS,
          deviceId: id,
          alerts: res.data
        })
      )
    );
};

export const changeNotificationSetting = (enabled, channel = MonitorConstants.alertChannels.email) => dispatch => {
  return Api.put(`${monitorApiUrlv1}/settings/global/channel/alerts/${channel}/status`, { enabled })
    .catch(err => commonErrorHandler(err, `${enabled ? 'En' : 'Dis'}abling  ${channel} alerts failed:`, dispatch))
    .then(() =>
      Promise.all([
        dispatch({
          type: MonitorConstants.CHANGE_ALERT_CHANNEL,
          channel,
          enabled
        }),
        dispatch(setSnackbar(`Successfully ${enabled ? 'en' : 'dis'}abled ${channel} alerts`, 5000))
      ])
    );
};
