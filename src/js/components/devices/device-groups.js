import React from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import DeleteIcon from '@material-ui/icons/Delete';

import CreateGroup from './create-group';
import AuthorizedDevices from './authorized-devices';
import Filters from './filters';
import Groups from './groups';
import GroupSelector from './groupselector';
import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import AppConstants from '../../constants/app-constants';
import { isEmpty, preformatWithRequestID } from '../../helpers';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';

const UNGROUPED_GROUP = AppConstants.UNGROUPED_GROUP;

export default class DeviceGroups extends React.Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      groups: AppStore.getGroups(),
      selectedGroup: AppStore.getSelectedGroup(),
      addGroup: false,
      removeGroup: false,
      groupInvalid: true,
      filters: AppStore.getFilters(),
      attributes: AppStore.getFilterAttributes(),
      createGroupDialog: false,
      devices: [],
      acceptedDevices: [],
      ungroupedDevices: [],
      pageNo: 1,
      pageLength: 20,
      loading: true,
      tmpDevices: [],
      refreshDeviceLength: 10000,
      isHosted: AppStore.getIsHosted()
    };
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
    self._refreshUngroupedDevices();
    self._refreshAcceptedDevices();
  }

  componentWillUnmount() {
    clearInterval(this.deviceTimer);
    clearAllRetryTimers();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedGroup !== this.state.selectedGroup) {
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
    AppActions.getGroups()
      .then(groups => {
        if (self.state.ungroupedDevices.length) {
          groups.push(UNGROUPED_GROUP.id);
        }
        self.setState({ groups });
        if (cb) {
          cb();
        }
      })
      .catch(err => console.log(err));
  }

  _pickAcceptedUngroupedDevices(acceptedDevs, ungroupedDevs) {
    const devices = ungroupedDevs.reduce((accu, device) => {
      const isContained = acceptedDevs.find(item => item.id === device.id);
      if (isContained) {
        accu.push(device);
      }
      return accu;
    }, []);
    return devices;
  }

  _refreshAcceptedDevices() {
    AppActions.getDeviceCount('accepted');
  }

  _refreshUngroupedDevices() {
    var self = this;
    const noGroupDevices = AppActions.getAllDevicesInGroup();
    const acceptedDevs = AppActions.getAllDevicesByStatus('accepted');
    return Promise.all([noGroupDevices, acceptedDevs]).then(results => {
      let ungroupedDevices = results[0];
      const acceptedDevices = results[1];
      var groups = self.state.groups;
      if (ungroupedDevices.length > 0 && !groups.find(item => item === UNGROUPED_GROUP.id)) {
        groups.push(UNGROUPED_GROUP.id);
      }
      if (acceptedDevices.length && ungroupedDevices.length) {
        ungroupedDevices = self._pickAcceptedUngroupedDevices(acceptedDevices, ungroupedDevices);
      }
      self.setState({ ungroupedDevices, groups });
      return new Promise(resolve => {
        self.setState({ ungroupedDevices, groups }, () => resolve());
      });
    });
  }

  _handleGroupChange(group) {
    var self = this;

    clearInterval(self.deviceTimer);
    self.setState({ devices: [], loading: true, selectedGroup: group, pageNo: 1, filters: [] }, () => {
      // get number of devices in group first for pagination
      let promisedGroupCount;
      if (self._isUngroupedGroup(group)) {
        // don't use backend count for ungrouped devices, as this includes 'pending', 'preauthorized', ... devices as well
        promisedGroupCount = self._refreshUngroupedDevices().then(() => Promise.resolve(self.state.ungroupedDevices.length));
      } else if (group === '') {
        // don't use backend count for 'All devices', as this just refers to 'accepted' devices
        promisedGroupCount = AppActions.getAllDevicesByStatus('accepted').then(devices => Promise.resolve(devices.length));
      } else {
        promisedGroupCount = AppActions.getNumberOfDevicesInGroup(group);
      }
      promisedGroupCount.then(groupCount => {
        self.setState({ groupCount });
        self.deviceTimer = setInterval(() => self._getDevices(), self.state.refreshDeviceLength);
        self._getDevices();
      });
    });
  }

  _removeCurrentGroup() {
    var self = this;
    clearInterval(self.deviceTimer);
    var params = this.state.selectedGroup ? `group=${this.state.selectedGroup}` : '';
    return AppActions.getDevices(1, this.state.groupCount, params)
      .then(devices => {
        // should handle "next page"
        // returns all group devices ids
        const singleRemovals = devices.map((device, i) => self._removeSingleDevice(i, devices.length, device.id, true));
        return Promise.all(singleRemovals);
      })
      .then(() => {
        AppActions.setSnackbar('Group was removed successfully', 5000);
        self.setState({ selectedGroup: null, pageNo: 1, groupCount: self.props.acceptedDevices, removeGroup: !self.state.removeGroup }, () => {
          setTimeout(() => {
            self.deviceTimer = setInterval(() => self._getDevices(), self.state.refreshDeviceLength);
            self._refreshAll();
          }, 100);
        });
      })
      .catch(err => console.log(err));
  }

  _removeSingleDevice(idx, length, device, isGroupRemoval = false) {
    // remove single device from group
    var self = this;
    clearInterval(self.deviceTimer);
    return AppActions.removeDeviceFromGroup(device, this.state.selectedGroup).then(() => {
      if (idx === length - 1 && !isGroupRemoval) {
        // if isGroupRemoval, whole group is being removed
        AppActions.setSnackbar(`The ${pluralize('devices', length)} ${pluralize('were', length)} removed from the group`, 5000);
        self._refreshAll();
        self._refreshUngroupedDevices();
        self._refreshAcceptedDevices();
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
    var hasFilters = self.state.filters.length && self.state.filters[0].value;

    if (this.state.selectedGroup || hasFilters) {
      var params = '';
      if (this.state.selectedGroup && this._isUngroupedGroup(this.state.selectedGroup)) {
        params += this.encodeFilters([{ key: 'has_group', value: 'false' }]);
      } else {
        params += this.state.selectedGroup ? `group=${this.state.selectedGroup}` : '';
      }
      if (hasFilters) {
        const filterId = this.state.filters.find(item => item.key === 'id');
        if (filterId) {
          return self._getDeviceById(filterId.value);
        }
        params += this.encodeFilters(this.state.filters);
      }
      // if a group or filters, must use inventory API
      return (
        AppActions.getDevices(this.state.pageNo, this.state.pageLength, params)
          .then(devices => {
            if (this._isUngroupedGroup(this.state.selectedGroup)) {
              const offset = (self.state.pageNo - 1) * self.state.pageLength;
              devices = self.state.ungroupedDevices.slice(offset, offset + self.state.pageLength);
            }
            if (devices.length && devices[0].attributes && self.state.isHosted) {
              AppActions.setFilterAttributes(devices[0].attributes);
            }
            // for each device, get device identity info
            const allDeviceDetails = devices.map(device => {
              // have to call each time - accepted list can change order
              return AppActions.getDeviceAuth(device.id)
                .then(deviceAuth => {
                  device.identity_data = deviceAuth.identity_data;
                  device.auth_sets = deviceAuth.auth_sets;
                  device.status = deviceAuth.status;
                  return Promise.resolve(device);
                })
                .catch(() => Promise.resolve(device));
            });
            return Promise.all(allDeviceDetails);
          })
          // only set state after all devices id data retrieved
          .then(detailedDevices => self.setState({ devices: detailedDevices, loading: false, pageLoading: false }))
          .catch(err => {
            console.log(err);
            var errormsg = err.error || 'Please check your connection.';
            self.setState({ loading: false });
            setRetryTimer(err, 'devices', `Devices couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
          })
      );
    } else {
      // otherwise, show accepted from device adm
      return AppActions.getDevicesByStatus('accepted', this.state.pageNo, this.state.pageLength)
        .then(devices => {
          let state = { devices, groupCount: self.props.acceptedDevices, loading: false, pageLoading: false };
          let additionalDeviceRequests = Promise.resolve(devices);
          if (devices.length) {
            // if none, stop loading spinners
            state.devices = [];
            // for each device, get inventory
            const deviceInventoryRequests = devices.map(device => {
              var gotAttrs = false;
              device.id_attributes = device.attributes;
              // have to call inventory each time - accepted list can change order so must refresh inventory too
              return self
                ._getInventoryForDevice(device.id)
                .then(inventory => {
                  device.attributes = inventory.attributes;
                  device.updated_ts = inventory.updated_ts;
                  if (!gotAttrs && inventory.attributes && self.state.isHosted) {
                    AppActions.setFilterAttributes(inventory.attributes);
                    gotAttrs = true;
                  }
                  return Promise.resolve(device);
                })
                .catch(() => Promise.resolve(device));
            });
            // only set state after all devices inventory retrieved
            additionalDeviceRequests = Promise.all(deviceInventoryRequests);
          }
          return additionalDeviceRequests.then(requestedDevices => {
            state.devices = requestedDevices;
            state.attributes = AppStore.getFilterAttributes();
            self.setState(state);
          });
        })
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
    return AppActions.getDeviceAuth(id)
      .then(device => {
        if (!isEmpty(device)) {
          return self._getInventoryForDevice(id).then(inventory => {
            device.attributes = inventory.attributes;
            device.updated_ts = inventory.updated_ts;
            return Promise.resolve(device);
          });
        }
        return Promise.resolve(device);
      })
      .then(device => self.setState({ devices: [device], loading: false, pageLoading: false, groupCount: !!device }))
      .catch(err => {
        var state = { loading: false };
        if (err.res.statusCode === 404) {
          state = Object.assign(state, { devices: [] });
        } else {
          var errormsg = err.error || 'Please check your connection.';
          setRetryTimer(err, 'devices', `Device couldn't be loaded. ${errormsg}`, self.state.refreshDeviceLength);
        }
        self.setState(state);
      });
  }

  /*
   * Get full device identity details for single selected device
   */
  _getInventoryForDevice(device_id) {
    // get inventory for single device
    return AppActions.getDeviceById(device_id).catch(err => {
      if (err.res.statusCode !== 404) {
        // don't show error if 404 - device hasn't received inventory yet
        console.log(err);
      }
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
    AppActions.addDeviceToGroup(group, device.id)
      .then(() => {
        if (idx === length - 1) {
          // reached end of list
          self.setState({ createGroupDialog: false, addGroup: false, tmpGroup: '', selectedField: '' }, () => {
            AppActions.setSnackbar('The group was updated successfully', 5000);
            self._refreshUngroupedDevices();
            self._refreshAcceptedDevices();
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
    const isGroupRemoval = rows.length >= self.state.groupCount;
    const isPageRemoval = self.state.devices.length <= rows.length;
    const refresh = () => self._refreshAll();
    const deviceRemovals = rows.map((row, i) => self._removeSingleDevice(i, rows.length, self.state.devices[row].id, isGroupRemoval));
    return Promise.all(deviceRemovals)
      .then(() => {
        // if rows.length = number on page but < groupCount
        // move page back to pageNO 1
        if (isPageRemoval) {
          self.setState({ pageNo: 1, pageLoading: true, groupCount: self.state.groupCount - rows.length }, refresh);
        }
        // if rows.length === groupCount
        // group now empty, go to all devices
        if (isGroupRemoval) {
          AppActions.setSnackbar('Group was removed successfully', 5000);
          self.setState({ loading: true, selectedGroup: null, pageNo: 1, groupCount: self.props.acceptedDevices }, refresh);
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

    var groupCount = this.state.groupCount || this.props.acceptedDevices || 0;

    var groupName = this._isUngroupedGroup(this.state.selectedGroup) ? UNGROUPED_GROUP.name : this.state.selectedGroup;
    var allowDeviceGroupRemoval = !this._isUngroupedGroup(this.state.selectedGroup);

    return (
      <div className="tab-container">
        <div className="leftFixed">
          <Groups
            openGroupDialog={() => self.setState({ createGroupDialog: !self.state.createGroupDialog })}
            changeGroup={group => this._handleGroupChange(group)}
            groups={this.state.groups}
            selectedGroup={this.state.selectedGroup}
            allCount={this.props.allCount}
            acceptedCount={this.props.acceptedDevices}
          />
        </div>
        <div className="rightFluid" style={{ paddingTop: '0' }}>
          {!this.state.selectedGroup ? (
            <Filters
              attributes={this.state.attributes}
              filters={this.state.filters}
              onFilterChange={filters => this._onFilterChange(filters)}
              isHosted={this.state.isHosted}
            />
          ) : null}

          {self.state.selectedGroup && allowDeviceGroupRemoval ? (
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
            devices={this.state.devices}
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
              selectedGroup={this.state.selectedGroup}
              selectedGroupName={groupName}
              changeSelect={group => this._changeTmpGroup(group)}
              validateName={(invalid, group) => this._validate(invalid, group)}
              groups={this.state.groups.filter(group => !this._isUngroupedGroup(group))}
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
          groups={this.state.groups}
          changeGroup={() => this._handleGroupChange()}
          addListOfDevices={(devices, group) => this._createGroupFromDialog(devices, group)}
          acceptedCount={this.props.acceptedDevices}
        />
      </div>
    );
  }
}
