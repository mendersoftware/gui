import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { getDeviceById } from '../../../actions/deviceActions';
import { getIdAttribute } from '../../../selectors';
import theme from '../../../themes/mender-theme';
import Loader from '../../common/loader';
import DeviceDetails, { DetailInformation } from './devicedetails';

export const DeviceConfiguration = ({ device, idAttribute, item, getDeviceById, onClose }) => {
  useEffect(() => {
    const { object } = item;
    if (!device) {
      getDeviceById(object.id);
    }
  }, []);

  if (!device) {
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
      <DeviceDetails device={device} idAttribute={idAttribute} onClose={onClose} />
      <DetailInformation title="changed configuration" details={config} />
      <DetailInformation title="change" details={{ User: actor.email }} />
    </div>
  );
};

const actionCreators = { getDeviceById };

const mapStateToProps = (state, ownProps) => {
  const { item = {} } = ownProps;
  const deviceId = item.object.id;
  return {
    device: state.devices.byId[deviceId],
    idAttribute: getIdAttribute(state)
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceConfiguration);
