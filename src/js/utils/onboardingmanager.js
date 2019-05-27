import React from 'react';
import { Link } from 'react-router-dom';
import { compose, setDisplayName } from 'recompose';

import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import DeploymentCompleteTip from '../components/helptips/deploymentcompletetip';

import AppActions from '../actions/app-actions';
import AppStore from '../stores/app-store';
import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';

const onboardingTipSanityCheck = () => !AppStore.getOnboardingComplete() && AppStore.getShowOnboardingTips() && AppStore.showHelptips();

const onboardingSteps = {
  'dashboard-onboarding-start': {
    condition: () => onboardingTipSanityCheck() && !getOnboardingStepCompleted('dashboard-onboarding-start'),
    component: <div>Click here to get started!</div>,
    progress: 1
  },
  'devices-pending-onboarding': {
    condition: () => onboardingTipSanityCheck() && AppStore.getPendingDevices().length && !getOnboardingStepCompleted('devices-accepted-onboarding'),
    component: <div>This should be your device, asking for permission to join the server. Inspect its identity details, then check it to accept it!</div>,
    progress: 1
  },
  'devices-pending-accepting-onboarding': {
    condition: () => onboardingTipSanityCheck() && AppStore.getPendingDevices().length && !getOnboardingStepCompleted('devices-accepted-onboarding'),
    component: <div>If you recognize this device as your own, you can accept it</div>,
    progress: 2
  },
  'dashboard-onboarding-pendings': {
    condition: () => onboardingTipSanityCheck() && getOnboardingStepCompleted('devices-pending-onboarding') && AppStore.getPendingDevices().length,
    component: <div>Next accept your device</div>,
    progress: 2
  },
  'devices-accepted-onboarding': {
    condition: () => onboardingTipSanityCheck() && AppStore.getAcceptedDevices().length && !getOnboardingStepCompleted('devices-accepted-onboarding'),
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
      onboardingTipSanityCheck() &&
      window.location.hash.endsWith('#/devices') &&
      AppStore.getAcceptedDevices().every(item => !!item.attributes) &&
      getOnboardingStepCompleted('devices-accepted-onboarding') &&
      !getOnboardingStepCompleted('artifact-included-deploy-onboarding'),
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
  'artifact-included-onboarding': {
    condition: () =>
      onboardingTipSanityCheck() && getOnboardingStepCompleted('devices-accepted-onboarding') && !getOnboardingStepCompleted('deployments-inprogress'),
    component: (
      <div>
        We have included a Mender artifact with a simple Application update for you to test with.<p>Expand it for more details.</p>
      </div>
    ),
    progress: 1
  },
  'artifact-included-deploy-onboarding': {
    condition: () =>
      onboardingTipSanityCheck() && getOnboardingStepCompleted('artifact-included-onboarding') && !getOnboardingStepCompleted('deployments-inprogress'),
    component: <div>Let&apos;s deploy this Release to your device now</div>,
    progress: 1
  },
  'scheduling-artifact-selection': {
    condition: () => onboardingTipSanityCheck() && AppStore.getTotalAcceptedDevices() && AppStore.getDeploymentRelease(),
    component: compose(setDisplayName('OnboardingTip'))(() => <div>{`Select the ${AppStore.getDeploymentRelease().Name} release we included.`}</div>),
    progress: 2
  },
  'scheduling-all-devices-selection': {
    condition: () => onboardingTipSanityCheck() && AppStore.getTotalAcceptedDevices() && !AppStore.getSelectedDevice(),
    component: (
      <div>
        Select &apos;All devices&apos; for now.<p>You can learn how to create device groups later.</p>
      </div>
    ),
    progress: 2
  },
  'scheduling-group-selection': {
    condition: () => onboardingTipSanityCheck() && AppStore.getTotalAcceptedDevices() && !AppStore.getSelectedDevice() && AppStore.getGroups().length > 1, // group 0 will be the ungrouped group and always present
    component: compose(setDisplayName('OnboardingTip'))(() => <div>{`Select the ${AppStore.getGroups()[1]} device group you just made.`}</div>),
    progress: 2
  },
  'scheduling-release-to-devices': {
    condition: () =>
      onboardingTipSanityCheck() &&
      AppStore.getTotalAcceptedDevices() &&
      (AppStore.getSelectedGroup() || AppStore.getSelectedDevice()) &&
      AppStore.getDeploymentRelease(),
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>{`Create the deployment! This will deploy the ${AppStore.getDeploymentRelease().Name} Artifact to ${
        AppStore.getSelectedDevice() ? AppStore.getSelectedDevice().id : AppStore.getSelectedGroup() || 'All devices'
      }`}</div>
    ))
  },
  'deployments-inprogress': {
    condition: () => onboardingTipSanityCheck() && AppStore.getDeploymentsInProgress().length && !getOnboardingStepCompleted('upload-new-artifact-tip'),
    component: <div>Your deployment is in progress. Click to view a report</div>,
    progress: 2
  },
  'deployments-past': {
    condition: () =>
      onboardingTipSanityCheck() &&
      AppStore.getPastDeployments().length &&
      !window.location.hash.includes('finished') &&
      !getOnboardingStepCompleted('upload-new-artifact-tip'),
    component: <div>Your deployment has finished, click here to view it</div>,
    progress: 3
  },
  'deployments-past-completed': {
    condition: () => onboardingTipSanityCheck() && AppStore.getPastDeployments().length && !getOnboardingStepCompleted('upload-new-artifact-tip'),
    component: <DeploymentCompleteTip targetUrl="destination-unreachable" />
  },
  'deployments-past-completed-failure': {
    condition: () => onboardingTipSanityCheck() && !AppStore.getPastDeployments().reduce((accu, item) => (item.status === 'failed' ? false : accu), true),
    component: (
      <div>Your deployment has finished, but it looks like there was a problem. Click to view the deployment report, where you can see the error log.</div>
    )
  },
  'upload-new-artifact-tip': {
    condition: () =>
      onboardingTipSanityCheck() && getOnboardingStepCompleted('deployments-past-completed') && !getOnboardingStepCompleted('upload-new-artifact-tip'),
    component: (
      <div>
        Now upload your new Artifact here!
        <p>
          Or <a onClick={() => AppActions.setShowCreateArtifactDialog(true)}>view the instructions again</a> on how to edit the demo webserver application and
          create your own Artifact
        </p>
      </div>
    ),
    progress: 2
  },
  'artifact-modified-onboarding': {
    condition: () => onboardingTipSanityCheck() && getOnboardingStepCompleted('upload-new-artifact-tip'),
    component: (
      <div>
        Your uploaded Artifact is now part of a new &apos;Release&apos;.
        <p>Now create a deployment with this Release!</p>
      </div>
    ),
    progress: 1
  },
  'onboarding-finished': {
    condition: () => onboardingTipSanityCheck() && getOnboardingStepCompleted('artifact-modified-onboarding') && AppStore.getPastDeployments().length > 1,
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  }
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
  const progress = AppStore.getOnboardingProgress();
  const stepIndex = Object.keys(onboardingSteps).findIndex(step => step === id);
  return progress > stepIndex;
}

export function getOnboardingState(userId) {
  const onboardingState = JSON.parse(window.localStorage.getItem(`${userId}-onboarding`));
  if (onboardingState) {
    AppActions.setOnboardingComplete(onboardingState.complete);
    AppActions.setShowOnboardingHelp(onboardingState.showTips);
    AppActions.setOnboardingProgress(onboardingState.progress);
    AppActions.setConnectingDialogProgressed(onboardingState.connectionDialogProgressed);
    const progress = Object.keys(onboardingSteps).findIndex(step => step === 'deployments-past-completed');
    AppActions.setShowCreateArtifactDialog(Math.abs(onboardingState.progress - progress) <= 1);
  }
  return onboardingState;
}

export function advanceOnboarding(stepId) {
  const user = AppStore.getCurrentUser();
  const onboardingKey = `${user.id}-onboarding`;
  let onboardingState = JSON.parse(window.localStorage.getItem(onboardingKey));
  const progress =
    onboardingState && onboardingState.progress >= AppStore.getOnboardingProgress() ? onboardingState.progress : AppStore.getOnboardingProgress();
  const stepIndex = Object.keys(onboardingSteps).findIndex(step => step === stepId);
  const madeProgress = progress <= stepIndex ? stepIndex + 1 : progress;
  AppActions.setOnboardingProgress(madeProgress);
  if (onboardingState) {
    onboardingState.progress = madeProgress;
    window.localStorage.setItem(onboardingKey, onboardingState);
  }
}
