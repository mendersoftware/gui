import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import Global from '../settings/global';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';

const routes = {
  pending: {
    route: '/devices/pending',
    status: 'pending',
    title: 'Pending'
  },
  preauthorized: {
    route: '/devices/preauthorized',
    status: 'preauthorized',
    title: 'Preauthorized'
  },
  rejected: {
    route: '/devices/rejected',
    status: 'rejected',
    title: 'Rejected'
  },
  devices: {
    route: '/devices',
    status: 'devices',
    title: 'Device groups'
  }
};

export default class Devices extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = this._getInitialState();
  }

  componentWillMount() {
    AppStore.changeListener(this._onChange.bind(this));
  }

  componentDidMount() {
    clearAllRetryTimers();
    this._restartInterval();
  }

  componentWillUnmount() {
    clearAllRetryTimers();
    clearInterval(this.interval);
    AppStore.removeChangeListener(this._onChange.bind(this));
  }
  _getInitialState() {
    return {
      currentTab: this._getCurrentLabel(),
      tabIndex: this._updateActive(),
      acceptedCount: AppStore.getTotalAcceptedDevices(),
      rejectedCount: AppStore.getTotalRejectedDevices(),
      preauthCount: AppStore.getTotalPreauthDevices(),
      pendingCount: AppStore.getTotalPendingDevices(),
      refreshLength: 10000,
      showHelptips: AppStore.showHelptips(),
      deviceLimit: AppStore.getDeviceLimit()
    };
  }
  _onChange() {
    this.setState(this._getInitialState(), this._getAllCount);
  }

  _refreshAll() {
    AppActions.getDeviceCount('accepted');
    AppActions.getDeviceCount('rejected');
    AppActions.getDeviceCount('pending');
    AppActions.getDeviceCount('preauthorized');
  }

  _restartInterval() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(() => {
      self._refreshAll();
    }, self.state.refreshLength);
    self._refreshAll();
  }
  _changeTab() {
    AppActions.setSnackbar('');
  }
  /*
   * Get counts of devices
   */
  _getAllCount() {
    var self = this;
    var accepted = self.state.acceptedCount ? self.state.acceptedCount : 0;
    var rejected = self.state.rejectedCount ? self.state.rejectedCount : 0;
    self.setState({ allCount: accepted + rejected });
  }

  // nested tabs
  componentWillReceiveProps() {
    this.setState({ tabIndex: this._updateActive(), currentTab: this._getCurrentLabel() });
  }

  _updateActive(tab = this.context.router.route.match.params.status) {
    if (routes.hasOwnProperty(tab)) {
      return routes[tab].route;
    }
    return routes.devices.route;
  }

  _getCurrentLabel(tab = this.context.router.route.match.params.status) {
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
    self.context.router.history.push(route);
  }

  _openSettingsDialog() {
    var self = this;
    self.setState({ openIdDialog: !self.state.openIdDialog });
  }

  _pauseInterval() {
    var self = this;
    this.setState({ pause: !self.state.pause }, () => {
      // pause refresh interval when authset dialog is open
      self.state.pause ? clearInterval(self.interval) : self._restartInterval();
    });
  }

  render() {
    // nested tabs
    var duplicateActions = [
      <div key="duplicate-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <Button onClick={() => this.dialogToggle('openDeviceExists')}>Cancel</Button>
      </div>
    ];

    var pendingLabel = this.state.pendingCount ? `Pending (${this.state.pendingCount})` : 'Pending';

    const tabIndex = this.context.router.route.match.params.status || 'devices';
    return (
      <div style={{ marginTop: '-15px' }}>
        <Tabs value={tabIndex} onChange={() => this._changeTab()}>
          <Tab component={Link} label={routes.devices.title} value={routes.devices.status} to={routes.devices.route} />
          <Tab component={Link} label={pendingLabel} value={routes.pending.status} to={routes.pending.route} />
          <Tab component={Link} label={routes.preauthorized.title} value={routes.preauthorized.status} to={routes.preauthorized.route} />
          <Tab component={Link} label={routes.rejected.title} value={routes.rejected.status} to={routes.rejected.route} />
        </Tabs>
        {tabIndex === routes.pending.status && (
          <PendingDevices
            deviceLimit={this.state.deviceLimit}
            currentTab={this.state.currentTab}
            highlightHelp={!this.state.acceptedCount}
            openSettingsDialog={() => this._openSettingsDialog()}
            restart={() => this._restartInterval()}
            pause={() => this._pauseInterval()}
          />
        )}
        {tabIndex === routes.preauthorized.status && (
          <PreauthDevices
            deviceLimit={this.state.deviceLimit}
            currentTab={this.state.currentTab}
            refreshCount={() => AppActions.getDeviceCount('preauthorized')}
            openSettingsDialog={() => this._openSettingsDialog()}
            pause={() => this._pauseInterval()}
          />
        )}
        {tabIndex === routes.rejected.status && (
          <RejectedDevices
            deviceLimit={this.state.deviceLimit}
            currentTab={this.state.currentTab}
            openSettingsDialog={() => this._openSettingsDialog()}
            pause={() => this._pauseInterval()}
          />
        )}
        {tabIndex === routes.devices.status && (
          <DeviceGroups
            params={this.props.params}
            acceptedDevices={this.state.acceptedCount}
            allCount={this.state.allCount}
            currentTab={this.state.currentTab}
            openSettingsDialog={() => this._openSettingsDialog()}
            pause={() => this._pauseInterval()}
          />
        )}

        <Dialog open={this.state.openDeviceExists || false}>
          <DialogTitle>Device with this identity data already exists</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <p>This will remove the group from the list. Are you sure you want to continue?</p>

            <p>
              A device with matching identity data already exists. If you still want to accept {pluralize('this', this.state.duplicates)} pending{' '}
              {pluralize('device', this.state.duplicates)}, you should first remove the following {pluralize('device', this.state.duplicates)}:
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
                {(this.state.duplicates || []).map(function(device) {
                  var status = device.status === 'accepted' ? '' : `/${device.status}`;
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

        <Dialog open={this.state.openIdDialog || false}>
          <DialogTitle>Default device identity attribute</DialogTitle>
          <DialogContent style={{ overflow: 'hidden' }}>
            <Global dialog={true} closeDialog={() => this._openSettingsDialog()} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
