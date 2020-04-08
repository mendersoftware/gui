import React from 'react';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';

import { getDevicesByStatus } from '../../actions/deviceActions';
import * as DeviceConstants from '../../constants/deviceConstants';
import GroupDefinition from './group-management/group-definition';
import GroupDeviceList from './group-management/group-device-list';
import Confirmation from './group-management/confirmation';

const defaultSteps = [GroupDefinition, GroupDeviceList, Confirmation];

export class CreateGroup extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.cookies = new Cookies();
    const showWarning = !this.cookies.get(`${this.props.userId}-groupHelpText`);
    const steps = props.selectedDevices.length ? [defaultSteps[0], defaultSteps[2]] : defaultSteps;
    this.state = {
      activeStep: 0,
      invalid: showWarning,
      isModification: !props.isCreation,
      isCreationDynamic: props.isCreation && props.fromFilters,
      newGroup: '',
      selectedDevices: props.selectedDevices,
      showWarning,
      steps,
      title: props.isCreation ? 'Create a new group' : `Add ${props.selectedDevices.length ? 'selected ' : ''}devices to group`
    };
    this.props.getDevicesByStatus(DeviceConstants.DEVICE_STATES.accepted, this.state.pageNo, this.state.pageLength);
  }

  componentDidMount() {
    let steps = this.props.selectedDevices.length ? [defaultSteps[0], defaultSteps[2]] : defaultSteps;
    if (this.props.selectedDevices.length && !this.state.showWarning) {
      // cookie exists || if no other groups exist, continue to create group
      steps = steps.slice(0, steps.length - 1);
    }
    if (this.state.isCreationDynamic) {
      steps = [steps[0]];
    }
    this.setState({ steps });
  }

  onConfirm(checked) {
    this.cookies.set(`${this.props.userId}-groupHelpText`, checked, { expires: new Date('2500-12-31') });
    this.setState({ invalid: !checked });
  }

  onDeviceSelection(selectedDevices) {
    const willBeEmpty = this.props.selectedGroup && this.props.selectedGroupDevices.length === selectedDevices.length;
    this.setState({ selectedDevices, invalid: !selectedDevices.length, willBeEmpty });
  }

  onNameChange(invalid, newGroup, isModification) {
    let steps = this.state.steps;
    if (this.state.isModification !== isModification && isModification) {
      steps = this.state.selectedDevices.length ? [defaultSteps[0], defaultSteps[2]] : defaultSteps;
      steps = !this.state.showWarning ? steps.slice(0, steps.length - 1) : steps;
    }
    const title = isModification ? `Add ${this.props.selectedDevices.length ? 'selected ' : ''}devices to group` : 'Create a new group';
    this.setState({ invalid, isModification, newGroup, steps, title });
  }

  render() {
    const self = this;
    const { addListOfDevices, onClose } = self.props;
    const { activeStep, invalid, isModification, newGroup, selectedDevices, showWarning, steps, title } = self.state;
    const ComponentToShow = steps[activeStep];
    return (
      <Dialog disableBackdropClick disableEscapeKeyDown open={true} scroll={'paper'} fullWidth={true} maxWidth="sm">
        <DialogTitle style={{ paddingBottom: '15px', marginBottom: 0 }}>{title}</DialogTitle>
        <DialogContent className="dialog">
          <ComponentToShow
            onConfirm={checked => self.onConfirm(checked)}
            onDeviceSelection={ids => self.onDeviceSelection(ids)}
            onInputChange={(invalidName, name, isModification) => self.onNameChange(invalidName, name, isModification)}
            {...self.props}
            {...self.state}
          />
        </DialogContent>
        <DialogActions style={{ marginTop: 0 }}>
          <Button style={{ marginRight: 10 }} onClick={onClose}>
            Cancel
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" color="primary" onClick={() => self.setState({ activeStep: activeStep + 1 })} disabled={invalid}>
              Next
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={() => addListOfDevices(selectedDevices, newGroup)} disabled={!newGroup.length || invalid}>
              {!isModification || isCreationDynamic ? (showWarning ? 'Confirm' : 'Create group') : 'Add to group'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
}

const actionCreators = { getDevicesByStatus };

const mapStateToProps = state => {
  const deviceList = state.devices.selectedDeviceList.length > 0 ? state.devices.selectedDeviceList : state.devices.byStatus.accepted.deviceIds;
  const devices = deviceList.map(id => state.devices.byId[id]);
  const selectedGroupDevices = state.devices.groups.selectedGroup ? state.devices.groups.byId[state.devices.groups.selectedGroup].deviceIds : [];
  const groups = Object.keys(state.devices.groups.byId).filter(group => group !== DeviceConstants.UNGROUPED_GROUP.id);
  return {
    devices,
    globalSettings: state.users.globalSettings,
    groups,
    selectedGroup: state.devices.groups.selectedGroup,
    selectedGroupDevices,
    userId: state.users.currentUser
  };
};

export default connect(mapStateToProps, actionCreators)(CreateGroup);
