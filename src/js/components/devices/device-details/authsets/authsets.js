import React, { useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import { deleteAuthset, getDeviceAuth, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_DISMISSAL_STATE, DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed } from '../../../../selectors';
import theme from '../../../../themes/mender-theme';
import { DeviceLimitWarning } from '../../preauth-dialog';
import Authsetlist from './authsetlist';

export const Authsets = ({
  acceptedDevices,
  deleteAuthset,
  device,
  deviceLimit,
  deviceListRefresh,
  getDeviceAuth,
  limitMaxed,
  showHelptips,
  updateDeviceAuth
}) => {
  const [loading, setLoading] = useState(false);
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  const updateDeviceAuthStatus = (device_id, auth_id, status) => {
    setLoading(auth_id);
    const postUpdateSteps = () => {
      deviceListRefresh();
      setLoading(null);
    };

    if (status === DEVICE_DISMISSAL_STATE) {
      return (
        deleteAuthset(device_id, auth_id)
          // on finish, change "loading" back to null
          .finally(postUpdateSteps)
      );
    } else {
      // call API to update authset
      return (
        updateDeviceAuth(device_id, auth_id, status)
          // refresh authset list
          .then(() => getDeviceAuth(device_id))
          // on finish, change "loading" back to null
          .finally(postUpdateSteps)
      );
    }
  };

  return (
    <div style={{ minWidth: 700, marginBottom: theme.spacing(2), backgroundColor: '#f7f7f7', border: '1px solid rgb(224, 224, 224)', padding: '16px' }}>
      <div>{status === DEVICE_STATES.pending ? `Authorization ${pluralize('request', auth_sets.length)}` : 'Authentication sets'}</div>
      <Authsetlist
        limitMaxed={limitMaxed}
        total={auth_sets.length}
        confirm={updateDeviceAuthStatus}
        loading={loading}
        device={device}
        showHelptips={showHelptips}
      />
      {limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedDevices} deviceLimit={deviceLimit} hasContactInfo />}
    </div>
  );
};

const actionCreators = { deleteAuthset, getDeviceAuth, updateDeviceAuth };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id] || {};
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    device,
    deviceLimit: state.devices.limit,
    limitMaxed: getLimitMaxed(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Authsets);
