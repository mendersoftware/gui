import React from 'react';
import { Link } from 'react-router-dom';
import { compose, setDisplayName } from 'recompose';

import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import DeploymentCompleteTip from '../components/helptips/deploymentcompletetip';
import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';
import { DevicePendingTip, WelcomeSnackTip } from '../components/helptips/onboardingtips';

export const onboardingSteps = {
  'onboarding-start': {
    condition: { min: 'onboarding-start', max: 'devices-pending-accepting-onboarding' },
    specialComponent: <WelcomeSnackTip progress={1} />
  },
  'dashboard-onboarding-start': {
    condition: { min: 'onboarding-start' },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Click here to get started!</div>),
    progress: 1
  },
  'devices-pending-onboarding-start': {
    condition: { min: 'dashboard-onboarding-start', max: 'devices-pending-onboarding' },
    specialComponent: <DevicePendingTip />
  },
  'devices-pending-onboarding': {
    condition: { min: 'dashboard-onboarding-start' }, // && !!store.getState().devices.byStatus.pending.total > 0,
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>This should be your device, asking for permission to join the server. Inspect its identity details, then check it to accept it!</div>
    )),
    progress: 1
  },
  'devices-pending-accepting-onboarding': {
    condition: { min: 'devices-pending-onboarding', max: 'devices-accepted-onboarding' }, // && store.getState().devices.byStatus.pending.total > 0,
    component: compose(setDisplayName('OnboardingTip'))(() => <div>If you recognize this device as your own, you can accept it</div>),
    progress: 2
  },
  'dashboard-onboarding-pendings': {
    condition: { min: 'devices-pending-onboarding' }, //store.getState().devices.byStatus.pending,
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Next accept your device</div>),
    progress: 2
  },
  'devices-accepted-onboarding': {
    condition: { min: 'devices-accepted-onboarding', max: 'application-update-reminder-tip' }, // && store.getState().devices.byStatus.accepted.total > 0,
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        <b>Good job! Your first device is connected!</b>
        <p>
          Your device is now <b>accepted</b>! It&apos;s now going to share inventory details with the server.
        </p>
        Click to expand the device and see more
      </div>
    )),
    progress: 1
  },
  'devices-accepted-onboarding-notification': {
    condition: { min: 'dashboard-onboarding-pendings', max: 'application-update-reminder-tip' },
    specialComponent: <WelcomeSnackTip progress={2} />
  },
  'application-update-reminder-tip': {
    condition: { min: 'application-update-reminder-tip', max: 'artifact-included-deploy-onboarding', extra: () => window.location.hash.endsWith('#/devices') },
    //  store.getState().devices.byStatus.accepted.total > 0 && (Object.values(store.getState().devices.byId).every(item => Object.values(item.attributes).some(value => value)) || getOnboardingStepCompleted('devices-accepted-onboarding')),
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        <b>Deploy your first Application update</b>
        <p>
          To continue to make a demo deployment to this device click the <Link to="/releases">Releases</Link> tab
        </p>
      </div>
    )),
    progress: 2
  },
  'upload-prepared-artifact-tip': {
    condition: { min: 'devices-accepted-onboarding', max: 'artifact-included-onboarding' }, // !Object.keys(store.getState().releases.byId).length,
    component: compose(setDisplayName('OnboardingTip'))(({ demoArtifactLink }) => (
      <div>
        Download our prepared demo Artifact from <a href={demoArtifactLink}>here</a> to upload it to your profile.
      </div>
    )),
    progress: 2
  },
  'artifact-included-onboarding': {
    condition: { min: 'devices-accepted-onboarding', max: 'deployments-inprogress' },
    component: compose(setDisplayName('OnboardingTip'))(({ artifactIncluded }) => (
      <div>
        {artifactIncluded ? 'We have included' : 'Now you have'} a Mender artifact with a simple Application update for you to test with.
        <p>Expand it for more details.</p>
      </div>
    )),
    progress: 1
  },
  'artifact-included-deploy-onboarding': {
    condition: { min: 'artifact-included-onboarding', max: 'deployments-inprogress' },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Let&apos;s deploy this Release to your device now</div>),
    progress: 1
  },
  'scheduling-artifact-selection': {
    condition: { min: 'artifact-included-deploy-onboarding' }, // store.getState().devices.byStatus.accepted.total && store.getState().releases.selectedRelease,
    component: compose(setDisplayName('OnboardingTip'))(({ selectedRelease }) => <div>{`Select the ${selectedRelease} release we included.`}</div>),
    progress: 2
  },
  'scheduling-all-devices-selection': {
    condition: { min: 'scheduling-all-devices-selection', max: 'scheduling-release-to-devices' }, // store.getState().devices.byStatus.accepted.total && !store.getState().devices.selectedDevice,
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Select &apos;All devices&apos; for now.<p>You can learn how to create device groups later.</p>
      </div>
    )),
    progress: 2
  },
  'scheduling-group-selection': {
    condition: { min: 'scheduling-group-selection' }, // store.getState().devices.byStatus.accepted.total && (store.getState().devices.selectedDeviceList.length || store.getState().devices.selectedDevice) && Object.values(store.getState().devices.groups.byId).length > 0,
    component: compose(setDisplayName('OnboardingTip'))(({ createdGroup }) => <div>{`Select the ${createdGroup} device group you just made.`}</div>),
    progress: 2
  },
  'scheduling-release-to-devices': {
    condition: { min: 'scheduling-release-to-devices', max: 'deployments-inprogress' },
    // ((store.getState().devices.byStatus.accepted.total &&
    //   (store.getState().devices.groups.selectedGroup || store.getState().devices.selectedDeviceList.length || store.getState().devices.selectedDevice) &&
    //   store.getState().releases.selectedRelease) ||
    //   store.getState().deployments.byStatus.finished.total ||
    //   store.getState().deployments.byStatus.finished.deploymentIds.length),
    component: compose(setDisplayName('OnboardingTip'))(({ selectedDevice, selectedGroup, selectedRelease }) => (
      <div>{`Create the deployment! This will deploy the ${selectedRelease} Artifact to ${
        selectedDevice ? selectedDevice : selectedGroup || 'All devices'
      }`}</div>
    ))
  },
  'deployments-inprogress': {
    condition: { max: 'deployments-past' }, // && store.getState().deployments.byStatus.inprogress.total,
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Your deployment is in progress. Click to view a report</div>),
    progress: 2
  },
  'deployments-past': {
    condition: { max: 'upload-new-artifact-tip' }, // store.getState().deployments.byStatus.finished.total && !window.location.hash.includes('finished'),
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Your deployment has finished, click here to view it</div>),
    progress: 3
  },
  'deployments-past-completed': {
    condition: { min: 'deployments-past' }, // store.getState().deployments.byStatus.finished.total,
    component: compose(setDisplayName('OnboardingTip'))(() => <DeploymentCompleteTip targetUrl="destination-unreachable" />)
  },
  'deployment-past-completed-notification': {
    condition: { min: 'deployment-past' },
    specialComponent: <WelcomeSnackTip progress={3} />
  },
  'deployments-past-completed-failure': {
    condition: {
      // const deployments = store.getState().deployments;
      // const pastDeploymentsFailed = deployments.byStatus.finished.deploymentIds.reduce((accu, id) => {
      //   const item = deployments.byId[id];
      //   if (item.status === 'failed' || (item.stats && item.stats.noartifact + item.stats.failure + item.stats['already-installed'] + item.stats.aborted > 0)) {
      //     return false;
      //   }
      //   return accu;
      // }, true);
      min: 'deployments-past-completed-failure' // && !pastDeploymentsFailed;
    },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>Your deployment has finished, but it looks like there was a problem. Click to view the deployment report, where you can see the error log.</div>
    ))
  },
  'upload-new-artifact-tip': {
    condition: { min: 'upload-new-artifact-tip', min2: 'deployments-past-completed', min3: 'artifact-included-deploy-onboarding' },
    component: compose(setDisplayName('OnboardingTip'))(({ setShowCreateArtifactDialog }) => (
      <div>
        Click &apos;Upload&apos; to upload the file and create your new Release.
        <p>
          You can <a onClick={() => setShowCreateArtifactDialog(true)}>view the instructions again</a> if you need help creating the <i>index.html</i> file.
        </p>
      </div>
    )),
    progress: 2
  },
  'upload-new-artifact-dialog-upload': {
    condition: { min: 'upload-new-artifact-dialog-upload' },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Drag or select your new <i>index.html</i> file here to upload it.
      </div>
    )),
    progress: 2
  },
  'upload-new-artifact-dialog-destination': {
    condition: { min: 'upload-new-artifact-dialog-destination', min2: 'upload-new-artifact-dialog-upload' },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        We have prefilled this for you, for the demo - it is the destination on your device where the new <i>index.html</i> file will be installed.
        <p>Click &apos;Next&apos; below.</p>
      </div>
    )),
    progress: 2
  },
  'upload-new-artifact-dialog-device-type': {
    condition: { min: 'upload-new-artifact-dialog-device-type', min2: 'upload-new-artifact-dialog-upload' },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>Enter the device types this will be compatible with. For the demo, you just need to select the device type of your demo device.</div>
    )),
    progress: 2
  },
  'upload-new-artifact-dialog-release-name': {
    condition: { min: 'upload-new-artifact-dialog-release-name', min2: 'upload-new-artifact-dialog-device-type' },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Now name your Release: for the demo you could call it something like &quot;hello-world&quot;.
        <p>Then click &apos;Upload&apos; to finish this step!</p>
      </div>
    )),
    progress: 2
  },
  'artifact-modified-onboarding': {
    condition: { min: 'artifact-modified-onboarding', min2: 'upload-new-artifact-dialog-release-name', min3: 'upload-new-artifact-tip' },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Your uploaded Artifact is now part of a new &apos;Release&apos;.
        <p>Now create a deployment with this Release!</p>
      </div>
    )),
    progress: 1
  },
  'onboarding-finished': {
    condition: { min: 'onboarding-finished', min2: 'artifact-modified-onboarding' }, // store.getState().deployments.byStatus.finished.total > 1,
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  },
  'onboarding-finished-notification': {
    condition: { min: 'artifact-modified-onboarding' },
    specialComponent: <WelcomeSnackTip progress={4} />
  },
  'onboarding-canceled': {
    condition: () => true,
    component: compose(setDisplayName('OnboardingTip'))(() => <div />),
    progress: 3
  }
};

const getOnboardingStepCompleted = (id, progress, complete, showHelptips, showTips) => {
  const keys = Object.keys(onboardingSteps);
  const { min = id, max = id, extra } = Object.entries(onboardingSteps).reduce(
    (accu, [key, value]) => {
      if (key === id) {
        return value.condition;
      }
      return accu;
    },
    { min: '' }
  );
  const progressIndex = keys.findIndex(step => step === progress);
  return (
    !complete &&
    showHelptips &&
    showTips &&
    progressIndex >= keys.findIndex(step => step === min) &&
    progressIndex < keys.findIndex(step => step === max) &&
    (extra ? extra() : true)
  );
};

// export const onboardingTipSanityCheck = step => (dispatch, getState) =>
//   !getState().onboarding.complete && getState().onboarding.showTips && getState().users.showHelptips && !getOnboardingStepCompleted(step);

export const getOnboardingComponentFor = (id, componentProps, params = {}, previousComponent = null) => {
  const step = onboardingSteps[id];
  const isValid = getOnboardingStepCompleted(id, componentProps.progress, componentProps.complete, componentProps.showHelptips, componentProps.showTips);
  if (!isValid) {
    return previousComponent;
  }
  if (step.specialComponent) {
    return React.cloneElement(step.specialComponent, params);
  }
  const component = step.component(componentProps);
  return <BaseOnboardingTip id={id} component={component} progress={step.progress || params.progress || null} {...params} />;
};
