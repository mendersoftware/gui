import React from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { DevicesNav } from '../helptips/helptooltips';
import Global from '../settings/global';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';
import { AppContext } from '../../contexts/app-context';

const routes = {
  pending: {
    route: '/devices/pending',
    title: 'Pending'
  },
  preauthorized: {
    route: '/devices/preauthorized',
    title: 'Preauthorized'
  },
  rejected: {
    route: '/devices/rejected',
    title: 'Rejected'
  },
  devices: {
    route: '/devices',
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
    this.setState(this._getInitialState());
  }

  _refreshAll() {
    this._getAcceptedCount();
    this._getRejectedCount();
    this._getPendingCount();
    this._getPreauthCount();
  }

  _restartInterval() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(() => {
      self._refreshAll();
    }, self.state.refreshLength);
    self._refreshAll();
  }

  _changeTab(tab) {
    const self = this;
    const tabIndex = self._updateActive(tab);
    self.setState({ tabIndex }, () => {
      self.context.router.history.push(tabIndex);
      AppActions.setSnackbar('');
    });
  }

  /*
   * Get counts of devices
   */
  _getAcceptedCount() {
    var self = this;
    return AppActions.getDeviceCount('accepted')
      .then(acceptedCount => self.setState({ acceptedCount }))
      .catch(() => {});
  }
  _getRejectedCount() {
    var self = this;
    return AppActions.getDeviceCount('rejected')
      .then(rejectedCount => self.setState({ rejectedCount }, self._getAllCount()))
      .catch(() => {});
  }
  _getPendingCount() {
    var self = this;
    return AppActions.getDeviceCount('pending')
      .then(pendingCount => self.setState({ pendingCount }))
      .catch(() => {});
  }
  _getPreauthCount() {
    var self = this;
    return AppActions.getDeviceCount('preauthorized')
      .then(preauthCount => self.setState({ preauthCount }))
      .catch(() => {});
  }
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
      return routes[tab].route;
    }
    return routes.devices.route;
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
    var styles = {
      tabStyle: {
        display: 'block',
        width: '100%',
        color: '#949495',
        textTransform: 'none'
      },
      activeTabStyle: {
        display: 'block',
        width: '100%',
        color: '#404041',
        textTransform: 'none'
      },
      listStyle: {
        fontSize: '12px',
        paddingTop: '10px',
        paddingBottom: '10px',
        whiteSpace: 'normal'
      },
      listButtonStyle: {
        fontSize: '12px',
        marginTop: '-10px',
        paddingRight: '12px',
        marginLeft: '0px'
      },
      iconListButtonStyle: {
        fontSize: '12px',
        paddingRight: '12px',
        marginLeft: '0px'
      }
    };

    var duplicateActions = [
      <div key="duplicate-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <FlatButton label="Cancel" onClick={() => this.dialogToggle('openDeviceExists')} />
      </div>
    ];

    var pendingLabel = this.state.pendingCount ? `Pending (${this.state.pendingCount})` : 'Pending';

    return (
      <div style={{ marginTop: '-15px' }}>
        <AppContext.Consumer>
          {(globalSettings, docsVersion) => (
            <Tabs
              value={this.context.router.route.match.params.status || 'devices'}
              onChange={tab => this._changeTab(tab)}
              tabItemContainerStyle={{ background: 'none', width: '580px' }}
              inkBarStyle={{ backgroundColor: '#347a87' }}
            >
              <Tab label={routes.devices.title} value="devices" style={this.state.tabIndex === routes.devices.route ? styles.activeTabStyle : styles.tabStyle}>
                <DeviceGroups
                  docsVersion={docsVersion}
                  params={this.props.params}
                  styles={styles}
                  rejectedDevices={this.state.rejectedCount}
                  acceptedDevices={this.state.acceptedCount}
                  allCount={this.state.allCount}
                  currentTab={this.state.currentTab}
                  showHelptips={this.state.showHelptips}
                  globalSettings={globalSettings}
                  openSettingsDialog={() => this._openSettingsDialog()}
                  pause={() => this._pauseInterval()}
                />
              </Tab>
              <Tab label={pendingLabel} value="pending" style={this.state.tabIndex === routes.devices.route ? styles.activeTabStyle : styles.tabStyle}>
                <PendingDevices
                  deviceLimit={this.state.deviceLimit}
                  styles={styles}
                  currentTab={this.state.currentTab}
                  acceptedDevices={this.state.acceptedCount}
                  count={this.state.pendingCount}
                  showHelptips={this.state.showHelptips}
                  highlightHelp={!this.state.acceptedCount}
                  globalSettings={globalSettings}
                  openSettingsDialog={() => this._openSettingsDialog()}
                  restart={this._restartInterval}
                  pause={() => this._pauseInterval()}
                />
              </Tab>

              <Tab
                label={routes.preauthorized.title}
                value="preauthorized"
                style={this.state.tabIndex === routes.devices.route ? styles.activeTabStyle : styles.tabStyle}
              >
                <PreauthDevices
                  deviceLimit={this.state.deviceLimit}
                  acceptedDevices={this.state.acceptedCount}
                  styles={styles}
                  currentTab={this.state.currentTab}
                  count={this.state.preauthCount}
                  refreshCount={() => this._getPreauthCount()}
                  globalSettings={globalSettings}
                  openSettingsDialog={() => this._openSettingsDialog()}
                  pause={() => this._pauseInterval()}
                />
              </Tab>

              <Tab
                label={routes.rejected.title}
                value="rejected"
                style={this.state.tabIndex === routes.devices.route ? styles.activeTabStyle : styles.tabStyle}
              >
                <RejectedDevices
                  deviceLimit={this.state.deviceLimit}
                  acceptedDevices={this.state.acceptedCount}
                  styles={styles}
                  currentTab={this.state.currentTab}
                  count={this.state.rejectedCount}
                  globalSettings={globalSettings}
                  openSettingsDialog={() => this._openSettingsDialog()}
                  pause={() => this._pauseInterval()}
                />
              </Tab>
            </Tabs>
          )}
        </AppContext.Consumer>

        {!this.state.acceptedCount && this.state.showHelptips && this.state.tabIndex !== routes.pending.route ? (
          <div>
            <div
              id="onboard-15"
              className="tooltip help highlight"
              data-tip
              data-for="devices-nav-tip"
              data-event="click focus"
              style={{ left: '19%', top: '46px' }}
            >
              <FontIcon className="material-icons">help</FontIcon>
            </div>
            <ReactTooltip id="devices-nav-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
              <DevicesNav devices={this.state.pendingCount} />
            </ReactTooltip>
          </div>
        ) : null}

        <Dialog
          open={this.state.openDeviceExists || false}
          title="Device with this identity data already exists"
          actions={duplicateActions}
          autoDetectWindowHeight={true}
          bodyStyle={{ paddingTop: '0', fontSize: '13px' }}
          contentStyle={{ overflow: 'hidden', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
        >
          <p>
            A device with matching identity data already exists. If you still want to accept {pluralize('this', this.state.duplicates)} pending{' '}
            {pluralize('device', this.state.duplicates)}, you should first remove the following {pluralize('device', this.state.duplicates)}:
          </p>
          <Table>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn className="columnHeader" tooltip="ID">
                  ID
                </TableHeaderColumn>
                <TableHeaderColumn className="columnHeader" tooltip="Status">
                  Status
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody ShowrowHover={true} displayRowCheckbox={false}>
              {(this.state.duplicates || []).map(function(device) {
                var status = device.status === 'accepted' ? '' : `/${device.status}`;
                return (
                  <TableRow key={device.device_id}>
                    <TableRowColumn>
                      <a onClick={() => this._redirect(`/devices${status}/id%3D${device.device_id}`)}>{device.device_id}</a>
                    </TableRowColumn>
                    <TableRowColumn className="capitalized">{device.status}</TableRowColumn>
                  </TableRow>
                );
              }, this)}
            </TableBody>
          </Table>
        </Dialog>

        <Dialog
          open={this.state.openIdDialog || false}
          title="Default device identity attribute"
          autoDetectWindowHeight={true}
          bodyStyle={{ paddingTop: '0', fontSize: '13px' }}
          contentStyle={{ overflow: 'hidden', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
        >
          <Global dialog={true} closeDialog={() => this._openSettingsDialog()} />
        </Dialog>
      </div>
    );
  }
}
