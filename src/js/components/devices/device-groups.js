import React from 'react';
import { Promise } from 'es6-promise';

import Groups from './groups';
import GroupSelector from './groupselector';
import CreateGroup from './create-group';
import DeviceList from './devicelist';
import Filters from './filters';
import Loader from '../common/loader';
import pluralize from 'pluralize';
import Pagination from 'rc-pagination';
import _en_US from 'rc-pagination/lib/locale/en_US';

import PropTypes from 'prop-types';
import { setRetryTimer, clearAllRetryTimers } from '../../utils/retrytimer';
import { isEmpty, preformatWithRequestID } from '../../helpers';

import AppStore from '../../stores/app-store';
import AppActions from '../../actions/app-actions';

import AppConstants from '../../constants/app-constants';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import { AppContext } from '../../contexts/app-context';

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
      isHosted: window.location.hostname === 'hosted.mender.io'
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
    const self = this;
    AppActions.getAllDevicesByStatus('accepted')
      .then(acceptedDevices => {
        if (self.state.ungroupedDevices.length && acceptedDevices.length) {
          const ungroupedDevices = self._pickAcceptedUngroupedDevices(acceptedDevices, self.state.ungroupedDevices);
          self.setState({ ungroupedDevices, acceptedDevices });
        } else {
          self.setState({ acceptedDevices });
        }
      })
      .catch(console.err);
  }

  _refreshUngroupedDevices() {
    var self = this;
    AppActions.getAllDevices().then(devices => {
      var groups = self.state.groups;
      if (devices.length > 0 && !groups.find(item => item === UNGROUPED_GROUP.id)) {
        groups.push(UNGROUPED_GROUP.id);
      }
      var ungroupedDevices = devices;
      if (self.state.acceptedDevices.length && devices.length) {
        ungroupedDevices = self._pickAcceptedUngroupedDevices(self.state.acceptedDevices, devices);
      }
      self.setState({ ungroupedDevices, groups });
    });
  }

  _handleGroupChange(group) {
    var self = this;

    clearInterval(self.deviceTimer);
    self.setState({ devices: [], loading: true, selectedGroup: group, pageNo: 1, filters: [] }, () => {
      const groupInQuestion = UNGROUPED_GROUP.id ? null : group;
      // get number of devices in group first for pagination
      AppActions.getAllDevices(groupInQuestion).then(devices => {
        var ungroupedDevices = self.state.ungroupedDevices;
        if (this._isUngroupedGroup(group) && self.state.acceptedDevices.length) {
          ungroupedDevices = self._pickAcceptedUngroupedDevices(self.state.acceptedDevices, devices);
        }
        self.setState({ groupCount: devices.length, ungroupedDevices });
        self.deviceTimer = setInterval(() => self._getDevices(), self.state.refreshDeviceLength);
        self._getDevices();
      });
    });
  }

  _toggleDialog(ref) {
    var state = {};
    state[ref] = !this.state[ref];
    this.setState(state);
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
        self._toggleDialog('removeGroup');
        AppActions.setSnackbar('Group was removed successfully', 5000);
        self.setState({ selectedGroup: null, pageNo: 1, groupCount: self.props.acceptedDevices }, () => {
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
    var hasFilters = this.state.filters.length && this.state.filters[0].value;

    if (this.state.selectedGroup || hasFilters) {
      var params = '';
      if (this.state.selectedGroup && this._isUngroupedGroup(this.state.selectedGroup)) {
        params += this.encodeFilters([{ key: 'has_group', value: 'false' }]);
      } else {
        params += this.state.selectedGroup ? `group=${this.state.selectedGroup}` : '';
      }
      if (hasFilters) {
        params += this.encodeFilters(this.state.filters);
      }
      // if a group or filters, must use inventory API
      AppActions.getDevices(this.state.pageNo, this.state.pageLength, params)
        .then(devices => {
          if (this._isUngroupedGroup(this.state.selectedGroup)) {
            const offset = (self.state.pageNo - 1) * self.state.pageLength;
            devices = self.state.ungroupedDevices.slice(offset, offset + self.state.pageLength);
          }
          if (devices.length && devices[0].attributes && self.state.isHosted) {
            AppActions.setFilterAttributes(devices[0].attributes);
          }
          self.setState({ devices });
          // for each device, get device identity info
          const allDeviceDetails = devices.map(device => {
            // have to call each time - accepted list can change order
            return self._getDeviceDetails(device.id).then(deviceAuth => {
              device.identity_data = deviceAuth.identity_data;
              device.auth_sets = deviceAuth.auth_sets;
              device.status = deviceAuth.status;
              return Promise.resolve(device);
            });
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
        });
    } else {
      // otherwise, show accepted from device adm
      AppActions.getDevicesByStatus('accepted', this.state.pageNo, this.state.pageLength)
        .then(devices => {
          var state = { groupCount: self.props.acceptedDevices };
          if (!devices.length) {
            // if none, stop loading spinners
            state = Object.assign(state, { devices, loading: false, pageLoading: false, attributes: AppStore.getFilterAttributes() });
          }
          self.setState(state, () => {
            // for each device, get inventory
            const deviceInventoryRequests = devices.map(device => {
              var gotAttrs = false;
              device.id_attributes = device.attributes;
              // have to call inventory each time - accepted list can change order so must refresh inventory too
              return self._getInventoryForDevice(device.id).then(inventory => {
                device.attributes = inventory.attributes;
                device.updated_ts = inventory.updated_ts;
                if (!gotAttrs && inventory.attributes && self.state.isHosted) {
                  AppActions.setFilterAttributes(inventory.attributes);
                  gotAttrs = true;
                }
                return Promise.resolve(device);
              });
            });
            // only set state after all devices inventory retrieved
            return Promise.all(deviceInventoryRequests).then(inventoryDevices =>
              self.setState({ devices: inventoryDevices, loading: false, pageLoading: false, attributes: AppStore.getFilterAttributes() })
            );
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
  _getDeviceDetails(device_id) {
    return AppActions.getDeviceAuth(device_id);
  }

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
    this.setState({ tmpDevices: devices }, () => {
      self._toggleDialog('addGroup');
    });
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
    for (var i = 0; i < filters.length; i++) {
      if (filters[i].key === 'id') {
        id = filters[i].value;
        break;
      } else if (filters[i].key === 'group') {
        group = filters[i].value;
        break;
      }
    }

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
      <div key="add-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <FlatButton label="Cancel" onClick={() => this._toggleDialog('addGroup')} />
      </div>,
      <RaisedButton
        key="add-action-button-2"
        label="Add to group"
        primary={true}
        onClick={() => this._addToGroup()}
        ref="save"
        disabled={this.state.groupInvalid}
      />
    ];

    var removeActions = [
      <div key="remove-action-button-1" style={{ marginRight: '10px', display: 'inline-block' }}>
        <FlatButton label="Cancel" onClick={() => this._toggleDialog('removeGroup')} />
      </div>,
      <RaisedButton key="remove-action-button-2" label="Remove group" primary={true} onClick={() => this._removeCurrentGroup()} />
    ];

    var groupCount = this.state.groupCount ? this.state.groupCount : this.props.acceptedDevices;

    var groupName = this._isUngroupedGroup(this.state.selectedGroup) ? UNGROUPED_GROUP.name : this.state.selectedGroup;
    var allowDeviceGroupRemoval = !this._isUngroupedGroup(this.state.selectedGroup);

    var styles = {
      exampleFlatButtonIcon: {
        height: '100%',
        display: 'inline-block',
        verticalAlign: 'middle',
        float: 'left',
        paddingLeft: '12px',
        lineHeight: '36px',
        marginRight: '-6px',
        color: '#679BA5',
        fontSize: '16px'
      },
      exampleFlatButton: {
        fontSize: '12px',
        marginLeft: '10px',
        float: 'right',
        marginTop: '10px'
      }
    };

    return (
      <div className="margin-top">
        <div className="leftFixed">
          <Groups
            openGroupDialog={() => this._toggleDialog('createGroupDialog')}
            changeGroup={group => this._handleGroupChange(group)}
            groups={this.state.groups}
            selectedGroup={this.state.selectedGroup}
            allCount={this.props.allCount}
            acceptedCount={this.props.acceptedDevices}
            showHelptips={this.props.showHelptips}
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
            <FlatButton onClick={() => this._toggleDialog('removeGroup')} style={styles.exampleFlatButton} label="Remove group" labelPosition="after">
              <FontIcon style={styles.exampleFlatButtonIcon} className="material-icons">
                delete
              </FontIcon>
            </FlatButton>
          ) : null}
          <AppContext.Consumer>
            {(globalSettings, docsVersion) => (
              <DeviceList
                docsVersion={docsVersion}
                pageNo={this.state.pageNo}
                addDevicesToGroup={devices => this._addDevicesToGroup(devices)}
                removeDevicesFromGroup={rows => this._removeDevicesFromGroup(rows)}
                allowDeviceGroupRemoval={allowDeviceGroupRemoval}
                loading={this.state.loading}
                currentTab={this.props.currentTab}
                allCount={this.props.allCount}
                acceptedCount={this.props.acceptedDevices}
                groupCount={groupCount}
                styles={this.props.styles}
                group={groupName}
                devices={this.state.devices}
                paused={this.props.paused}
                showHelptips={this.props.showHelptips}
                globalSettings={globalSettings}
                openSettingsDialog={this.props.openSettingsDialog}
                pause={() => this._pauseInterval()}
              />
            )}
          </AppContext.Consumer>
          {this.state.devices.length && !this.state.loading ? (
            <div className="margin-top">
              <Pagination
                locale={_en_US}
                simple
                pageSize={this.state.pageLength}
                current={this.state.pageNo}
                total={groupCount}
                onChange={e => this._handlePageChange(e)}
              />
              {this.state.pageLoading ? (
                <div className="smallLoaderContainer">
                  <Loader show={true} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <Dialog
          ref="addGroup"
          open={this.state.addGroup}
          title="Add selected devices to group"
          actions={addActions}
          autoDetectWindowHeight={true}
          bodyStyle={{ fontSize: '13px' }}
        >
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
        </Dialog>

        <Dialog
          ref="removeGroup"
          open={this.state.removeGroup}
          title="Remove this group?"
          actions={removeActions}
          autoDetectWindowHeight={true}
          bodyStyle={{ fontSize: '13px' }}
        >
          <p>This will remove the group from the list. Are you sure you want to continue?</p>
        </Dialog>

        <AppContext.Consumer>
          {globalSettings => (
            <CreateGroup
              toggleDialog={() => this._toggleDialog('createGroupDialog')}
              open={this.state.createGroupDialog}
              groups={this.state.groups}
              changeGroup={() => this._handleGroupChange()}
              globalSettings={globalSettings}
              addListOfDevices={(devices, group) => this._createGroupFromDialog(devices, group)}
              acceptedCount={this.props.acceptedDevices}
            />
          )}
        </AppContext.Consumer>
      </div>
    );
  }
}
