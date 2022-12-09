import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { useTheme } from '@mui/material/styles';

import { getDeviceById } from '../../../actions/deviceActions';
import { getIdAttribute, getUserCapabilities } from '../../../selectors';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

export const DeviceConfiguration = ({ canReadDevices, device, idAttribute, item, getDeviceById, onClose }) => {
  const theme = useTheme();
  useEffect(() => {
    const { object } = item;
    if (!device && canReadDevices) {
      getDeviceById(object.id);
    }
  }, []);

  if (canReadDevices && !device) {
    return <Loader show={true} />;
  }

  const { actor, change } = item;

  let config;
  try {
    config = JSON.parse(change);
  } catch (error) {
    config = { error: `An error occurred processing the changed config:\n${error}` };
  }

  return (
    <div className="flexbox column" style={{ margin: theme.spacing(3), minWidth: 'min-content' }}>
      {canReadDevices && <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />}
      <DetailInformation title="changed configuration" details={config} />
      <DetailInformation title="change" details={{ User: actor.email }} />
    </div>
  );
};

const actionCreators = { getDeviceById };

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

export default connect(mapStateToProps, actionCreators)(DeviceConfiguration);
