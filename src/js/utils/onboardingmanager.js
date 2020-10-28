import React from 'react';
import { Link } from 'react-router-dom';
import { compose, setDisplayName } from 'recompose';

import { onboardingSteps as stepNames } from '../constants/onboardingConstants';
import CreateArtifactDialog from '../components/helptips/createartifactdialog';
import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import DeploymentCompleteTip from '../components/helptips/deploymentcompletetip';
import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';
import { DevicePendingTip, WelcomeSnackTip } from '../components/helptips/onboardingtips';

export const onboardingSteps = {
  [stepNames.ONBOARDING_START]: {
    condition: { min: stepNames.ONBOARDING_START, max: stepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING },
    specialComponent: <WelcomeSnackTip progress={1} />
  },
  [stepNames.DASHBOARD_ONBOARDING_START]: {
    condition: { min: stepNames.ONBOARDING_START },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Click here to get started!</div>),
    progress: 1
  },
  [stepNames.DEVICES_PENDING_ONBOARDING_START]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START, max: stepNames.DEVICES_PENDING_ONBOARDING },
    specialComponent: <DevicePendingTip />
  },
  [stepNames.DEVICES_PENDING_ONBOARDING]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>This should be your device, asking for permission to join the server. Inspect its identity details, then check it to accept it!</div>
    )),
    progress: 1
  },
  [stepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING, max: stepNames.DEVICES_ACCEPTED_ONBOARDING },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>If you recognize this device as your own, you can accept it</div>),
    progress: 2
  },
  [stepNames.DASHBOARD_ONBOARDING_PENDINGS]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Next accept your device</div>),
    progress: 2
  },
  [stepNames.DEVICES_ACCEPTED_ONBOARDING]: {
    condition: { max: stepNames.APPLICATION_UPDATE_REMINDER_TIP },
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
  [stepNames.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_PENDINGS, max: stepNames.APPLICATION_UPDATE_REMINDER_TIP },
    specialComponent: <WelcomeSnackTip progress={2} />
  },
  [stepNames.APPLICATION_UPDATE_REMINDER_TIP]: {
    condition: { max: stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING, extra: () => window.location.hash.endsWith('#/devices') },
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
  [stepNames.UPLOAD_PREPARED_ARTIFACT_TIP]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.ARTIFACT_INCLUDED_ONBOARDING },
    component: compose(setDisplayName('OnboardingTip'))(({ demoArtifactLink }) => (
      <div>
        Download our prepared demo Artifact from <a href={demoArtifactLink}>here</a> to upload it to your profile.
      </div>
    )),
    progress: 2
  },
  [stepNames.ARTIFACT_INCLUDED_ONBOARDING]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: compose(setDisplayName('OnboardingTip'))(({ artifactIncluded }) => (
      <div>
        {artifactIncluded ? 'We have included' : 'Now you have'} a Mender artifact with a simple Application update for you to test with.
        <p>Expand it for more details.</p>
      </div>
    )),
    progress: 1
  },
  [stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING]: {
    condition: { min: stepNames.ARTIFACT_INCLUDED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Let&apos;s deploy this Release to your device now</div>),
    progress: 1
  },
  [stepNames.SCHEDULING_ARTIFACT_SELECTION]: {
    condition: { min: stepNames.ARTIFACT_INCLUDED_DEPLOY_ONBOARDING },
    component: compose(setDisplayName('OnboardingTip'))(({ selectedRelease }) => <div>{`Select the ${selectedRelease} release we included.`}</div>),
    progress: 2
  },
  [stepNames.SCHEDULING_ALL_DEVICES_SELECTION]: {
    condition: { max: stepNames.SCHEDULING_RELEASE_TO_DEVICES },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Select &apos;All devices&apos; for now.<p>You can learn how to create device groups later.</p>
      </div>
    )),
    progress: 2
  },
  [stepNames.SCHEDULING_GROUP_SELECTION]: {
    condition: {},
    component: compose(setDisplayName('OnboardingTip'))(({ createdGroup }) => <div>{`Select the ${createdGroup} device group you just made.`}</div>),
    progress: 2
  },
  [stepNames.SCHEDULING_RELEASE_TO_DEVICES]: {
    condition: { max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: compose(setDisplayName('OnboardingTip'))(({ selectedDevice, selectedGroup, selectedRelease }) => (
      <div>{`Create the deployment! This will deploy the ${selectedRelease.Name} Artifact to ${
        selectedDevice ? selectedDevice : selectedGroup || 'All devices'
      }`}</div>
    ))
  },
  [stepNames.DEPLOYMENTS_INPROGRESS]: {
    condition: {},
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Your deployment is in progress. Click to view a report</div>),
    progress: 2
  },
  [stepNames.DEPLOYMENTS_PAST]: {
    condition: { extra: () => !window.location.hash.includes('finished') },
    component: compose(setDisplayName('OnboardingTip'))(() => <div>Your deployment has finished, click here to view it</div>),
    progress: 3
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST },
    specialComponent: <WelcomeSnackTip progress={3} />
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION, max: stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE },
    component: compose(setDisplayName('OnboardingTip'))(() => <DeploymentCompleteTip targetUrl="destination-unreachable" />)
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE]: {
    condition: { max: stepNames.ARTIFACT_CREATION_DIALOG },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>Your deployment has finished, but it looks like there was a problem. Click to view the deployment report, where you can see the error log.</div>
    ))
  },
  [stepNames.ARTIFACT_CREATION_DIALOG]: {
    condition: { max: stepNames.UPLOAD_NEW_ARTIFACT_TIP },
    specialComponent: <CreateArtifactDialog />
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_TIP]: {
    condition: {},
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
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_UPLOAD]: {
    condition: {},
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Drag or select your new <i>index.html</i> file here to upload it.
      </div>
    )),
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION]: {
    condition: {},
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        We have prefilled this for you, for the demo - it is the destination on your device where the new <i>index.html</i> file will be installed.
        <p>Click &apos;Next&apos; below.</p>
      </div>
    )),
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE]: {
    condition: { min: stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DESTINATION },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>Enter the device types this will be compatible with. For the demo, you just need to select the device type of your demo device.</div>
    )),
    progress: 2
  },
  [stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_RELEASE_NAME]: {
    condition: { min: stepNames.UPLOAD_NEW_ARTIFACT_DIALOG_DEVICE_TYPE },
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Now name your Release: for the demo you could call it something like &quot;hello-world&quot;.
        <p>Then click &apos;Upload&apos; to finish this step!</p>
      </div>
    )),
    progress: 2
  },
  [stepNames.ARTIFACT_MODIFIED_ONBOARDING]: {
    condition: {},
    component: compose(setDisplayName('OnboardingTip'))(() => (
      <div>
        Your uploaded Artifact is now part of a new &apos;Release&apos;.
        <p>Now create a deployment with this Release!</p>
      </div>
    )),
    progress: 1
  },
  [stepNames.ONBOARDING_FINISHED]: {
    condition: {},
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  },
  [stepNames.ONBOARDING_FINISHED_NOTIFICATION]: {
    condition: { min: stepNames.ARTIFACT_MODIFIED_ONBOARDING },
    specialComponent: <WelcomeSnackTip progress={4} />
  },
  [stepNames.ONBOARDING_CANCELED]: {
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
    progressIndex <= keys.findIndex(step => step === max) &&
    (extra ? extra() : true)
  );
};

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
