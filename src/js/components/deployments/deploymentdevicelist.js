import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import isEqual from 'lodash.isequal';

// material ui
import { Button, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import AppStore from '../../stores/app-store';
import { statusToPercentage, formatTime } from '../../helpers';

const stateTitleMap = {
  noartifact: 'No artifact',
  'already-installed': 'Already installed'
};

export default class ProgressDeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      globalSettings: AppStore.getGlobalSettings() || {}
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }
  render() {
    var self = this;
    var intervalsSinceStart = Math.floor((Date.now() - Date.parse(self.props.created)) / (1000 * 20));
    const { globalSettings } = self.state;

    var deviceList = [];
    var currentArtifactLink;
    if (this.props.devices) {
      deviceList = this.props.devices.map((device, index) => {
        var encodedDevice = `id=${device.id}`;
        var id_attribute = device.id;

        if (globalSettings.id_attribute && globalSettings.id_attribute !== 'Device ID') {
          // if global setting is not "Device Id"
          if ((self.props.deviceIdentity || {})[device.id]) {
            // if device identity data is available, set custom attribute
            id_attribute = self.props.deviceIdentity[device.id][globalSettings.id_attribute];
          } else {
            id_attribute = '-';
          }
        }

        let device_type = '-';
        if (typeof this.props.deviceInventory !== 'undefined' && typeof this.props.deviceInventory[device.id] !== 'undefined') {
          var encodedArtifactName = encodeURIComponent((this.props.deviceInventory[device.id] || {}).artifact);
          currentArtifactLink = (
            <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
              {(this.props.deviceInventory[device.id] || {}).artifact}
            </Link>
          );

          device_type = (this.props.deviceInventory[device.id] || {}).device_type;
        }

        const status = stateTitleMap[device.status] || device.status;

        const devicePercentage = statusToPercentage(device.status, intervalsSinceStart) || 0;
        const progressColor = status && (status.toLowerCase() === 'failure' || status.toLowerCase() === 'aborted') ? 'secondary' : 'primary';

        return (
          <TableRow key={index}>
            <TableCell>
              <Link style={{ fontWeight: '500' }} to={`/devices/${encodedDevice}`}>
                {id_attribute}
              </Link>
            </TableCell>
            <TableCell>{device_type}</TableCell>
            <TableCell>{currentArtifactLink}</TableCell>
            <TableCell>
              <Time value={formatTime(device.created)} format="YYYY-MM-DD HH:mm" />
            </TableCell>
            <TableCell>{device.finished ? <Time value={formatTime(device.finished)} format="YYYY-MM-DD HH:mm" /> : '-'}</TableCell>
            <TableCell style={{ paddingRight: '0px', position: 'relative', minWidth: 200 }}>
              {device.substate ? (
                <div className="flexbox">
                  <div className="capitalized-start" style={{ verticalAlign: 'top' }}>{`${status}: `}</div>
                  <div className="substate">{device.substate}</div>
                </div>
              ) : (
                status
              )}
              {!['pending', 'decommissioned', 'already-installed'].includes(device.status.toLowerCase()) && (
                <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                  <div style={{ textAlign: 'end', color: '#aaaaaa' }}>{`${devicePercentage}%`}</div>
                  <LinearProgress color={progressColor} variant="determinate" value={devicePercentage} />
                </div>
              )}
            </TableCell>
            <TableCell>{device.log ? <Button onClick={() => this.props.viewLog(device.id)}>View log</Button> : null}</TableCell>
          </TableRow>
        );
      });
    }
    const headerStyle = { position: 'sticky', top: 0, background: 'white', zIndex: 1 };
    return deviceList.length ? (
      <div style={{ maxHeight: '40vh', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={headerStyle} tooltip={globalSettings.id_attribute || 'Device ID'}>
                {globalSettings.id_attribute || 'Device ID'}
              </TableCell>
              {['Device type', 'Current software', 'Started', 'Finished', 'Deployment status', ''].map((content, index) => (
                <TableCell key={`device-list-header-${index + 1}`} style={headerStyle} tooltip={content}>
                  {content}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{deviceList}</TableBody>
        </Table>
      </div>
    ) : null;
  }
}
