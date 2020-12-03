import React from 'react';
import { connect } from 'react-redux';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepLabel, Stepper } from '@material-ui/core';

import SoftwareDevices from './deployment-wizard/softwaredevices';
import ScheduleRollout from './deployment-wizard/schedulerollout';
import Review from './deployment-wizard/review';

import { selectDevice } from '../../actions/deviceActions';
import { selectRelease } from '../../actions/releaseActions';
import { advanceOnboarding } from '../../actions/onboardingActions';
import { saveGlobalSettings } from '../../actions/userActions';
import { UNGROUPED_GROUP } from '../../constants/deviceConstants';
import { onboardingSteps } from '../../constants/onboardingConstants';
import { getIsEnterprise } from '../../selectors';
import { validatePhases } from '../../helpers';

export const allDevices = 'All devices';

const deploymentSteps = [
  { title: 'Select target software and devices', closed: false, component: SoftwareDevices },
  { title: 'Set a rollout schedule', closed: true, component: ScheduleRollout },
  { title: 'Review and create', closed: false, component: Review }
];

export class CreateDialog extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      activeStep: 0,
      deploymentDeviceIds: [],
      steps: deploymentSteps,
      retries: props.retries
    };
  }

  componentDidMount() {
    const self = this;
    if (Object.keys(self.props.deploymentObject).length) {
      self.setState({ ...self.props.deploymentObject });
    }
    const steps = deploymentSteps.reduce((accu, step) => {
      if (step.closed && ((!self.props.isEnterprise && self.props.plan === 'os') || !(self.props.isHosted || self.props.isEnterprise))) {
        return accu;
      }
      accu.push(step);
      return accu;
    }, []);
    self.setState({ steps });
  }

  componentDidUpdate(prevProps) {
    // Update state if single device passed from props
    if (prevProps.device !== this.props.device && this.props.device) {
      this.setState({ deploymentDeviceIds: [this.props.device.id] });
    }
  }

  setDeploymentSettings(value, property) {
    this.setState({ [property]: value });
  }

  cleanUpDeploymentsStatus() {
    this.props.selectDevice();
    this.props.selectRelease();
    const location = window.location.hash.substring(0, window.location.hash.indexOf('?'));
    return location.length ? window.location.replace(location) : null; // lgtm [js/client-side-unvalidated-url-redirection]
  }

  onSaveRetriesSetting(hasNewRetryDefault) {
    this.setState({ hasNewRetryDefault });
  }

  onScheduleSubmit(settings) {
    if (this.state.hasNewRetryDefault) {
      this.props.saveGlobalSettings({ retries: settings.retries });
    }
    if (!this.props.isOnboardingComplete) {
      this.props.advanceOnboarding(onboardingSteps.SCHEDULING_RELEASE_TO_DEVICES);
    }
    this.props.onScheduleSubmit(settings);
    this.cleanUpDeploymentsStatus();
  }

  closeWizard() {
    this.cleanUpDeploymentsStatus();
    this.props.onDismiss();
  }

  render() {
    const self = this;
    const { device, deploymentObject, groups, release } = self.props;
    const { activeStep, deploymentDeviceIds, deploymentDeviceCount, group, phases, retries, steps } = self.state;
    const ComponentToShow = steps[activeStep].component;
    const deploymentSettings = {
      deploymentDeviceIds: deploymentObject.deploymentDeviceIds || deploymentDeviceIds,
      deploymentDeviceCount: deploymentObject.deploymentDeviceCount || deploymentDeviceCount,
      filterId: groups[deploymentObject.group || group] ? groups[deploymentObject.group || group].id : undefined,
      device,
      group: deploymentObject.group || group,
      phases,
      release: deploymentObject.release || release || self.state.release,
      retries: deploymentObject.retries || retries
    };
    const disableSchedule = !validatePhases(phases, deploymentSettings.deploymentDeviceCount, deploymentSettings.filterId);
    const disabled =
      activeStep === 0
        ? !(
            deploymentSettings.release &&
            (deploymentSettings.deploymentDeviceCount || deploymentSettings.filterId || (deploymentSettings.group && deploymentSettings.group !== allDevices))
          )
        : disableSchedule;
    const finalStep = activeStep === steps.length - 1;
    return (
      <Dialog open={true} fullWidth={false} maxWidth="md">
        <DialogTitle>Create a deployment</DialogTitle>
        <DialogContent className="dialog">
          <Stepper activeStep={activeStep} alternativeLabel style={{ minWidth: '500px' }}>
            {steps.map(step => (
              <Step key={step.title}>
                <StepLabel>{step.title}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <ComponentToShow
            deploymentAnchor={this.deploymentRef}
            filters={deploymentSettings.filterId ? groups[deploymentObject.group || group].filters : undefined}
            {...self.props}
            {...self.state}
            {...deploymentSettings}
            setDeploymentSettings={(...args) => self.setDeploymentSettings(...args)}
            onSaveRetriesSetting={shouldSave => self.onSaveRetriesSetting(shouldSave)}
          />
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

const actionCreators = { advanceOnboarding, saveGlobalSettings, selectDevice, selectRelease };

const mapStateToProps = state => {
  const { plan = 'os' } = state.organization.organization;
  // eslint-disable-next-line no-unused-vars
  const { [UNGROUPED_GROUP.id]: ungrouped, ...groups } = state.devices.groups.byId;
  return {
    isEnterprise: getIsEnterprise(state),
    isHosted: state.app.features.isHosted,
    device: state.devices.selectedDevice ? state.devices.byId[state.devices.selectedDevice] : null,
    groups,
    hasDevices: state.devices.byStatus.accepted.total || state.devices.byStatus.accepted.deviceIds.length > 0,
    isOnboardingComplete: state.onboarding.complete,
    plan,
    release: state.releases.selectedRelease ? state.releases.byId[state.releases.selectedRelease] : null,
    retries: state.users.globalSettings.retries
  };
};

export default connect(mapStateToProps, actionCreators)(CreateDialog);
