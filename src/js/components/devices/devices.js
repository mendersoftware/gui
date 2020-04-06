import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import pluralize from 'pluralize';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

import { setSnackbar } from '../../actions/appActions';
import { getAllDeviceCounts, selectDevice, setDeviceFilters } from '../../actions/deviceActions';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Global from '../settings/global';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';

const routes = {
  pending: {
    route: '/devices/pending',
    status: DEVICE_STATES.pending,
    title: 'Pending'
  },
  preauthorized: {
    route: '/devices/preauthorized',
    status: DEVICE_STATES.preauth,
    title: 'Preauthorized'
  },
  rejected: {
    route: '/devices/rejected',
    status: DEVICE_STATES.rejected,
    title: 'Rejected'
  },
  devices: {
    route: '/devices',
    status: 'devices',
    title: 'Device groups'
  }
};

const refreshLength = 10000;

export class Devices extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentTab: this._getCurrentLabel(),
      tabIndex: this._updateActive()
    };
  }

  componentDidMount() {
    clearAllRetryTimers(this.props.setSnackbar);
    this._restartInterval();
    this.props.getAllDeviceCounts();
    if (this.props.match.params.filters) {
      var str = decodeURIComponent(this.props.match.params.filters);
      const filters = str.split('&').map(filter => {
        const filterPair = filter.split('=');
        return { key: filterPair[0], value: filterPair[1] };
      });
      this.props.setDeviceFilters(filters);
    }
  }

  // nested tabs
  componentDidUpdate() {
    const tabIndex = this._updateActive();
    const currentTab = this._getCurrentLabel();
    if (this.state.tabIndex !== tabIndex || this.state.currentTab !== currentTab) {
      this.setState({ tabIndex, currentTab });
    }
  }

  componentWillUnmount() {
    clearAllRetryTimers(this.props.setSnackbar);
    clearInterval(this.interval);
  }

  _restartInterval() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(() => {
      self.props.getAllDeviceCounts();
    }, refreshLength);
    self.props.getAllDeviceCounts();
  }
  _changeTab() {
    this.props.setSnackbar('');
  }

  _updateActive(tab = this.props.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.devices.route;
  }

  _getCurrentLabel(tab = this.props.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].title;
    }
    return routes.devices.title;
  }

  dialogToggle(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  }

  _openRejectDialog(device, status) {
    device.status = status;
    this.setState({ rejectDialog: true, deviceToReject: device });
  }

  _redirect(route) {
    var self = this;
    self.setState({ openDeviceExists: false });
    self.props.history.push(route);
  }

  _openSettingsDialog() {
    var self = this;
    self.setState({ openIdDialog: !self.state.openIdDialog });
  }

  render() {
    const { acceptedCount, match, pendingCount } = this.props;
    const { currentTab, duplicates, openDeviceExists, openIdDialog } = this.state;

    // nested tabs
    const duplicateActions = [
      <div key="duplicate-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogToggle('openDeviceExists')}>Cancel</Button>
      </div>
    ];

    var pendingLabel = pendingCount ? `Pending (${pendingCount})` : 'Pending';

    const tabIndex = match.params.status || 'devices';
    return (
      <div>
        <Tabs value={tabIndex} onChange={() => this._changeTab()}>
          <Tab component={Link} label={routes.devices.title} value={routes.devices.status} to={routes.devices.route} />
          <Tab component={Link} label={pendingLabel} value={routes.pending.status} to={routes.pending.route} />
          <Tab component={Link} label={routes.preauthorized.title} value={routes.preauthorized.status} to={routes.preauthorized.route} />
          <Tab component={Link} label={routes.rejected.title} value={routes.rejected.status} to={routes.rejected.route} />
        </Tabs>
        {tabIndex === routes.pending.status && (
          <PendingDevices
            currentTab={currentTab}
            highlightHelp={!acceptedCount}
            openSettingsDialog={() => this._openSettingsDialog()}
            restart={() => this._restartInterval()}
          />
        )}
        {tabIndex === routes.preauthorized.status && <PreauthDevices currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} />}
        {tabIndex === routes.rejected.status && <RejectedDevices currentTab={currentTab} openSettingsDialog={() => this._openSettingsDialog()} />}
        {tabIndex === routes.devices.status && (
          <DeviceGroups
            params={match.params}
            acceptedDevices={acceptedCount}
            highlightHelp={!acceptedCount}
            currentTab={currentTab}
            openSettingsDialog={() => this._openSettingsDialog()}
          />
        )}

        {openDeviceExists && (
          <Dialog open={openDeviceExists || false}>
            <DialogTitle>Device with this identity data already exists</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              <p>This will remove the group from the list. Are you sure you want to continue?</p>
              <p>
                A device with matching identity data already exists. If you still want to accept {pluralize('this', duplicates)} pending{' '}
                {pluralize('device', duplicates)}, you should first remove the following {pluralize('device', duplicates)}:
              </p>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="columnHeader" tooltip="ID">
                      ID
                    </TableCell>
                    <TableCell className="columnHeader" tooltip="Status">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(duplicates || []).map(device => {
                    const status = device.status === DEVICE_STATES.accepted ? '' : `/${device.status}`;
                    return (
                      <TableRow hover key={device.device_id}>
                        <TableCell>
                          <a onClick={() => this._redirect(`/devices${status}/id%3D${device.device_id}`)}>{device.device_id}</a>
                        </TableCell>
                        <TableCell className="capitalized">{device.status}</TableCell>
                      </TableRow>
                    );
                  }, this)}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>{duplicateActions}</DialogActions>
          </Dialog>
        )}

        {openIdDialog && (
          <Dialog open={openIdDialog || false}>
            <DialogTitle>Default device identity attribute</DialogTitle>
            <DialogContent style={{ overflow: 'hidden' }}>
              <Global dialog={true} closeDialog={() => this._openSettingsDialog()} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }
}

const actionCreators = { getAllDeviceCounts, selectDevice, setDeviceFilters, setSnackbar };

const mapStateToProps = state => {
  let devices = state.devices.selectedDeviceList;
  return {
    acceptedCount: state.devices.byStatus.accepted.total,
    devices,
    pendingCount: state.devices.byStatus.pending.total
  };
};

export default withRouter(connect(mapStateToProps, actionCreators)(Devices));
