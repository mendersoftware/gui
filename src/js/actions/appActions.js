import AppConstants from '../constants/app-constants';
import * as Helpers from '../helpers';
import GeneralApi from '../api/general-api';

const hostedLinks = 'https://s3.amazonaws.com/hosted-mender-artifacts-onboarding/';

export const sortTable = (table, column, direction) => dispatch =>
  dispatch({
    type: AppConstants.SORT_TABLE,
    table: table,
    column: column,
    direction: direction
  });

/* 
  General 
*/
export const setSnackbar = (message, duration, action, component, onClick, onClose) => dispatch =>
  dispatch({
    type: AppConstants.SET_SNACKBAR,
    snackbar: {
      open: message ? true : false,
      message: message,
      maxWidth: '900px',
      autoHideDuration: duration,
      action: action,
      children: component,
      onClick: onClick,
      onClose: onClose
    }
  });

export const getHostedLinks = id => dispatch =>
  GeneralApi.getNoauth(`${hostedLinks}${id}/links.json`).then(res => dispatch({ type: AppConstants.RECEIVED_HOSTED_LINKS, links: JSON.parse(res.text) }));

export const findLocalIpAddress = () => dispatch =>
  Helpers.findLocalIpAddress().then(ipAddress => dispatch({ type: AppConstants.SET_LOCAL_IPADDRESS, ipAddress }));
