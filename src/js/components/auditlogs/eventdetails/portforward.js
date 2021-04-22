import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Time from 'react-time';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { getDeviceById, getSessionDetails } from '../../../actions/deviceActions';
import { getIdAttribute } from '../../../selectors';
import theme from '../../../themes/mender-theme';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

momentDurationFormatSetup(moment);

export const PortForward = ({ device, idAttribute, item, getDeviceById, getSessionDetails, onClose }) => {
  const [sessionDetails, setSessionDetails] = useState();

  useEffect(() => {
    const { action, actor, meta, object, time } = item;
    if (!device) {
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

  if (!(sessionDetails && device)) {
    return <Loader show={true} />;
  }

  const sessionMeta = {
    'Session ID': item.meta.session_id[0],
    'Start time': <Time value={sessionDetails.start} format="YYYY-MM-DD HH:mm" />,
    'End time': <Time value={sessionDetails.end} format="YYYY-MM-DD HH:mm" />,
    'Duration': moment.duration(moment(sessionDetails.end).diff(sessionDetails.start)).format('*hh:*mm:ss:SSS'),
    User: item.actor.email
  };

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />
      <DetailInformation title="port forwarding" details={sessionMeta} />
    </div>
  );
};

const actionCreators = { getDeviceById, getSessionDetails };

const mapStateToProps = (state, ownProps) => {
  const { item = {} } = ownProps;
  const deviceId = item.object.id;
  return {
    device: state.devices.byId[deviceId],
    idAttribute: getIdAttribute(state)
  };
};

export default connect(mapStateToProps, actionCreators)(PortForward);
