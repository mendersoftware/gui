import React from 'react';
import { Link } from 'react-router-dom';
import Time from 'react-time';
import isEqual from 'lodash.isequal';

// material ui
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import { statusToPercentage, formatTime } from '../../helpers';

export default class ProgressDeviceList extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      prevDevices: {}
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }
  componentDidUpdate(prevProps) {
    this.setState({ prevDevices: prevProps.devices });
  }
  render() {
    var self = this;
    var intervalsSinceStart = Math.floor((Date.now() - Date.parse(self.props.created)) / (1000 * 20));

    var deviceList = [];
    var currentArtifactLink;
    if (this.props.devices) {
      deviceList = this.props.devices.map(function(device, index) {
        var time = '-';
        if (device.finished) {
          time = <Time value={formatTime(device.finished)} format="YYYY-MM-DD HH:mm" />;
        }
        var encodedDevice = `id=${device.id}`;
        var id_attribute = device.id;

        if ((self.props.globalSettings || {}).id_attribute && (self.props.globalSettings || {}).id_attribute !== 'Device ID') {
          // if global setting is not "Device Id"
          if ((self.props.deviceIdentity || {})[device.id]) {
            // if device identity data is available, set custom attribute
            id_attribute = self.props.deviceIdentity[device.id][self.props.globalSettings.id_attribute];
          } else {
            id_attribute = '-';
          }
        }

        var deviceLink = (
          <Link style={{ fontWeight: '500' }} to={`/devices/${encodedDevice}`}>
            {id_attribute}
          </Link>
        );

        if (typeof this.props.deviceInventory !== 'undefined') {
          if (typeof this.props.deviceInventory[device.id] !== 'undefined') {
            var encodedArtifactName = encodeURIComponent((this.props.deviceInventory[device.id] || {}).artifact);
            currentArtifactLink = (
              <Link style={{ fontWeight: '500' }} to={`/releases/${encodedArtifactName}`}>
                {(this.props.deviceInventory[device.id] || {}).artifact}
              </Link>
            );

            var device_type = (this.props.deviceInventory[device.id] || {}).device_type;
          }
        }

        var status = (function(status) {
          switch (status) {
          case 'noartifact':
            return 'No artifact';
          case 'already-installed':
            device.percentage = 100;
            return 'Already installed';
          default:
            device.percentage = statusToPercentage(device.status, intervalsSinceStart);
            return device.status.charAt(0).toUpperCase() + device.status.slice(1);
          }
        })(device.status);

        var statusText = (function(status, substate) {
          if (status && substate) {
            return (
              <div className="flexbox">
                <div style={{ verticalAlign: 'top' }}>{status}: </div>
                <div className="substate">{substate}</div>
              </div>
            );
          }
          if (status) {
            return `${status}`;
          }
        })(status, device.substate || '');

        const devicePercentage = device.percentage || 0;
        const progressColor = status && (status.toLowerCase() === 'failure' || status.toLowerCase() === 'aborted') ? 'secondary' : 'primary';

        return (
          <TableRow key={index}>
            <TableCell>{deviceLink}</TableCell>
            <TableCell>{device_type}</TableCell>
            <TableCell>{currentArtifactLink}</TableCell>
            <TableCell>
              <Time value={formatTime(device.created)} format="YYYY-MM-DD HH:mm" />
            </TableCell>
            <TableCell>{time}</TableCell>
            <TableCell style={{ paddingRight: '0px', position: 'relative', minWidth: 200 }}>
              {statusText}
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
      }, this);
    }
    const headerStyle = { position: 'sticky', top: 0, background: 'white', zIndex: 1 };
    return deviceList.length ? (
      <div style={{ maxHeight: '40vh', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={headerStyle} tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
                {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
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
