import React, { useState } from 'react';

import { Button, Chip, Icon } from '@material-ui/core';
import { Block as BlockIcon, Check as CheckIcon, CheckCircle as CheckCircleIcon } from '@material-ui/icons';

import pendingIcon from '../../../../assets/img/pending_status.png';
import { DEVICE_STATES, EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import { TwoColumnData } from '../../common/configurationobject';
import MaterialDesignIcon from '../../common/materialdesignicon';
import { AuthButton } from '../../helptips/helptooltips';
import DeviceDataCollapse from './devicedatacollapse';
import Authsets from './authsets/authsets';
import { DeviceConnectionNote } from './connection';

const iconStyle = { margin: 12 };

const states = {
  default: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  pending: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  accepted: <CheckCircleIcon className="green" style={iconStyle} />,
  rejected: <BlockIcon className="red" style={iconStyle} />,
  preauthorized: <CheckIcon style={iconStyle} />
};

export const AuthStatus = ({ decommission, device, deviceListRefresh, disableBottomBorder, setShowExternalConnectionDialog, setSnackbar, showHelptips }) => {
  const { auth_sets = [], external, isOffline, status = DEVICE_STATES.accepted } = device;
  let hasPending = '';
  if (status === DEVICE_STATES.accepted && auth_sets.length > 1) {
    hasPending = auth_sets.reduce((accu, set) => {
      return set.status === DEVICE_STATES.pending ? 'This device has a pending authentication set' : accu;
    }, hasPending);
  }

  const [open, setOpen] = useState(status === 'pending' || hasPending || !!external);

  let statusIcon = states[status] ? states[status] : states.default;
  if (external) {
    statusIcon = <MaterialDesignIcon path={EXTERNAL_PROVIDER[external.provider].icon} style={{ marginLeft: 4 }} />;
  }
  const requestNotification = !!hasPending && <Chip size="small" label="new request" color="primary" />;

  return (
    <DeviceDataCollapse
      disableBottomBorder={disableBottomBorder}
      header={!open && !external && <a onClick={setOpen}>show more</a>}
      isOpen={open}
      onClick={setOpen}
      title={
        <div className="flexbox center-aligned">
          <h4>Authentication status</h4>
          <div className="flexbox center-aligned margin-left margin-right">
            <div className="capitalized">{status}</div>
            {statusIcon}
          </div>
          {requestNotification}
          {showHelptips && (
            <div style={{ position: 'relative', width: 50, height: 30 }}>{status === DEVICE_STATES.pending && <AuthButton highlightHelp={true} />}</div>
          )}
        </div>
      }
    >
      {external ? (
        <>
          <TwoColumnData config={{ 'Device connection string': external.connectionString }} setSnackbar={setSnackbar} />
          {isOffline && (
            <div>
              <DeviceConnectionNote className="margin-small">
                Devices authenticated through {EXTERNAL_PROVIDER[external.provider].title} must have the Mender Client installed before they will connect to the
                Mender server.
              </DeviceConnectionNote>
              <Button onClick={() => setShowExternalConnectionDialog(true)}>Learn how to connect this device</Button>
            </div>
          )}
        </>
      ) : (
        <>
          <Authsets decommission={decommission} device={device} deviceListRefresh={deviceListRefresh} showHelptips={showHelptips} />
          <a onClick={() => setOpen(false)}>show less</a>
        </>
      )}
    </DeviceDataCollapse>
  );
};

export default AuthStatus;
