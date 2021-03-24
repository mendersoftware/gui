import React, { useState } from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

// material ui
import { Button } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Delete as TrashIcon } from '@material-ui/icons';

import { deleteAuthset, getDeviceAuth, updateDeviceAuth } from '../../../../actions/deviceActions';
import { DEVICE_STATES } from '../../../../constants/deviceConstants';
import { getLimitMaxed } from '../../../../selectors';
import Authsetlist from './authsetlist';
import ConfirmDecommission from './confirmdecommission';

export const Authsets = ({ active, decommission, deleteAuthset, device, dialogToggle, getDeviceAuth, inactive, limitMaxed, updateDeviceAuth }) => {
  const [confirmDecommission, setConfirmDecomission] = useState(false);
  const [loading, setLoading] = useState(false);
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  const updateDeviceAuthStatus = (device_id, auth_id, status) => {
    setLoading(auth_id);
    let changeRequest;
    if (status === 'dismiss') {
      changeRequest = deleteAuthset(device_id, auth_id);
    } else {
      // call API to update authset
      changeRequest = updateDeviceAuth(device_id, auth_id, status);
    }
    return (
      changeRequest
        .then(() => {
          // if only authset, close dialog and refresh!
          if (device.auth_sets.length <= 1) {
            return Promise.resolve(dialogToggle('authsets'));
          }
          // refresh authset list
          return getDeviceAuth(device_id);
        })
        // on finish, change "loading" back to null
        .finally(() => setLoading(null))
    );
  };

  let decommissionButton = (
    <div className="float-right">
      <Button
        color="secondary"
        onClick={() => setConfirmDecomission(true)}
        icon={<TrashIcon style={{ height: '18px', width: '18px', verticalAlign: 'middle' }} />}
      >
        Decommission device
      </Button>
    </div>
  );
  if (confirmDecommission) {
    decommissionButton = <ConfirmDecommission cancel={() => setConfirmDecomission(false)} decommission={() => decommission(device.id)} />;
  }

  return (
    <div>
      <div style={{ width: 'fit-content', position: 'relative' }}>
        {status === DEVICE_STATES.pending ? `Authorization ${pluralize('request', auth_sets.length)} for this device` : 'Authorization status for this device'}
      </div>
      <div style={{ minWidth: '900px' }}>
        {device.status === DEVICE_STATES.accepted || device.status === DEVICE_STATES.rejected ? decommissionButton : null}
        {!!active.length && (
          <Authsetlist
            limitMaxed={limitMaxed}
            total={device.auth_sets.length}
            confirm={updateDeviceAuthStatus}
            loading={loading}
            device={device}
            active={true}
            authsets={active}
          />
        )}
        <div className="margin-top-large margin-bottom auto" />
        {!!inactive.length && (
          <div>
            <h4 className="align-center">Inactive authentication sets</h4>
            {
              <Authsetlist
                limitMaxed={limitMaxed}
                total={device.auth_sets.length}
                confirm={updateDeviceAuthStatus}
                loading={loading}
                device={device}
                hideHeader={active.length}
                authsets={inactive}
              />
            }
          </div>
        )}
        {limitMaxed && (
          <div className="warning">
            <InfoIcon style={{ marginRight: '2px', height: '16px', verticalAlign: 'bottom' }} />
            You have reached your limit of authorized devices.
            <p>
              Contact us by email at <a href="mailto:support@mender.io">support@mender.io</a> to request a higher limit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
const actionCreators = { deleteAuthset, getDeviceAuth, updateDeviceAuth };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id] || {};
  let authsets = { active: [], inactive: [] };
  authsets = device.auth_sets
    ? device.auth_sets.reduce(
        // for each authset compare the device status and if it matches authset status, put it in correct listv
        (accu, authset) => {
          if (authset.status === device.status) {
            accu.active.push(authset);
          } else {
            accu.inactive.push(authset);
          }
          return accu;
        },
        { active: [], inactive: [] }
      )
    : authsets;
  return {
    device,
    limitMaxed: getLimitMaxed(state),
    ...authsets
  };
};

export default connect(mapStateToProps, actionCreators)(Authsets);
