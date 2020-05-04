import React from 'react';
import { Link } from 'react-router-dom';
import { compose, setDisplayName } from 'recompose';

import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import DeploymentCompleteTip from '../components/helptips/deploymentcompletetip';

import { setOnboardingProgress, setShowCreateArtifactDialog } from '../actions/userActions';
import store from '../reducers';

import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';

const demoArtifactLink = 'https://dgsbl4vditpls.cloudfront.net/mender-demo-artifact.mender';

const onboardingTipSanityCheck = step =>
  !store.getState().users.onboarding.complete &&
  store.getState().users.onboarding.showTips &&
  store.getState().users.showHelptips &&
  !getOnboardingStepCompleted(step);

export const onboardingSteps = {
  'dashboard-onboarding-start': {
    condition: () => onboardingTipSanityCheck('dashboard-onboarding-start'),
    component: <div>Click here to get started!</div>,
    progress: 1
  },
  'devices-pending-onboarding': {
    condition: () => onboardingTipSanityCheck('devices-accepted-onboarding') && !!store.getState().devices.byStatus.pending.total > 0,
    component: <div>This should be your device, asking for permission to join the server. Inspect its identity details, then check it to accept it!</div>,
    progress: 1
  },
  'devices-pending-accepting-onboarding': {
    condition: () => onboardingTipSanityCheck('devices-accepted-onboarding') && store.getState().devices.byStatus.pending.total > 0,
    component: <div>If you recognize this device as your own, you can accept it</div>,
    progress: 2
  },
  'dashboard-onboarding-pendings': {
    condition: () =>
      onboardingTipSanityCheck('dashboard-onboarding-pendings') &&
      getOnboardingStepCompleted('devices-pending-onboarding') &&
      store.getState().devices.byStatus.pending,
    component: <div>Next accept your device</div>,
    progress: 2
  },
  'devices-accepted-onboarding': {
    condition: () => onboardingTipSanityCheck('devices-accepted-onboarding') && store.getState().devices.byStatus.accepted.total > 0,
    component: (
      <div>
        <b>Good job! Your first device is connected!</b>
        <p>
          Your device is now <b>accepted</b>! It&apos;s now going to share inventory details with the server.
        </p>
        Click to expand the device and see more
      </div>
    ),
    progress: 1
  },
  'application-update-reminder-tip': {
    condition: () =>
      onboardingTipSanityCheck('artifact-included-deploy-onboarding') &&
      window.location.hash.endsWith('#/devices') &&
      store.getState().devices.byStatus.accepted.total > 0 &&
      (Object.values(store.getState().devices.byId).every(item => !!item.attributes) || getOnboardingStepCompleted('devices-accepted-onboarding')),
    component: (
      <div>
        <b>Deploy your first Application update</b>
        <p>
          To continue to make a demo deployment to this device click the <Link to="/releases">Releases</Link> tab
        </p>
      </div>
    ),
    progress: 2
  },
  'upload-prepared-artifact-tip': {
    condition: () =>
      onboardingTipSanityCheck('artifact-included-onboarding') &&
      getOnboardingStepCompleted('devices-accepted-onboarding') &&
      !Object.keys(store.getState().releases.byId).length,
    component: (
      <div>
        Download our prepared demo Artifact from <a href={demoArtifactLink}>here</a> to upload it to your profile.
      </div>
    ),
    progress: 2
  },
  'artifact-included-onboarding': {
    condition: () => onboardingTipSanityCheck('deployments-inprogress') && getOnboardingStepCompleted('devices-accepted-onboarding'),
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        {store.getState().users.onboarding.artifactIncluded ? 'We have included' : 'Now you have'} a Mender artifact with a simple Application update for you to
        test with.<p>Expand it for more details.</p>
      </div>
    )),
    progress: 1
  },
  'artifact-included-deploy-onboarding': {
    condition: () => onboardingTipSanityCheck('deployments-inprogress') && getOnboardingStepCompleted('artifact-included-onboarding'),
    component: <div>Let&apos;s deploy this Release to your device now</div>,
    progress: 1
  },
  'scheduling-artifact-selection': {
    condition: () =>
      onboardingTipSanityCheck('scheduling-artifact-selection') &&
      store.getState().devices.byStatus.accepted.total &&
      store.getState().releases.selectedRelease,
    component: compose(setDisplayName('OnboardingTip'))(() => <div>{`Select the ${store.getState().releases.selectedRelease} release we included.`}</div>),
    progress: 2
  },
  'scheduling-all-devices-selection': {
    condition: () =>
      onboardingTipSanityCheck('scheduling-all-devices-selection') &&
      store.getState().devices.byStatus.accepted.total &&
      !store.getState().devices.selectedDevice,
    component: (
      <div>
        Select &apos;All devices&apos; for now.<p>You can learn how to create device groups later.</p>
      </div>
    ),
    progress: 2
  },
  'scheduling-group-selection': {
    condition: () =>
      onboardingTipSanityCheck('scheduling-group-selection') &&
      store.getState().devices.byStatus.accepted.total &&
      (store.getState().devices.selectedDeviceList.length || store.getState().devices.selectedDevice) &&
      Object.values(store.getState().devices.groups.byId).length > 0,
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>{`Select the ${Object.values(store.getState().devices.groups.byId)[1]} device group you just made.`}</div>
    )),
    progress: 2
  },
  'scheduling-release-to-devices': {
    condition: () =>
      onboardingTipSanityCheck('scheduling-release-to-devices') &&
      ((store.getState().devices.byStatus.accepted.total &&
        (store.getState().devices.groups.selectedGroup || store.getState().devices.selectedDeviceList.length || store.getState().devices.selectedDevice) &&
        store.getState().releases.selectedRelease) ||
        store.getState().deployments.byStatus.finished.total ||
        store.getState().deployments.byStatus.finished.deploymentIds.length),
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>{`Create the deployment! This will deploy the ${store.getState().releases.selectedRelease} Artifact to ${
        store.getState().devices.selectedDevice ? store.getState().devices.selectedDevice : store.getState().devices.groups.selectedGroup || 'All devices'
      }`}</div>
    ))
  },
  'deployments-inprogress': {
    condition: () => onboardingTipSanityCheck('upload-new-artifact-tip') && store.getState().deployments.byStatus.inprogress.total,
    component: <div>Your deployment is in progress. Click to view a report</div>,
    progress: 2
  },
  'deployments-past': {
    condition: () =>
      onboardingTipSanityCheck('upload-new-artifact-tip') && store.getState().deployments.byStatus.finished.total && !window.location.hash.includes('finished'),
    component: <div>Your deployment has finished, click here to view it</div>,
    progress: 3
  },
  'deployments-past-completed': {
    condition: () => onboardingTipSanityCheck('deployments-past-completed') && store.getState().deployments.byStatus.finished.total,
    component: <DeploymentCompleteTip targetUrl="destination-unreachable" />
  },
  'deployments-past-completed-failure': {
    condition: () => {
      const deployments = store.getState().deployments;
      const pastDeploymentsFailed = deployments.byStatus.finished.deploymentIds.reduce((accu, id) => {
        const item = deployments.byId[id];
        if (item.status === 'failed' || (item.stats && item.stats.noartifact + item.stats.failure + item.stats['already-installed'] + item.stats.aborted > 0)) {
          return false;
        }
        return accu;
      }, true);
      return onboardingTipSanityCheck('deployments-past-completed-failure') && !pastDeploymentsFailed;
    },
    component: (
      <div>Your deployment has finished, but it looks like there was a problem. Click to view the deployment report, where you can see the error log.</div>
    )
  },
  'upload-new-artifact-tip': {
    condition: () => onboardingTipSanityCheck('upload-new-artifact-tip') && getOnboardingStepCompleted('deployments-past-completed'),
    component: (
      <div>
        Click &apos;Upload&apos; to upload the file and create your new Release.
        <p>
          You can <a onClick={() => store.dispatch(setShowCreateArtifactDialog(true))}>view the instructions again</a> if you need help creating the{' '}
          <i>index.html</i> file.
        </p>
      </div>
    ),
    progress: 2
  },
  'upload-new-artifact-dialog-upload': {
    condition: () => onboardingTipSanityCheck('upload-new-artifact-dialog-upload'),
    component: (
      <div>
        Drag or select your new <i>index.html</i> file here to upload it.
      </div>
    ),
    progress: 2
  },
  'upload-new-artifact-dialog-destination': {
    condition: () => onboardingTipSanityCheck('upload-new-artifact-dialog-destination') && getOnboardingStepCompleted('upload-new-artifact-dialog-upload'),
    component: (
      <div>
        We have prefilled this for you, for the demo - it is the destination on your device where the new <i>index.html</i> file will be installed.
        <p>Click &apos;Next&apos; below.</p>
      </div>
    ),
    progress: 2
  },
  'upload-new-artifact-dialog-device-type': {
    condition: () => onboardingTipSanityCheck('upload-new-artifact-dialog-device-type') && getOnboardingStepCompleted('upload-new-artifact-dialog-upload'),
    component: <div>Enter the device types this will be compatible with. For the demo, you just need to select the device type of your demo device.</div>,
    progress: 2
  },
  'upload-new-artifact-dialog-release-name': {
    condition: () =>
      onboardingTipSanityCheck('upload-new-artifact-dialog-release-name') && getOnboardingStepCompleted('upload-new-artifact-dialog-device-type'),
    component: (
      <div>
        Now name your Release: for the demo you could call it something like &quot;hello-world&quot;.
        <p>Then click &apos;Upload&apos; to finish this step!</p>
      </div>
    ),
    progress: 2
  },
  'artifact-modified-onboarding': {
    condition: () => onboardingTipSanityCheck('artifact-modified-onboarding') && getOnboardingStepCompleted('upload-new-artifact-dialog-release-name'),
    component: (
      <div>
        Your uploaded Artifact is now part of a new &apos;Release&apos;.
        <p>Now create a deployment with this Release!</p>
      </div>
    ),
    progress: 1
  },
  'onboarding-finished': {
    condition: () =>
      onboardingTipSanityCheck('onboarding-finished') &&
      getOnboardingStepCompleted('artifact-modified-onboarding') &&
      store.getState().deployments.byStatus.finished.total > 1,
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  }
};

export const getCurrentOnboardingState = () => {
  const { showTipsDialog, showConnectDeviceDialog, showCreateArtifactDialog, ...state } = store.getState().users.onboarding; // eslint-disable-line no-unused-vars
  return state;
};

export function getOnboardingComponentFor(id, params, previousComponent = null) {
  const step = onboardingSteps[id];
  if (!step.condition()) {
    return previousComponent;
  }
  if (step.specialComponent) {
    return React.cloneElement(step.specialComponent, params);
  }
  const component = typeof step.component === 'function' ? step.component() : step.component;
  return <BaseOnboardingTip id={id} component={component} progress={step.progress || params.progress || null} {...params} />;
}

export function getOnboardingStepCompleted(id) {
  const progress = store.getState().users.onboarding.progress;
  const stepIndex = Object.keys(onboardingSteps).findIndex(step => step === id);
  return progress > stepIndex;
}

export const determineProgress = (acceptedDevices, pendingDevices, releases, pastDeployments) => {
  const steps = Object.keys(onboardingSteps);
  let progress = -1;
  progress = pendingDevices.length > 1 ? steps.findIndex(step => step === 'devices-pending-accepting-onboarding') : progress;
  progress = acceptedDevices.length >= 1 ? steps.findIndex(step => step === 'application-update-reminder-tip') : progress;
  progress = acceptedDevices.length > 1 && releases.length > 1 ? steps.findIndex(step => step === 'application-update-reminder-tip') : progress;
  progress =
    acceptedDevices.length > 1 && releases.length > 1 && pastDeployments.length > 1 ? steps.findIndex(step => step === 'deployments-past-completed') : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 1
      ? steps.findIndex(step => step === 'artifact-modified-onboarding')
      : progress;
  progress =
    acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2 ? steps.findIndex(step => step === 'onboarding-finished') : progress;
  return progress;
};

export function advanceOnboarding(stepId) {
  const progress = store.getState().users.onboarding.progress;
  const stepIndex = Object.keys(onboardingSteps).findIndex(step => step === stepId);
  const madeProgress = progress <= stepIndex ? stepIndex + 1 : progress;
  store.dispatch(setOnboardingProgress(madeProgress));
  const state = Object.assign(getCurrentOnboardingState(), { progress: madeProgress });
  state.complete = state.progress >= Object.keys(onboardingSteps).length ? true : state.complete;
  persistOnboardingState(state);
}

export function persistOnboardingState(state = getCurrentOnboardingState()) {
  const userId = store.getState().users.currentUser;
  const onboardingKey = `${userId}-onboarding`;
  window.localStorage.setItem(onboardingKey, JSON.stringify(state));
}
