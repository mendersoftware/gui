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
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { useTheme } from '@mui/material/styles';

import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { getDeviceById, getSessionDetails } from '../../../actions/deviceActions';
import { getIdAttribute, getUserCapabilities } from '../../../selectors';
import Loader from '../../common/loader';
import Time from '../../common/time';
import DeviceDetails, { DetailInformation } from './devicedetails';

momentDurationFormatSetup(moment);

export const PortForward = ({ canReadDevices, device, idAttribute, item, getDeviceById, getSessionDetails, onClose }) => {
  const theme = useTheme();
  const [sessionDetails, setSessionDetails] = useState();

  useEffect(() => {
    const { action, actor, meta, object, time } = item;
    if (canReadDevices && !device) {
      getDeviceById(object.id);
    }
    getSessionDetails(
      meta.session_id[0],
      object.id,
      actor.id,
      action.startsWith('open') ? time : undefined,
      action.startsWith('close') ? time : undefined
    ).then(setSessionDetails);
  }, []);

  if (!sessionDetails || (canReadDevices && !device)) {
    return <Loader show={true} />;
  }

  const sessionMeta = {
    'Session ID': item.meta.session_id[0],
    'Start time': <Time value={sessionDetails.start} />,
    'End time': <Time value={sessionDetails.end} />,
    'Duration': moment.duration(moment(sessionDetails.end).diff(sessionDetails.start)).format('*hh:*mm:ss:SSS'),
    User: item.actor.email
  };

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      {canReadDevices && <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />}
      <DetailInformation title="port forwarding" details={sessionMeta} />
    </div>
  );
};

const actionCreators = { getDeviceById, getSessionDetails };

const mapStateToProps = (state, ownProps) => {
  const { item = {} } = ownProps;
  const deviceId = item.object.id;
  const { canReadDevices } = getUserCapabilities(state);
  return {
    canReadDevices,
    device: state.devices.byId[deviceId],
    idAttribute: getIdAttribute(state).attribute
  };
};

export default connect(mapStateToProps, actionCreators)(PortForward);
