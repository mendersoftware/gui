import React from 'react';
import { connect } from 'react-redux';

// material ui
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import { getIdAttribute } from '../../../selectors';
import DeploymentDeviceListItem from './deploymentdevicelistitem';

const headerStyle = { position: 'sticky', top: 0, background: 'white', zIndex: 1 };

const ProgressDeviceList = ({ created, devices, idAttribute, retries, viewLog }) => (
  <div style={{ maxHeight: '40vh', overflowX: 'auto' }}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell style={headerStyle} tooltip={idAttribute}>
            {idAttribute}
          </TableCell>
          {['Device type', 'Current software', 'Started', 'Finished', 'Attempts', 'Deployment status', ''].map((content, index) =>
            content != 'Attempts' || retries ? (
              <TableCell key={`device-list-header-${index + 1}`} style={headerStyle} tooltip={content}>
                {content}
              </TableCell>
            ) : null
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {devices.map(device => (
          <DeploymentDeviceListItem key={device.id} created={created} device={device} idAttribute={idAttribute} viewLog={viewLog} />
        ))}
      </TableBody>
    </Table>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  return {
    devices: ownProps.devices.map(device => ({ attributes: {}, ...state.devices.byId[device.id], ...device })),
    idAttribute: getIdAttribute(state)
  };
};

export default connect(mapStateToProps)(ProgressDeviceList);
