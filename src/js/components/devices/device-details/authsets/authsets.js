// Copyright 2021 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React, { useState } from 'react';
import { connect } from 'react-redux';

// material ui
import { Button } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import pluralize from 'pluralize';

import { deleteAuthset, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_DISMISSAL_STATE, DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed, getUserCapabilities } from '../../../../selectors';
import { DeviceLimitWarning } from '../../dialogs/preauth-dialog';
import Confirm from './../../../common/confirm';
import Authsetlist from './authsetlist';

const useStyles = makeStyles()(theme => ({
  decommission: { justifyContent: 'flex-end', marginTop: theme.spacing(2) },
  wrapper: {
    backgroundColor: theme.palette.grey[400],
    borderColor: theme.palette.grey[500],
    borderStyle: 'solid',
    borderWidth: 1,
    marginBottom: theme.spacing(2),
    minWidth: 700,
    padding: theme.spacing(2)
  }
}));

export const Authsets = ({
  acceptedDevices,
  decommission,
  deleteAuthset,
  device,
  deviceLimit,
  deviceListRefresh,
  limitMaxed,
  showHelptips,
  updateDeviceAuth,
  userCapabilities
}) => {
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

  const { canManageDevices } = userCapabilities;
  const { classes } = useStyles();
  return (
    <div className={classes.wrapper}>
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
        userCapabilities={userCapabilities}
      />
      {limitMaxed && <DeviceLimitWarning acceptedDevices={acceptedDevices} deviceLimit={deviceLimit} hasContactInfo />}
      {![DEVICE_STATES.preauth, DEVICE_STATES.pending].includes(device.status) && canManageDevices && (
        <div className={`flexbox ${classes.decommission}`}>
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
    limitMaxed: getLimitMaxed(state),
    userCapabilities: getUserCapabilities(state)
  };
};

export default connect(mapStateToProps, actionCreators)(Authsets);
