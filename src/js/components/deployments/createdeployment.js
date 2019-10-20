import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepLabel, Stepper } from '@material-ui/core';

import SoftwareDevices from './deployment-wizard/softwaredevices';
import ScheduleRollout from './deployment-wizard/schedulerollout';
import Review from './deployment-wizard/review';

import AppStore from '../../stores/app-store';
import { getRemainderPercent } from '../../helpers';

const deploymentSteps = [
  { title: 'Select target software and devices', closed: false, component: SoftwareDevices },
  { title: 'Set a rollout schedule', closed: true, component: ScheduleRollout },
  { title: 'Review and create', closed: false, component: Review }
];

export default class CreateDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    const isEnterprise = AppStore.getIsEnterprise() || AppStore.getIsHosted();
    const steps = deploymentSteps.reduce((accu, step) => {
      if (step.closed && !isEnterprise) {
        return accu;
      }
      accu.push(step);
      return accu;
    }, []);
    this.state = {
      activeStep: 0,
      deploymentDeviceIds: [],
      isEnterprise,
      steps
    };
  }

  componentDidUpdate(prevProps) {
    // Update state if single device passed from props
    if (prevProps.device !== this.props.device && this.props.device) {
      this.setState({ deploymentDeviceIds: [this.props.device.id] });
    }
    if (prevProps.deploymentObject !== this.props.deploymentObject && this.props.deploymentObject) {
      this.setState({ ...this.props.deploymentObject });
    }
  }

  deploymentSettings(value, property) {
    this.setState({ [property]: value });
    if (property==='phases') {
      this.validatePhases(value);
    }
  }

  onScheduleSubmit(settings) {
    this.props.onScheduleSubmit(settings);
    this.setState({ activeStep: 0, deploymentDeviceIds: [], group: null, phases: null, release: null, disableSchedule: false });
  }

  closeWizard() {
    this.setState({ activeStep: 0, deploymentDeviceIds: [], group: null, phases: null, release: null, disableSchedule: false });
    this.props.onDismiss();
  }

  validatePhases(phases) {
    let valid = true;
    const remainder = getRemainderPercent(phases);
    for (var phase of phases) {
      const deviceCount =  Math.floor((this.state.deploymentDeviceIds.length / 100) * (phase.batch_size || remainder));
      if (deviceCount<1) { valid = false }
    }
    this.setState({disableSchedule: !valid});
  }

  render() {
    const self = this;
    const { device, open } = self.props;
    const { activeStep, deploymentDeviceIds, release, group, phases, steps } = self.state;
    const disabled = (activeStep === 0) ? !(release && deploymentDeviceIds.length) : self.state.disableSchedule;
    const finalStep = activeStep === steps.length - 1;
    const ComponentToShow = steps[activeStep].component;
    const deploymentSettings = {
      group: device ? device.id : group,
      deploymentDeviceIds,
      release,
      phases
    };
    return (
      <Dialog open={open || false} fullWidth={false} maxWidth="md">
        <DialogTitle>Create a deployment</DialogTitle>
        <DialogContent className="dialog">
          <Stepper activeStep={activeStep} alternativeLabel style={{ minWidth: '500px' }}>
            {steps.map(step => (
              <Step key={step.title}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <ComponentToShow disableSchedule={self.state.disableSchedule} deploymentAnchor={this.deploymentRef} {...self.props} {...self.state} deploymentSettings={(...args) => self.deploymentSettings(...args)} />
        </DialogContent>
        <DialogActions className="margin-left margin-right">
          <Button key="schedule-action-button-1" onClick={() => self.closeWizard()} style={{ marginRight: '10px', display: 'inline-block' }}>
            Cancel
          </Button>
          <Button disabled={activeStep === 0} onClick={() => self.setState({ activeStep: activeStep - 1 })}>
            Back
          </Button>
          <div style={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            buttonRef={ref => (this.deploymentRef = ref)}
            disabled={disabled}
            onClick={finalStep ? () => self.onScheduleSubmit(deploymentSettings) : () => self.setState({ activeStep: activeStep + 1 })}
          >
            {finalStep ? 'Create' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
