import React, { useState } from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

// material ui
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { InfoOutlined as InfoIcon, Delete as TrashIcon } from '@material-ui/icons';

import { deleteAuthset, getDeviceAuth, updateDeviceAuth } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { getDocsVersion } from '../../selectors';
import Authsetlist from './authsetlist';
import ConfirmDecommission from './confirmdecommission';

export const AuthsetsDialog = ({
  active,
  decommission,
  deleteAuthset,
  device,
  dialogToggle,
  docsVersion,
  getDeviceAuth,
  id_attribute,
  id_value,
  inactive,
  limitMaxed,
  open,
  updateDeviceAuth
}) => {
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
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth="lg"
      style={{
        paddingTop: '0',
        fontSize: '13px',
        overflow: 'hidden'
      }}
    >
      <DialogTitle>
        <div style={{ width: 'fit-content', position: 'relative' }}>
          {status === DEVICE_STATES.pending
            ? `Authorization ${pluralize('request', auth_sets.length)} for this device`
            : 'Authorization status for this device'}
          <div
            onClick={e => this._handleStopProp(e)}
            id="inventory-info"
            className="tooltip info"
            style={{ top: '5px', right: '-35px' }}
            data-tip
            data-for="inventory-wait"
            data-event="click focus"
          >
            <InfoIcon />
          </div>
          <ReactTooltip id="inventory-wait" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
            <h3>Device authorization status</h3>
            <p>
              Each device sends an authentication request containing its identity attributes and its current public key. You can accept, reject or dismiss these
              requests to determine the authorization status of the device.
            </p>
            <p>
              In cases such as key rotation, each device may have more than one identity/key combination listed. See the documentation for more on{' '}
              <a href={`https://docs.mender.io/${docsVersion}overview/device-authentication`} target="_blank" rel="noopener noreferrer">
                Device authentication
              </a>
              .
            </p>
          </ReactTooltip>
        </div>
      </DialogTitle>
      <DialogContent>
        <div style={{ minWidth: '900px' }}>
          {device.status === DEVICE_STATES.accepted || device.status === DEVICE_STATES.rejected ? decommissionButton : null}

          <div className="margin-bottom-small" style={{ fontSize: '15px', padding: '14px 40px 0px 20px', border: '1px solid #f1f2f3', width: 'fit-content' }}>
            <span className="bold margin-right">{id_attribute}</span>
            <span>{id_value}</span>
            <p>
              <span className="bold margin-right">Device status</span>
              <span className="capitalized inline-block">{device.status}</span>
            </p>
          </div>

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
      </DialogContent>
      <DialogActions>
        <Button key="authset-button-1" style={{ marginRight: '10px', display: 'inline-block' }} onClick={() => dialogToggle(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const actionCreators = { deleteAuthset, getDeviceAuth, updateDeviceAuth };

const mapStateToProps = (state, ownProps) => {
  const device = state.devices.byId[ownProps.device.id];
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
    docsVersion: getDocsVersion(state),
    ...authsets
  };
};

export default connect(mapStateToProps, actionCreators)(AuthsetsDialog);
