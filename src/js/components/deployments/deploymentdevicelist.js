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
    this.props.finished();
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
              <Link style={{ fontWeight: '500' }} to={`/artifacts/${encodedArtifactName}`}>
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
              <div>
                <div style={{ display: 'inline', verticalAlign: 'top' }}>{status}: </div>
                <div className="substate">{device.substate}</div>
              </div>
            );
          }
          if (status) {
            return `${status}`;
          }
        })(status, device.substate || '');

        var devicePercentage = (function(percentage) {
          return `${percentage}%`;
        })(device.percentage);

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
            <TableCell style={{ paddingRight: '0px' }}>
              <div style={{ marginTop: '5px' }}>{statusText}</div>
              <div>
                {!['pending', 'decommissioned', 'already-installed'].includes(device.status.toLowerCase()) && (
                  <div>
                    <div style={{ textAlign: 'end', color: '#aaaaaa' }}>
                      {!['aborted', 'failure', 'noartifact'].includes(device.status.toLowerCase()) ? devicePercentage : '0%'}
                    </div>
                    <LinearProgress color={progressColor} variant="determinate" value={device.percentage} />
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Button className={device.log ? null : 'hidden'} onClick={() => this.props.viewLog(device.id)}>
                View log
              </Button>
            </TableCell>
          </TableRow>
        );
      }, this);
    }

    return (
      <Table className={deviceList.length ? null : 'hidden'}>
        <TableHead>
          <TableRow>
            <TableCell tooltip={(this.props.globalSettings || {}).id_attribute || 'Device ID'}>
              {(this.props.globalSettings || {}).id_attribute || 'Device ID'}
            </TableCell>
            <TableCell tooltip="Device type">Device type</TableCell>
            <TableCell tooltip="Current software">Current software</TableCell>
            <TableCell tooltip="Started">Started</TableCell>
            <TableCell tooltip="Finished">Finished</TableCell>
            <TableCell tooltip="Deployment status">Deployment status</TableCell>
            <TableCell tooltip="" />
          </TableRow>
        </TableHead>
        <TableBody>{deviceList}</TableBody>
      </Table>
    );
  }
}
