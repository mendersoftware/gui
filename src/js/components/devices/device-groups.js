import React from 'react';
import { connect } from 'react-redux';

import AuthorizedDevices from './authorized-devices';
import CreateGroup from './create-group';
import Groups from './groups';
import RemoveGroup from './remove-group';
import {
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  updateDynamicGroup
} from '../../actions/deviceActions';
import { getIsEnterprise } from '../../selectors';
import CreateGroupExplainer from './create-group-explainer';

export class DeviceGroups extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      createGroupExplanation: false,
      modifyGroupDialog: false,
      removeGroup: false,
      tmpDevices: []
    };
    this._refreshGroups();
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
    this.props.history.push(group ? `/devices?group=${group}` : '/devices');
  }

  _removeCurrentGroup() {
    var self = this;
    const request = self.props.groupFilters.length
      ? self.props.removeDynamicGroup(self.props.selectedGroup)
      : self.props.removeStaticGroup(self.props.selectedGroup);
    return request.then(() => self.setState({ removeGroup: !self.state.removeGroup })).catch(err => console.log(err));
  }

  // Edit groups from device selection
  _addDevicesToGroup(tmpDevices) {
    // (save selected devices in state, open dialog)
    this.setState({ tmpDevices, modifyGroupDialog: !this.state.modifyGroupDialog });
  }

  _createGroupFromDialog(devices, group) {
    var self = this;
    let request = self.state.fromFilters ? self.props.addDynamicGroup(group, this.props.filters) : self.props.addStaticGroup(group, devices);
    return request.then(() => {
      // reached end of list
      self.setState({ createGroupExplanation: false, modifyGroupDialog: false, fromFilters: false }, () => self._refreshGroups());
    });
  }

  onGroupClick() {
    if (this.props.selectedGroup) {
      return this.props.updateDynamicGroup(this.props.selectedGroup, this.props.filters);
    }
    this.setState({ modifyGroupDialog: true, fromFilters: true });
  }

  _removeDevicesFromGroup(devices) {
    const self = this;
    clearInterval(self.deviceTimer);
    const isGroupRemoval = devices.length >= self.props.groupCount;
    let request;
    if (isGroupRemoval) {
      request = self.props.removeStaticGroup(self.props.selectedGroup);
    } else {
      request = self.props.removeDevicesFromGroup(self.props.selectedGroup, devices);
    }
    return request.catch(err => console.log(err));
  }

  render() {
    const self = this;
    const { acceptedCount, groups, groupsById, isEnterprise, openSettingsDialog, selectedGroup, showHelptips } = self.props;
    const { createGroupExplanation, fromFilters, modifyGroupDialog, removeGroup, tmpDevices } = self.state;
    return (
      <div className="tab-container">
        <div className="leftFixed">
          <Groups
            acceptedCount={acceptedCount}
            changeGroup={group => self._handleGroupChange(group)}
            groups={groupsById}
            openGroupDialog={() => self.setState({ createGroupExplanation: true })}
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
            onClose={() => self.setState({ modifyGroupDialog: false, fromFilters: false, tmpDevices: [] })}
          />
        )}
        {createGroupExplanation && <CreateGroupExplainer isEnterprise={isEnterprise} onClose={() => self.setState({ createGroupExplanation: false })} />}
      </div>
    );
  }
}

const actionCreators = {
  addDynamicGroup,
  addStaticGroup,
  getDynamicGroups,
  getGroups,
  initializeGroupsDevices,
  removeDevicesFromGroup,
  removeDynamicGroup,
  removeStaticGroup,
  selectGroup,
  updateDynamicGroup
};

const mapStateToProps = state => {
  let groupCount = state.devices.byStatus.accepted.total;
  let selectedGroup;
  let groupFilters = [];
  if (state.devices.groups.selectedGroup && state.devices.groups.byId[state.devices.groups.selectedGroup]) {
    selectedGroup = state.devices.groups.selectedGroup;
    groupCount = state.devices.groups.byId[selectedGroup].total;
    groupFilters = state.devices.groups.byId[selectedGroup].filters || [];
  }
  return {
    acceptedCount: state.devices.byStatus.accepted.total || 0,
    filters: state.devices.filters || [],
    groups: Object.keys(state.devices.groups.byId).sort(),
    groupsById: state.devices.groups.byId,
    groupCount,
    groupFilters,
    isEnterprise: getIsEnterprise(state),
    selectedGroup,
    showHelptips: state.users.showHelptips
  };
};

export default connect(mapStateToProps, actionCreators)(DeviceGroups);
