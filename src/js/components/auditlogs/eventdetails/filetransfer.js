import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { getDeviceById } from '../../../actions/deviceActions';
import { getIdAttribute } from '../../../selectors';
import { useTheme } from '@mui/material/styles';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

export const FileTransfer = ({ device, idAttribute, item, getDeviceById, onClose }) => {
  const theme = useTheme();

  useEffect(() => {
    const { object } = item;
    if (!device) {
      getDeviceById(object.id);
    }
  }, []);

  if (!device) {
    return <Loader show={true} />;
  }

  const {
    actor,
    meta: { path = [] }
  } = item;
  const sessionMeta = {
    Path: path.join(','),
    User: actor.email
  };

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />
      <DetailInformation title="file transfer" details={sessionMeta} />
    </div>
  );
};

const actionCreators = { getDeviceById };

const mapStateToProps = (state, ownProps) => {
  const { item = {} } = ownProps;
  const deviceId = item.object.id;
  return {
    device: state.devices.byId[deviceId],
    idAttribute: getIdAttribute(state).attribute
  };
};

export default connect(mapStateToProps, actionCreators)(FileTransfer);
