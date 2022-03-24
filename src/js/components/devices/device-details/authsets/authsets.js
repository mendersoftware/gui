import React, { useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

// material ui
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { deleteAuthset, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_DISMISSAL_STATE, DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed } from '../../../../selectors';
import Confirm from './../../../common/confirm';
import { DeviceLimitWarning } from '../../dialogs/preauth-dialog';
import Authsetlist from './authsetlist';

export const Authsets = ({
  acceptedDevices,
  decommission,
  deleteAuthset,
  device,
  deviceLimit,
  deviceListRefresh,
  limitMaxed,
  showHelptips,
  updateDeviceAuth
}) => {
  const theme = useTheme();
  const [confirmDecommission, setConfirmDecomission] = useState(false);
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
          // on finish, change "loading" back to null
          .finally(postUpdateSteps)
      );
    }
  };

  return (
    <div style={{ minWidth: 700, marginBottom: theme.spacing(2), backgroundColor: '#f7f7f7', border: '1px solid rgb(224, 224, 224)', padding: '16px' }}>
      <div className="margin-bottom-small">
        {status === DEVICE_STATES.pending ? `Authorization ${pluralize('request', auth_sets.length)}` : 'Authorization sets'}
      </div>
      <Authsetlist
        limitMaxed={limitMaxed}
        total={auth_sets.length}
        confirm={updateDeviceAuthStatus}
        loading={loading}
        device={device}
        showHelptips={showHelptips}
      />
      {limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedDevices} deviceLimit={deviceLimit} hasContactInfo />}
      {![DEVICE_STATES.preauth, DEVICE_STATES.pending].includes(device.status) && (
        <div className="flexbox" style={{ justifyContent: 'flex-end', marginTop: theme.spacing(2) }}>
          {confirmDecommission ? (
            <Confirm action={() => decommission(device.id)} cancel={() => setConfirmDecomission(false)} type="decommissioning" />
          ) : (
            <Button color="secondary" onClick={setConfirmDecomission}>
              Decommission device
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const actionCreators = { deleteAuthset, updateDeviceAuth };

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
