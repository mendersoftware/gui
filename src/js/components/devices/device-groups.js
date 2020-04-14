import React from 'react';
import { connect } from 'react-redux';
import pluralize from 'pluralize';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import CreateGroup from './create-group';
import AuthorizedDevices from './authorized-devices';
import Groups from './groups';
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

import * as DeviceConstants from '../../constants/deviceConstants';
import { isEmpty, isUngroupedGroup, preformatWithRequestID } from '../../helpers';

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
    return Promise.all([this.props.getGroups(), this.props.getDynamicGroups()]).catch(err => console.log(err));
  }

  _handleGroupChange(group) {
    if (isUngroupedGroup(group)) {
      group = DeviceConstants.UNGROUPED_GROUP.id;
    }
    this.props.selectGroup(group);
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
    this.setState({ createGroupDialog: true, fromFilters: true });
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
    const { acceptedCount, allCount, currentTab, groups, openSettingsDialog, selectedGroup, showHelptips } = self.props;
    const { createGroupDialog, fromFilters, modifyGroupDialog, removeGroup, tmpDevices } = self.state;

    return (
      <div className="tab-container">
        <div className="leftFixed">
          <Groups
            acceptedCount={acceptedCount}
            allCount={allCount}
            changeGroup={group => self._handleGroupChange(group)}
            groups={groups}
            openGroupDialog={() => self.setState({ createGroupDialog: !createGroupDialog })}
            selectedGroup={selectedGroup}
            showHelptips={showHelptips}
          />
        </div>
        <div className="rightFluid" style={{ paddingTop: '0' }}>
          <AuthorizedDevices
            addDevicesToGroup={devices => self._addDevicesToGroup(devices)}
            currentTab={currentTab}
            groups={groups}
            onGroupClick={() => self.onGroupClick()}
            onGroupRemoval={() => self.setState({ removeGroup: !removeGroup })}
            openSettingsDialog={openSettingsDialog}
            removeDevicesFromGroup={devices => self._removeDevicesFromGroup(devices)}
          />
        </div>

        {removeGroup && (
          <Dialog open={removeGroup}>
            <DialogTitle>Remove this group?</DialogTitle>
            <DialogContent>
              <p>This will remove the group from the list. Are you sure you want to continue?</p>
            </DialogContent>
            <DialogActions>
              <Button key="remove-action-button-1" onClick={() => self.setState({ removeGroup: !removeGroup })} style={{ marginRight: '10px' }}>
                Cancel
              </Button>
              <Button variant="contained" key="remove-action-button-2" color="primary" onClick={() => self._removeCurrentGroup()}>
                Remove group
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {(createGroupDialog || modifyGroupDialog) && (
          <CreateGroup
            addListOfDevices={(devices, group) => self._createGroupFromDialog(devices, group)}
            fromFilters={fromFilters}
            groups={groups}
            isCreation={createGroupDialog}
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
  const groups = Object.entries(state.devices.groups.byId)
    .reduce((accu, [key, value]) => {
      if (value.total || value.deviceIds.length || value.filters.length) {
        accu.push(key);
      }
      return accu;
    }, [])
    .sort();
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    allCount: state.devices.byStatus.accepted.total + state.devices.byStatus.rejected.total || 0,
    filters: state.devices.filters || [],
    groups,
    groupCount,
    groupFilters,
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceGroups);
