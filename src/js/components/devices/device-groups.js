import React from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import AuthorizedDevices from './authorized-devices';
import CreateGroup from './create-group';
import Groups from './groups';
import RemoveGroup from './remove-group';
import {
  addDeviceToGroup,
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
  removeDeviceFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  updateDynamicGroup
} from '../../actions/deviceActions';
import { setSnackbar } from '../../actions/appActions';

import { isEmpty, preformatWithRequestID } from '../../helpers';

export class DeviceGroups extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      createGroupDialog: false,
      groupInvalid: true,
      modifyGroupDialog: false,
      removeGroup: false,
      tmpDevices: []
    };
    this._refreshGroups().then(() => props.initializeGroupsDevices());
  }

  componentDidUpdate(prevProps) {
    if ((prevProps.groupCount !== this.props.groupCount || prevProps.selectedGroup !== this.props.selectedGroup) && this.props.currentTab === 'Device groups') {
      this._refreshGroups();
    }
  }

  /*
   * Groups
   */
  _refreshGroups() {
    let tasks = [this.props.getGroups()];
    if (this.props.isEnterprise) {
      tasks.push(this.props.getDynamicGroups());
    }
    return Promise.all(tasks).catch(err => console.log(err));
  }

  _handleGroupChange(group) {
    this.props.selectGroup(group);
    this.props.history.push(group ? `/devices/group=${group}` : '/devices');
    this.setState({ loading: true, pageNo: 1 });
  }

  _removeCurrentGroup() {
    var self = this;
    const request = self.props.groupFilters.length
      ? self.props.removeDynamicGroup(self.props.selectedGroup)
      : self.props.removeStaticGroup(self.props.selectedGroup);
    return request
      .then(() => {
        self.props.setSnackbar('Group was removed successfully', 5000);
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
        self.props.setSnackbar(`The ${pluralize('devices', length)} ${pluralize('were', length)} removed from the group`, 5000);
      }
      return Promise.resolve();
    });
  }

  // Edit groups from device selection
  _addDevicesToGroup(tmpDevices) {
    // (save selected devices in state, open dialog)
    this.setState({ tmpDevices, modifyGroupDialog: !this.state.modifyGroupDialog });
  }

  _createGroupFromDialog(devices, group) {
    var self = this;
    let request = self.state.fromFilters ? self.props.addDynamicGroup(group, this.props.filters) : self.props.addStaticGroup(group, devices);
    return request
      .then(() => {
        // reached end of list
        self.setState({ createGroupDialog: false, modifyGroupDialog: false, fromFilters: false, tmpGroup: '', selectedField: '' }, () => {
          self.props.setSnackbar('The group was updated successfully', 5000);
          self._refreshGroups();
        });
      })
      .catch(err => {
        console.log(err);
        var errMsg = err.res.body.error || '';
        self.props.setSnackbar(preformatWithRequestID(err.res, `Group could not be updated: ${errMsg}`), null, 'Copy to clipboard');
      });
  }

  onGroupClick() {
    if (this.props.selectedGroup) {
      return this.props.updateDynamicGroup(this.props.selectedGroup, this.props.filters);
    }
    this.setState({ modifyGroupDialog: true, fromFilters: true });
  }

  _removeDevicesFromGroup(devices) {
    var self = this;
    clearInterval(self.deviceTimer);
    const isGroupRemoval = devices.length >= self.props.groupCount;
    const deviceRemovals = devices.map((device, i) => self._removeSingleDevice(i, devices.length, device, isGroupRemoval));
    return Promise.all(deviceRemovals)
      .then(() => {
        // if devices.length === groupCount
        // group now empty, go to all devices
        if (isGroupRemoval) {
          self.props.setSnackbar('Group was removed successfully', 5000);
          self.props.getGroups();
          self._handleGroupChange();
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    const self = this;
    const { acceptedCount, groups, groupsById, openSettingsDialog, selectedGroup, showHelptips } = self.props;
    const { createGroupDialog, fromFilters, modifyGroupDialog, removeGroup, tmpDevices } = self.state;
    return (
      <div className="tab-container">
        <div className="leftFixed">
          <Groups
            acceptedCount={acceptedCount}
            changeGroup={group => self._handleGroupChange(group)}
            groups={groupsById}
            openGroupDialog={() => self.setState({ createGroupDialog: !createGroupDialog })}
            selectedGroup={selectedGroup}
            showHelptips={showHelptips}
          />
        </div>
        <div className="rightFluid" style={{ paddingTop: '0' }}>
          <AuthorizedDevices
            addDevicesToGroup={devices => self._addDevicesToGroup(devices)}
            onGroupClick={() => self.onGroupClick()}
            onGroupRemoval={() => self.setState({ removeGroup: !removeGroup })}
            openSettingsDialog={openSettingsDialog}
            removeDevicesFromGroup={devices => self._removeDevicesFromGroup(devices)}
          />
        </div>
        {removeGroup && <RemoveGroup onClose={() => self.setState({ removeGroup: !removeGroup })} onRemove={() => self._removeCurrentGroup()} />}
        {modifyGroupDialog && (
          <CreateGroup
            addListOfDevices={(devices, group) => self._createGroupFromDialog(devices, group)}
            fromFilters={fromFilters}
            groups={groups}
            isCreation={fromFilters || !groups.length}
            selectedDevices={tmpDevices}
            onClose={() => self.setState({ createGroupDialog: false, modifyGroupDialog: false, fromFilters: false, tmpDevices: [] })}
          />
        )}
      </div>
    );
  }
}

const actionCreators = {
  addDeviceToGroup,
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
  removeDeviceFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  setSnackbar,
  updateDynamicGroup
};

const mapStateToProps = state => {
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  let groupFilters = [];
  if (!isEmpty(state.devices.groups.selectedGroup)) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupCount = state.devices.groups.byId[selectedGroup].total;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  const plan = state.users.organization ? state.users.organization.plan : 'os';
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    filters: state.devices.filters || [],
    groups: Object.keys(state.devices.groups.byId).sort(),
    groupsById: state.devices.groups.byId,
    groupCount,
    groupFilters,
    isEnterprise: state.app.features.isEnterprise || (state.app.features.isHosted && plan === 'enterprise'),
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceGroups);
