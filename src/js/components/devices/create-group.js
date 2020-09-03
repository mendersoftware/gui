import React from 'react';
import { connect } from 'react-redux';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import { getDevicesByStatus } from '../../actions/deviceActions';
import { DEVICE_STATES, UNGROUPED_GROUP } from '../../constants/deviceConstants';
import GroupDefinition from './group-management/group-definition';

export class CreateGroup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeStep: 0,
      invalid: true,
      isModification: !props.isCreation,
      newGroup: '',
      title: props.isCreationDynamic ? 'Create a new group' : `Add ${props.selectedDevices.length ? 'selected ' : ''}devices to group`
    };
    this.props.getDevicesByStatus(DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength);
  }

  onNameChange(isNotValid, newGroup, isModification) {
    const title = !this.props.isCreationDynamic ? `Add ${this.props.selectedDevices.length ? 'selected ' : ''}devices to group` : 'Create a new group';
    const invalid = isModification && this.props.isCreationDynamic ? true : isNotValid;
    this.setState({ invalid, isModification, newGroup, title });
  }

  render() {
    const self = this;
    const { addListOfDevices, groups, isCreationDynamic, onClose, selectedDevices, selectedGroup } = self.props;
    const { invalid, isModification, newGroup, title } = self.state;
    return (
      <Dialog disableBackdropClick disableEscapeKeyDown open={true} scroll={'paper'} fullWidth={true} maxWidth="sm">
        <DialogTitle style={{ paddingBottom: '15px', marginBottom: 0 }}>{title}</DialogTitle>
        <DialogContent className="dialog">
          <GroupDefinition
            groups={groups}
            isCreationDynamic={isCreationDynamic}
            isModification={isModification}
            newGroup={newGroup}
            onInputChange={(invalidName, name, isModification) => self.onNameChange(invalidName, name, isModification)}
            selectedGroup={selectedGroup}
          />
        </DialogContent>
        <DialogActions style={{ marginTop: 0 }}>
          <Button style={{ marginRight: 10 }} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={() => addListOfDevices(selectedDevices, newGroup)} disabled={!newGroup.length || invalid}>
            {!isModification || isCreationDynamic || groups.length === 0 ? 'Create group' : 'Add to group'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const actionCreators = { getDevicesByStatus };

const mapStateToProps = (state, ownProps) => {
  const deviceList = state.devices.selectedDeviceList.length > 0 ? state.devices.selectedDeviceList : state.devices.byStatus.accepted.deviceIds;
  const devices = deviceList.map(id => state.devices.byId[id]);
  const selectedGroupDevices = state.devices.groups.selectedGroup ? state.devices.groups.byId[state.devices.groups.selectedGroup].deviceIds : [];
  // ensure that existing dynamic groups are only listed if a dynamic group should be created
  const groups = Object.keys(state.devices.groups.byId).filter(group =>
    ownProps.fromFilters ? group !== UNGROUPED_GROUP.id : !state.devices.groups.byId[group].filters.length
  );
  return {
    devices,
    globalSettings: state.users.globalSettings,
    groups,
    isCreationDynamic: ownProps.isCreation && ownProps.fromFilters,
    selectedGroup: state.devices.groups.selectedGroup,
    selectedGroupDevices,
    userId: state.users.currentUser
  };
};

export default connect(mapStateToProps, actionCreators)(CreateGroup);
