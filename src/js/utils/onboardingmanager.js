// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import BaseOnboardingTip from '../components/helptips/baseonboardingtip';
import OnboardingCompleteTip from '../components/helptips/onboardingcompletetip';
import {
  DashboardOnboardingPendings,
  DashboardOnboardingState,
  DeploymentsInprogress,
  DeploymentsPast,
  DeploymentsPastCompletedFailure,
  DevicePendingTip,
  DevicesAcceptedOnboarding,
  DevicesPendingAcceptingOnboarding,
  GetStartedTip,
  SchedulingAllDevicesSelection,
  SchedulingArtifactSelection,
  SchedulingGroupSelection,
  SchedulingReleaseToDevices,
  WelcomeSnackTip
} from '../components/helptips/onboardingtips';
import { yes } from '../constants/appConstants';
import { DEPLOYMENT_STATES } from '../constants/deploymentConstants';
import { onboardingSteps as stepNames } from '../constants/onboardingConstants';

export const onboardingSteps = {
  [stepNames.DASHBOARD_ONBOARDING_START]: {
    condition: { min: stepNames.ONBOARDING_START },
    component: GetStartedTip
  },
  [stepNames.DEVICES_PENDING_ONBOARDING_START]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START, max: stepNames.DEVICES_PENDING_ONBOARDING },
    fallbackStep: stepNames.DASHBOARD_ONBOARDING_START,
    specialComponent: <DevicePendingTip />
  },
  [stepNames.DEVICES_PENDING_ONBOARDING]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_START },
    component: DashboardOnboardingState,
    fallbackStep: stepNames.DASHBOARD_ONBOARDING_START
  },
  [stepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING, max: stepNames.DEVICES_ACCEPTED_ONBOARDING },
    component: DevicesPendingAcceptingOnboarding
  },
  [stepNames.DASHBOARD_ONBOARDING_PENDINGS]: {
    condition: { min: stepNames.DEVICES_PENDING_ONBOARDING },
    component: DashboardOnboardingPendings
  },
  [stepNames.DEVICES_ACCEPTED_ONBOARDING]: {
    condition: { max: stepNames.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION },
    component: DevicesAcceptedOnboarding
  },
  [stepNames.DEVICES_ACCEPTED_ONBOARDING_NOTIFICATION]: {
    condition: { min: stepNames.DASHBOARD_ONBOARDING_PENDINGS, max: stepNames.APPLICATION_UPDATE_REMINDER_TIP },
    specialComponent: <WelcomeSnackTip progress={2} />
  },
  [stepNames.SCHEDULING_ALL_DEVICES_SELECTION]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: SchedulingAllDevicesSelection
  },
  [stepNames.SCHEDULING_GROUP_SELECTION]: {
    condition: { min: stepNames.DEVICES_ACCEPTED_ONBOARDING, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: SchedulingGroupSelection
  },
  [stepNames.SCHEDULING_ARTIFACT_SELECTION]: {
    condition: { min: stepNames.SCHEDULING_ALL_DEVICES_SELECTION, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: SchedulingArtifactSelection
  },
  [stepNames.SCHEDULING_RELEASE_TO_DEVICES]: {
    condition: { min: stepNames.SCHEDULING_ARTIFACT_SELECTION, max: stepNames.DEPLOYMENTS_INPROGRESS },
    component: SchedulingReleaseToDevices
  },
  [stepNames.DEPLOYMENTS_INPROGRESS]: {
    condition: {},
    component: DeploymentsInprogress
  },
  [stepNames.DEPLOYMENTS_PAST]: {
    condition: { min: stepNames.DEPLOYMENTS_INPROGRESS, extra: () => !window.location.pathname.includes(DEPLOYMENT_STATES.finished) },
    component: DeploymentsPast
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST },
    specialComponent: <WelcomeSnackTip progress={3} />
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED]: {
    condition: { min: stepNames.DEPLOYMENTS_PAST_COMPLETED_NOTIFICATION, max: stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE },
    specialComponent: <OnboardingCompleteTip targetUrl="destination-unreachable" />
  },
  [stepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE]: {
    condition: {},
    component: DeploymentsPastCompletedFailure
  },
  [stepNames.ONBOARDING_CANCELED]: {
    condition: { extra: yes },
    specialComponent: <div />
  }
};

const getOnboardingStepCompleted = (id, progress, complete, showHelptips, showTips) => {
  const keys = Object.keys(onboardingSteps);
  const {
    min = id,
    max = id,
    extra
  } = Object.entries(onboardingSteps).reduce((accu, [key, value]) => {
    if (key === id) {
      return value.condition;
    }
    return accu;
  }, {});
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

export const applyOnboardingFallbacks = progress => {
  const step = onboardingSteps[progress];
  if (step && step.fallbackStep) {
    return step.fallbackStep;
  }
  return progress;
};
