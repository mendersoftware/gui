import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

import { Launch as LaunchIcon } from '@material-ui/icons';

import { getDeviceById, getSessionDetails } from '../../../actions/deviceActions';
import { getIdAttribute } from '../../../selectors';
import theme from '../../../themes/mender-theme';
import Loader from '../../common/loader';
import { formatTime } from '../../../helpers';
import TerminalPlayer from './terminalplayer';

momentDurationFormatSetup(moment);

const BEGINNING_OF_TIME = '2020-01-01T00:00:00.000Z';

export const TerminalSession = ({ device, idAttribute, item, getDeviceById, getSessionDetails }) => {
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

  const { name, device_type, artifact_name } = device.attributes;
  const usesId = !idAttribute || idAttribute === 'id' || idAttribute === 'Device ID';
  const nameContainer = name ? { Name: name } : {};
  const deviceDetails = {
    ...nameContainer,
    [usesId ? 'Device ID' : idAttribute]: (
      <div className="flexbox" style={{ alignItems: 'center' }}>
        <span>{usesId ? device.id : device.attributes[idAttribute]}</span>
        <LaunchIcon className="margin-left-small link-color" fontSize="small" />
      </div>
    ),
    'Device type': device_type,
    'System software version': device['rootfs-image.version'] || artifact_name || '-',
    ' ': <Link to={`/auditlog?object_id=${item.object.id}&start_date=${BEGINNING_OF_TIME}`}>List all log entries for this device</Link>
  };

  const sessionMeta = {
    'Session ID': item.object.id,
    'Start time': <Time value={formatTime(sessionDetails.start)} format="YYYY-MM-DD HH:mm" />,
    'End time': <Time value={formatTime(sessionDetails.end)} format="YYYY-MM-DD HH:mm" />,
    'Duration': moment.duration(moment(sessionDetails.end).diff(sessionDetails.start)).format('*hh:*mm:ss:SSS'),
    User: item.actor.email
  };

  const sessionInformation = {
    device: deviceDetails,
    session: sessionMeta
  };

  return (
    <div className="flexbox" style={{ flexWrap: 'wrap' }}>
      <TerminalPlayer className="flexbox column margin-top" item={item} sessionInitialized={!!sessionDetails} />
      <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
        {Object.entries(sessionInformation).map(([title, details]) => (
          <div key={`${title}-details`} className="flexbox column margin-top-small">
            <b className="margin-bottom-small capitalized-start">{title} details</b>
            <div className="text-muted two-columns" style={{ gridTemplateColumns: 'minmax(max-content, 150px) max-content', rowGap: theme.spacing(2.5) }}>
              {Object.entries(details).map(([key, value]) => (
                <Fragment key={key}>
                  <div className="align-right">
                    <b>{key}</b>
                  </div>
                  <div>{value}</div>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
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
    idAttribute: getIdAttribute(state)
  };
};

export default connect(mapStateToProps, actionCreators)(TerminalSession);
