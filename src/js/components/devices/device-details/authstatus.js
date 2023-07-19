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
import React from 'react';

import { Block as BlockIcon, CheckCircle as CheckCircleIcon, Check as CheckIcon } from '@mui/icons-material';
import { Chip, Icon } from '@mui/material';

import pendingIcon from '../../../../assets/img/pending_status.png';
import { DEVICE_STATES } from '../../../constants/deviceConstants';
import { HELPTOOLTIPS, MenderHelpTooltip } from '../../helptips/helptooltips';
import Authsets from './authsets/authsets';
import DeviceDataCollapse from './devicedatacollapse';

const iconStyle = { margin: 12 };

const states = {
  default: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  pending: <Icon style={iconStyle} component="img" src={pendingIcon} />,
  accepted: <CheckCircleIcon className="green" style={iconStyle} />,
  rejected: <BlockIcon className="red" style={iconStyle} />,
  preauthorized: <CheckIcon style={iconStyle} />
};

export const AuthStatus = ({ decommission, device }) => {
  const { auth_sets = [], status = DEVICE_STATES.accepted } = device;

  let hasPending = '';
  if (status === DEVICE_STATES.accepted && auth_sets.length > 1) {
    hasPending = auth_sets.reduce((accu, set) => {
      return set.status === DEVICE_STATES.pending ? 'This device has a pending authentication set' : accu;
    }, hasPending);
  }

  const statusIcon = states[status] ? states[status] : states.default;
  const requestNotification = !!hasPending && <Chip size="small" label="new request" color="primary" />;

  return (
    <DeviceDataCollapse
      title={
        <div className="flexbox center-aligned">
          <h4>Authentication status</h4>
          <div className="flexbox center-aligned margin-left margin-right">
            <div className="capitalized">{status}</div>
            {statusIcon}
          </div>
          {requestNotification}
          {status === DEVICE_STATES.pending && <MenderHelpTooltip id={HELPTOOLTIPS.authButton.id} style={{ marginTop: 5 }} />}
        </div>
      }
    >
      <Authsets decommission={decommission} device={device} />
    </DeviceDataCollapse>
  );
};

export default AuthStatus;
