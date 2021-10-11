import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { getDeviceById, getSessionDetails } from '../../../actions/deviceActions';
import { getIdAttribute } from '../../../selectors';
import theme from '../../../themes/mender-theme';
import Loader from '../../common/loader';
import LocaleTime from '../../common/localetime';
import DeviceDetails, { DetailInformation } from './devicedetails';
import TerminalPlayer from './terminalplayer';

momentDurationFormatSetup(moment);

export const TerminalSession = ({ device, idAttribute, item, getDeviceById, getSessionDetails, onClose }) => {
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
    'Start time': <LocaleTime value={sessionDetails.start} />,
    'End time': <LocaleTime value={sessionDetails.end} />,
    'Duration': moment.duration(moment(sessionDetails.end).diff(sessionDetails.start)).format('*hh:*mm:ss:SSS'),
    User: item.actor.email
  };

  return (
    <div className="flexbox" style={{ flexWrap: 'wrap' }}>
      <TerminalPlayer className="flexbox column margin-top" item={item} sessionInitialized={!!sessionDetails} />
      <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
        <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />
        <DetailInformation title="session" details={sessionMeta} />
      </div>
    </div>
  );
};

const actionCreators = { getDeviceById, getSessionDetails };

const mapStateToProps = (state, ownProps) => {
  const { item = {} } = ownProps;
  const deviceId = item.object.id;
  return {
    device: state.devices.byId[deviceId],
    idAttribute: getIdAttribute(state).attribute
  };
};

export default connect(mapStateToProps, actionCreators)(TerminalSession);
