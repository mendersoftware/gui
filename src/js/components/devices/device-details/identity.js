import React from 'react';
import Time from 'react-time';

import { List } from '@material-ui/core';

import { DEVICE_STATES } from '../../../constants/deviceConstants';
import ExpandableAttribute from '../../common/expandable-attribute';

export const DeviceIdentity = ({ device, setSnackbar }) => {
  const { created_ts, id, identity_data, status = DEVICE_STATES.accepted } = device;

  let deviceIdentity = [<ExpandableAttribute key="id_checksum" primary="Device ID" secondary={id || '-'} copyToClipboard={true} setSnackbar={setSnackbar} />];
  if (identity_data) {
    deviceIdentity = Object.entries(identity_data).reduce((accu, item) => {
      accu.push(<ExpandableAttribute key={item[0]} primary={item[0]} secondary={item[1]} copyToClipboard={true} setSnackbar={setSnackbar} />);
      return accu;
    }, deviceIdentity);
  }

  if (created_ts) {
    var createdTime = <Time value={created_ts} format="YYYY-MM-DD HH:mm" />;
    deviceIdentity.push(
      <ExpandableAttribute
        key="connectionTime"
        primary={status === DEVICE_STATES.preauth ? 'Date added' : 'First request'}
        secondary={createdTime}
        copyToClipboard={true}
        setSnackbar={setSnackbar}
      />
    );
  }

  return (
    <div className="margin-bottom-small">
      <h4 className="margin-bottom-none">Device identity</h4>
      <List className="list-horizontal-flex">{deviceIdentity}</List>
    </div>
  );
};

export default DeviceIdentity;
