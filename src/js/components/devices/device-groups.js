import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';

import CreateGroup from './create-group';
import AuthorizedDevices from './authorized-devices';
import Filters from './filters';
import Groups from './groups';
import GroupSelector from './groupselector';
import AppActions from '../../actions/app-actions';
import {
  addDeviceToGroup,
  getAllDevicesByStatus,
  getDevices,
  getDevicesByStatus,
  getGroups,
  getGroupDevices,
  removeDeviceFromGroup,
  selectGroup,
  selectDevice,
  selectDevices
} from '../../actions/deviceActions';

import AppStore from '../../stores/app-store';
import AppConstants from '../../constants/app-constants';
import { DEVICE_STATES } from '../../constants/deviceConstants';
import { isEmpty, preformatWithRequestID } from '../../helpers';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

const UNGROUPED_GROUP = AppConstants.UNGROUPED_GROUP;

export class DeviceGroups extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      addGroup: false,
      removeGroup: false,
      groupInvalid: true,
      filters: AppStore.getFilters(),
      createGroupDialog: false,
      pageNo: 1,
      pageLength: 20,
      loading: true,
      tmpDevices: [],
      refreshDeviceLength: 10000,
      isHosted: AppStore.getIsEnterprise() || AppStore.getIsHosted()
    };
    this.props.selectDevices(this.props.acceptedDevicesList);
    this.props.getAllDevicesByStatus(DEVICE_STATES.accepted);
  }

  componentDidMount() {
    clearAllRetryTimers();
    var self = this;
    var filters = [];

    if (self.context.router.route.match.params.filters) {
      self._refreshGroups();
      var str = decodeURIComponent(self.context.router.route.match.params.filters);
      var obj = str.split('&');
      for (var i = 0; i < obj.length; i++) {
        var f = obj[i].split('=');
        filters.push({ key: f[0], value: f[1] });
      }
      self._onFilterChange(filters);
    } else {
      // no group, no filters, all devices
      this.deviceTimer = setInterval(() => this._getDevices(), this.state.refreshDeviceLength);
      this._refreshAll();
    }
  }

  componentWillUnmount() {
    clearInterval(this.deviceTimer);
    clearAllRetryTimers();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedGroup !== this.props.selectedGroup) {
      this._refreshGroups();
    }

    if (prevProps.acceptedDevices !== this.props.acceptedDevices) {
      clearInterval(this.deviceTimer);
      if (this.props.currentTab === 'Device groups') {
        this.deviceTimer = setInterval(() => this._getDevices(), this.state.refreshDeviceLength);
        this._refreshAll();
      }
    }

    if (prevProps.currentTab !== this.props.currentTab) {
      clearInterval(this.deviceTimer);
      if (prevProps.currentTab) {
        this.setState({ filters: [] });
      }
      if (this.props.currentTab === 'Device groups') {
        this.deviceTimer = setInterval(() => this._getDevices(), this.state.refreshDeviceLength);
        this._refreshAll();
      }
    }
  }

  _refreshAll() {
    this._refreshGroups();
    this._getDevices();
  }

  /*
   * Groups
   */
  _refreshGroups(cb) {
    var self = this;
    self.props
      .getGroups()
      .then(() => {
        if (cb) {
          cb();
        }
      })
      .catch(err => console.log(err));
  }

  _handleGroupChange(group) {
    var self = this;
    const isUngroupedGroup = group === AppConstants.UNGROUPED_GROUP.id || group === AppConstants.UNGROUPED_GROUP.name;
    if (isUngroupedGroup) {
      group = AppConstants.UNGROUPED_GROUP.id;
    }
    self.props.selectGroup(group);
    self.setState({ loading: true, pageNo: 1, filters: [] }, self._getDevices);
  }

  _removeCurrentGroup() {
    var self = this;
    const devices = self.props.groups.byId[self.props.selectedGroup].deviceIds;
    // returns all group devices ids
    return Promise.all(devices.map((device, index) => self._removeSingleDevice(index, devices.length, device.id, true)))
      .then(() => {
        AppActions.setSnackbar('Group was removed successfully', 5000);
        self.props.selectGroup();
        self.setState({ pageNo: 1, removeGroup: !self.state.removeGroup });
      })
      .catch(err => console.log(err));
  }

  _removeSingleDevice(idx, length, device, isGroupRemoval = false) {
    // remove single device from group
    var self = this;
    return self.props.removeDeviceFromGroup(device, this.props.selectedGroup).then(() => {
      if (idx === length - 1 && !isGroupRemoval) {
        // if isGroupRemoval, whole group is being removed
        AppActions.setSnackbar(`The ${pluralize('devices', length)} ${pluralize('were', length)} removed from the group`, 5000);
      }
      return Promise.resolve();
    });
  }

  _isUngroupedGroup(group) {
    if (!group) {
      return false;
    }
    return group === UNGROUPED_GROUP.id || group === UNGROUPED_GROUP.name;
  }

  /*
   * Devices
   */
  _getDevices() {
    var self = this;
    const { getDevices, getDevicesByStatus, getGroupDevices, selectDevice, selectDevices, selectedGroup, ungroupedDevices } = self.props;
    var hasFilters = self.state.filters.length && self.state.filters[0].value;

    if (selectedGroup || hasFilters) {
      let request;
      if (selectedGroup) {
        request = self._isUngroupedGroup(selectedGroup) ? Promise.resolve() : getGroupDevices(selectedGroup, this.state.pageNo, this.state.pageLength);
      } else {
        const filterId = this.state.filters.find(item => item.key === 'id');
        if (filterId) {
          return selectDevice(filterId.value);
        }
        request = getDevices(this.state.pageNo, this.state.pageLength, this.encodeFilters(this.state.filters));
      }
      // if a group or filters, must use inventory API
      return request
        .then(() => {
          if (this._isUngroupedGroup(selectedGroup)) {
            const offset = (self.state.pageNo - 1) * self.state.pageLength;
            const devices = ungroupedDevices.slice(offset, offset + self.state.pageLength);
            selectDevices(devices);
          }
          // only set state after all devices id data retrieved
          self.setState({ loading: false, pageLoading: false });
        })
        .catch(err => {
          console.log(err);
          var errormsg = err.error || 'Please check your connection.';
          self.setState({ loading: false });
          setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
        });
    } else {
      // otherwise, show accepted from device adm
      return getDevicesByStatus(DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength)
        .then(() => self.setState({ loading: false, pageLoading: false }))
        .catch(err => {
          console.log(err);
          var errormsg = err.error || 'Please check your connection.';
          self.setState({ loading: false });
          setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
        });
    }
  }

  encodeFilters(filters) {
    var str = filters.reduce((accu, filter) => {
      if (filter.key && filter.value) {
        accu.push(`${encodeURIComponent(filter.key)}=${encodeURIComponent(filter.value)}`);
      }
      return accu;
    }, []);
    return str.join('&');
  }

  _getDeviceById(id) {
    // filter the list to show a single device only
    var self = this;

    // do this via deviceauth not inventory
    return self.props
      .selectDevice(id)
      .then(() => self.setState({ loading: false, pageLoading: false }))
      .catch(err => {
        var state = { loading: false };
        if (err.res.statusCode === 404) {
          var errormsg = err.error || 'Please check your connection.';
          setRetryTimer(err, 'devices', `Device couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
        }
        self.setState(state);
      });
  }

  _handlePageChange(pageNo) {
    var self = this;
    self.setState({ pageLoading: true, pageNo: pageNo }, () => {
      self._getDevices();
    });
  }

  // Edit groups from device selection
  _addDevicesToGroup(devices) {
    var self = this;
    // (save selected devices in state, open dialog)
    self.setState({ tmpDevices: devices, addGroup: !self.state.addGroup });
  }

  _validate(invalid, group) {
    var name = invalid ? '' : group;
    this.setState({ groupInvalid: invalid, tmpGroup: name });
  }
  _changeTmpGroup(group) {
    this.setState({ selectedField: group, tmpGroup: group });
  }
  _addToGroup() {
    this._addListOfDevices(this.state.tmpDevices, this.state.selectedField || this.state.tmpGroup);
  }

  _createGroupFromDialog(devices, group) {
    var self = this;
    group = encodeURIComponent(group);
    for (var i = 0; i < devices.length; i++) {
      self._addDeviceToGroup(group, devices[i], i, devices.length);
    }
  }

  _addListOfDevices(rows, group) {
    var self = this;
    for (var i = 0; i < rows.length; i++) {
      group = encodeURIComponent(group);
      self._addDeviceToGroup(group, self.state.devices[rows[i]], i, rows.length);
    }
  }

  _addDeviceToGroup(group, device, idx, length) {
    var self = this;
    self.props
      .addDeviceToGroup(group, device.id)
      .then(() => {
        if (idx === length - 1) {
          // reached end of list
          self.setState({ createGroupDialog: false, addGroup: false, tmpGroup: '', selectedField: '' }, () => {
            AppActions.setSnackbar('The group was updated successfully', 5000);
            self._refreshGroups(() => {
              self._handleGroupChange(group);
            });
          });
        }
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        AppActions.setSnackbar(preformatWithRequestID(err.res, `Group could not be updated: ${errMsg}`), null, 'Copy to clipboard');
      });
  }

  _removeDevicesFromGroup(rows) {
    var self = this;
    clearInterval(self.deviceTimer);
    const isGroupRemoval = rows.length >= self.props.groupCount;
    const isPageRemoval = self.state.devices.length <= rows.length;
    const refresh = () => self._refreshAll();
    const deviceRemovals = rows.map((row, i) => self._removeSingleDevice(i, rows.length, self.state.devices[row].id, isGroupRemoval));
    return Promise.all(deviceRemovals)
      .then(() => {
        // if rows.length = number on page but < groupCount
        // move page back to pageNO 1
        if (isPageRemoval) {
          self.setState({ pageNo: 1, pageLoading: true }, refresh);
        }
        // if rows.length === groupCount
        // group now empty, go to all devices
        if (isGroupRemoval) {
          AppActions.setSnackbar('Group was removed successfully', 5000);
          self.props.selectGroup();
          self.setState({ loading: true, pageNo: 1 }, refresh);
        }
      })
      .catch(err => console.log(err));
  }

  _onFilterChange(filters) {
    var self = this;
    clearInterval(self.deviceTimer);
    var id, group;
    // check filters for ID or group, this is temporary until full filtering functionality
    filters.forEach(filter => {
      if (filter.key === 'id') {
        id = filter.value;
      } else if (filter.key === 'group') {
        group = filter.value;
      }
    });

    if (id) {
      // get single device by id
      self.setState({ filters: filters, pageNo: 1 }, () => {
        self._getDeviceById(id);
      });
    } else if (group) {
      self.setState({ selectedGroup: group });
      self._refreshGroups(() => {
        self._handleGroupChange(group);
      });
    } else {
      self.setState({ filters: filters, pageNo: 1 }, () => {
        self.deviceTimer = setInterval(() => self._getDevices(), self.state.refreshDeviceLength);
        self._getDevices();
      });
    }
  }

  _pauseInterval() {
    this.props.pause();
    var self = this;
    this.setState({ pause: !self.state.pause }, () => {
      // pause refresh interval when authset dialog is open, restart when it closes
      if (self.state.pause) {
        clearInterval(self.deviceTimer);
      } else {
        self.deviceTimer = setInterval(() => self._getDevices(), self.state.refreshDeviceLength);
        self._refreshAll();
      }
    });
  }

  render() {
    const self = this;
    // Add to group dialog
    var addActions = [
      <Button key="add-action-button-1" style={{ marginRight: '10px' }} onClick={() => self.setState({ addGroup: !self.state.addGroup })}>
        Cancel
      </Button>,
      <Button variant="contained" key="add-action-button-2" color="primary" onClick={() => this._addToGroup()} disabled={this.state.groupInvalid}>
        Add to group
      </Button>
    ];

    var removeActions = [
      <Button key="remove-action-button-1" onClick={() => self.setState({ removeGroup: !self.state.removeGroup })} style={{ marginRight: '10px' }}>
        Cancel
      </Button>,
      <Button variant="contained" key="remove-action-button-2" color="primary" onClick={() => this._removeCurrentGroup()}>
        Remove group
      </Button>
    ];

    var groupCount = this.props.groupCount || this.props.acceptedDevices || 0;

    var groupName = this._isUngroupedGroup(this.props.selectedGroup) ? UNGROUPED_GROUP.name : this.props.selectedGroup;
    var allowDeviceGroupRemoval = !this._isUngroupedGroup(this.props.selectedGroup);

    return (
      <div className="tab-container">
        <div className="leftFixed">
          <Groups
            openGroupDialog={() => self.setState({ createGroupDialog: !self.state.createGroupDialog })}
            changeGroup={group => this._handleGroupChange(group)}
            groups={this.props.groups}
            selectedGroup={this.props.selectedGroup}
            allCount={this.props.allCount}
            acceptedCount={this.props.acceptedDevices}
          />
        </div>
        <div className="rightFluid" style={{ paddingTop: '0' }}>
          {!this.props.selectedGroup ? (
            <Filters
              attributes={this.props.attributes}
              filters={this.state.filters}
              onFilterChange={filters => this._onFilterChange(filters)}
              isHosted={this.state.isHosted}
            />
          ) : null}

          {self.props.selectedGroup && allowDeviceGroupRemoval ? (
            <Button
              style={{ position: 'absolute', top: 0, right: '30px', zIndex: 100 }}
              onClick={() => self.setState({ removeGroup: !self.state.removeGroup })}
            >
              <DeleteIcon className="buttonLabelIcon" />
              Remove group
            </Button>
          ) : null}
          <AuthorizedDevices
            acceptedCount={this.props.acceptedDevices}
            addDevicesToGroup={devices => this._addDevicesToGroup(devices)}
            allCount={this.props.allCount}
            allowDeviceGroupRemoval={allowDeviceGroupRemoval}
            currentTab={this.props.currentTab}
            devices={this.props.devices}
            group={groupName}
            groupCount={groupCount}
            loading={this.state.loading}
            onPageChange={e => self._handlePageChange(e)}
            onChangeRowsPerPage={pageLength => self.setState({ pageNo: 1, pageLength })}
            openSettingsDialog={this.props.openSettingsDialog}
            pageNo={self.state.pageNo}
            pageLength={self.state.pageLength}
            pause={() => this._pauseInterval()}
            refreshDevices={() => self._getDevices()}
            paused={this.props.paused}
            removeDevicesFromGroup={rows => this._removeDevicesFromGroup(rows)}
          />
        </div>

        <Dialog open={this.state.addGroup} fullWidth={true} maxWidth="sm">
          <DialogTitle>Add selected devices to group</DialogTitle>
          <DialogContent>
            <GroupSelector
              devices={this.state.tmpDevices.length}
              willBeEmpty={this.state.willBeEmpty}
              tmpGroup={this.state.tmpGroup}
              selectedGroup={this.props.selectedGroup}
              selectedGroupName={groupName}
              changeSelect={group => this._changeTmpGroup(group)}
              validateName={(invalid, group) => this._validate(invalid, group)}
              groups={this.props.groups.filter(group => !this._isUngroupedGroup(group))}
              selectedField={this.state.selectedField}
            />
          </DialogContent>
          <DialogActions>{addActions}</DialogActions>
        </Dialog>

        <Dialog open={this.state.removeGroup}>
          <DialogTitle>Remove this group?</DialogTitle>
          <DialogContent>
            <p>This will remove the group from the list. Are you sure you want to continue?</p>
          </DialogContent>
          <DialogActions>{removeActions}</DialogActions>
        </Dialog>

        <CreateGroup
          toggleDialog={() => self.setState({ createGroupDialog: !self.state.createGroupDialog })}
          open={this.state.createGroupDialog}
          groups={this.props.groups}
          changeGroup={() => this._handleGroupChange()}
          addListOfDevices={(devices, group) => this._createGroupFromDialog(devices, group)}
          acceptedCount={this.props.acceptedDevices}
        />
      </div>
    );
  }
}

const actionCreators = {
  addDeviceToGroup,
  getAllDevicesByStatus,
  getDevices,
  getDevicesByStatus,
  getGroups,
  getGroupDevices,
  removeDeviceFromGroup,
  selectGroup,
  selectDevice,
  selectDevices
};

const mapStateToProps = state => {
  let devices = state.devices.selectedDeviceList;
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  if (!isEmpty(state.devices.groups.selectedGroup)) {
    groupCount = state.devices.groups.byId[state.devices.groups.selectedGroup].total;
    selectedGroup = state.devices.groups.selectedGroup;
  } else if (!isEmpty(state.devices.selectedDevice)) {
    devices = [state.devices.selectedDevice];
  }
  const ungroupedDevices = state.devices.groups.byId[AppConstants.UNGROUPED_GROUP.id]
    ? state.devices.groups.byId[AppConstants.UNGROUPED_GROUP.id].deviceIds
    : [];
  return {
    acceptedDevices: state.devices.byStatus.accepted.total || 0,
    acceptedDevicesList: state.devices.byStatus.accepted.deviceIds.slice(0, 20),
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    attributes: state.devices.filteringAttributes || [],
    devices,
    groups: Object.keys(state.devices.groups.byId) || [],
    groupCount,
    selectedGroup,
    ungroupedDevices
  };
};

export default connect(
  mapStateToProps,
  actionCreators
)(DeviceGroups);
