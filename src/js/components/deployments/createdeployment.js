import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepLabel, Stepper } from '@material-ui/core';

import SoftwareDevices from './deployment-wizard/softwaredevices';
import ScheduleRollout from './deployment-wizard/schedulerollout';
import Review from './deployment-wizard/review';

import AppStore from '../../stores/app-store';

const deploymentSteps = [
  { title: 'Select target software and devices', closed: false, component: SoftwareDevices },
  { title: 'Set a rollout schedule', closed: true, component: ScheduleRollout },
  { title: 'Review and create', closed: false, component: Review }
];

export default class ScheduleDialog extends React.Component {
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
      release: null,
      deploymentDeviceIds: [],
      isEnterprise,
      steps
    };
  }

  deploymentSettings(value, property) {
    this.setState({ [property]: value });
  }

  onScheduleSubmit(settings) {
    this.props.onScheduleSubmit(settings);
    this.setState({ activeStep: 0, deploymentDeviceIds: [], group: null, phases: [], release: null });
  }

  closeWizard() {
    this.setState({ activeStep: 0, deploymentDeviceIds: [], group: null, phases: [], release: null });
    this.props.onDismiss();
  }

  render() {
    const self = this;
    const { device, open, onDismiss } = this.props;
    const { activeStep, release, deploymentDeviceIds, group, phases, steps } = self.state;
    const disabled = !(release && deploymentDeviceIds.length);
    const finalStep = activeStep === steps.length - 1;
    const ComponentToShow = steps[activeStep].component;
    const deploymentSettings = {
      group: device ? null : group,
      deploymentDeviceIds,
      release,
      phases
    };
    return (
      <Dialog open={open || false} fullWidth={false} maxWidth="md">
        <DialogTitle>Create a deployment</DialogTitle>
        <DialogContent className="dialog">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map(step => (
              <Step key={step.title}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <ComponentToShow {...self.props} {...self.state} deploymentSettings={(...args) => self.deploymentSettings(...args)} />
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
