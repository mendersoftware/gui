import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { clearAllRetryTimers } from '../../utils/retrytimer';
import { DevicesNav } from '../helptips/helptooltips';
import Global from '../settings/global';

import createReactClass from 'create-react-class';
import DeviceGroups from './device-groups';
import PendingDevices from './pending-devices';
import RejectedDevices from './rejected-devices';
import PreauthDevices from './preauthorize-devices';

import pluralize from 'pluralize';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';

import { Tabs, Tab } from 'material-ui/Tabs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

var Devices = createReactClass({
  getInitialState() {
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
  },

  componentWillMount: function() {
    AppStore.changeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(this.getInitialState());
  },

  componentDidMount() {
    clearAllRetryTimers();
    this._restartInterval();
  },

  componentWillUnmount() {
    clearAllRetryTimers();
    clearInterval(this.interval);
    AppStore.removeChangeListener(this._onChange);
  },

  _refreshAll: function() {
    this._getAcceptedCount();
    this._getRejectedCount();
    this._getPendingCount();
    this._getPreauthCount();
  },

  _restartInterval: function() {
    var self = this;
    clearInterval(self.interval);
    self.interval = setInterval(function() {
      self._refreshAll();
    }, self.state.refreshLength);
    self._refreshAll();
  },

  _changeTab: function() {
    //this._restartInterval();
  },

  /*
   * Get counts of devices
   */
  _getAcceptedCount: function() {
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({ acceptedCount: count });
      },
      error: function() {}
    };
    AppActions.getDeviceCount(callback, 'accepted');
  },
  _getRejectedCount: function() {
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({ rejectedCount: count }, self._getAllCount());
      },
      error: function() {}
    };
    AppActions.getDeviceCount(callback, 'rejected');
  },
  _getPendingCount: function() {
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({ pendingCount: count });
      },
      error: function() {}
    };
    AppActions.getDeviceCount(callback, 'pending');
  },
  _getPreauthCount: function() {
    var self = this;
    var callback = {
      success: function(count) {
        self.setState({ preauthCount: count });
      },
      error: function() {}
    };
    AppActions.getDeviceCount(callback, 'preauthorized');
  },
  _getAllCount: function() {
    var self = this;
    var accepted = self.state.acceptedCount ? self.state.acceptedCount : 0;
    var rejected = self.state.rejectedCount ? self.state.rejectedCount : 0;
    self.setState({ allCount: accepted + rejected });
  },

  // nested tabs
  componentWillReceiveProps: function() {
    this.setState({ tabIndex: this._updateActive(), currentTab: this._getCurrentLabel() });
  },

  _updateActive: function() {
    return this.context.router.isActive({ pathname: '/devices' }, true)
      ? '/devices'
      : this.context.router.isActive('/devices/pending')
        ? '/devices/pending'
        : this.context.router.isActive('/devices/preauthorized')
          ? '/devices/preauthorized'
          : this.context.router.isActive('/devices/rejected')
            ? '/devices/rejected'
            : '/devices';
  },

  _getCurrentLabel: function() {
    return this.context.router.isActive({ pathname: '/devices' }, true)
      ? 'Device groups'
      : this.context.router.isActive('/devices/pending')
        ? 'Pending'
        : this.context.router.isActive('/devices/preauthorized')
          ? 'Preauthorized'
          : this.context.router.isActive('/devices/rejected')
            ? 'Rejected'
            : 'Device groups';
  },

  _handleTabActive: function(tab) {
    AppActions.setSnackbar('');
    this.setState({ currentTab: tab.props.label });
    this.context.router.push(tab.props.value);
  },

  dialogToggle: function(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
  },

  _openRejectDialog: function(device, status) {
    device.status = status;
    this.setState({ rejectDialog: true, deviceToReject: device });
  },

  _redirect: function(route) {
    var self = this;
    self.setState({ openDeviceExists: false });
    self.context.router.push(route);
  },

  _openSettingsDialog: function() {
    var self = this;
    self.setState({ openIdDialog: !self.state.openIdDialog });
  },

  _pauseInterval: function() {
    var self = this;
    this.setState({ pause: !self.state.pause }, function() {
      // pause refresh interval when authset dialog is open
      self.state.pause ? clearInterval(self.interval) : self._restartInterval();
    });
  },

  render: function() {
    // nested tabs
    var tabHandler = this._handleTabActive;
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
        <FlatButton label="Cancel" onClick={this.dialogToggle.bind(null, 'openDeviceExists')} />
      </div>
    ];

    var pendingLabel = this.state.pendingCount ? 'Pending (' + this.state.pendingCount + ')' : 'Pending';

    return (
      <div style={{ marginTop: '-15px' }}>
        <Tabs
          value={this.state.tabIndex}
          onChange={this._changeTab}
          tabItemContainerStyle={{ background: 'none', width: '580px' }}
          inkBarStyle={{ backgroundColor: '#347a87' }}
        >
          <Tab
            label="Device groups"
            value="/devices"
            onActive={tabHandler}
            style={this.state.tabIndex === '/devices' ? styles.activeTabStyle : styles.tabStyle}
          >
            <DeviceGroups
              docsVersion={this.props.docsVersion}
              params={this.props.params}
              styles={styles}
              rejectedDevices={this.state.rejectedCount}
              acceptedDevices={this.state.acceptedCount}
              allCount={this.state.allCount}
              currentTab={this.state.currentTab}
              showHelptips={this.state.showHelptips}
              globalSettings={this.props.globalSettings}
              openSettingsDialog={this._openSettingsDialog}
              pause={this._pauseInterval}
            />
          </Tab>
          <Tab
            label={pendingLabel}
            value="/devices/pending"
            onActive={tabHandler}
            style={this.state.tabIndex === '/devices/pending' ? styles.activeTabStyle : styles.tabStyle}
          >
            <PendingDevices
              deviceLimit={this.state.deviceLimit}
              styles={styles}
              currentTab={this.state.currentTab}
              acceptedDevices={this.state.acceptedCount}
              count={this.state.pendingCount}
              showHelptips={this.state.showHelptips}
              highlightHelp={!this.state.acceptedCount}
              globalSettings={this.props.globalSettings}
              openSettingsDialog={this._openSettingsDialog}
              restart={this._restartInterval}
              pause={this._pauseInterval}
            />
          </Tab>

          <Tab
            label="Preauthorized"
            value="/devices/preauthorized"
            onActive={tabHandler}
            style={this.state.tabIndex === '/devices/preauthorized' ? styles.activeTabStyle : styles.tabStyle}
          >
            <PreauthDevices
              deviceLimit={this.state.deviceLimit}
              acceptedDevices={this.state.acceptedCount}
              styles={styles}
              currentTab={this.state.currentTab}
              count={this.state.preauthCount}
              refreshCount={this._getPreauthCount}
              globalSettings={this.props.globalSettings}
              openSettingsDialog={this._openSettingsDialog}
              pause={this._pauseInterval}
            />
          </Tab>

          <Tab
            label="Rejected"
            value="/devices/rejected"
            onActive={tabHandler}
            style={this.state.tabIndex === '/devices/rejected' ? styles.activeTabStyle : styles.tabStyle}
          >
            <RejectedDevices
              deviceLimit={this.state.deviceLimit}
              acceptedDevices={this.state.acceptedCount}
              styles={styles}
              currentTab={this.state.currentTab}
              count={this.state.rejectedCount}
              globalSettings={this.props.globalSettings}
              openSettingsDialog={this._openSettingsDialog}
              pause={this._pauseInterval}
            />
          </Tab>
        </Tabs>

        {!this.state.acceptedCount && this.state.showHelptips && this.state.tabIndex !== '/devices/pending' ? (
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
                var status = device.status === 'accepted' ? '' : '/' + device.status;
                return (
                  <TableRow key={device.device_id}>
                    <TableRowColumn>
                      <a onClick={this._redirect.bind(null, `/devices${status}/id%3D${device.device_id}`)}>{device.device_id}</a>
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
          title="Customize device identity column"
          autoDetectWindowHeight={true}
          bodyStyle={{ paddingTop: '0', fontSize: '13px' }}
          contentStyle={{ overflow: 'hidden', boxShadow: '0 14px 45px rgba(0, 0, 0, 0.25), 0 10px 18px rgba(0, 0, 0, 0.22)' }}
        >
          <Global dialog={true} closeDialog={this._openSettingsDialog} />
        </Dialog>
      </div>
    );
  }
});

Devices.contextTypes = {
  router: PropTypes.object
};

module.exports = Devices;
