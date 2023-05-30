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
import { Provider } from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { render } from '../../../../tests/setupTests';
import {
  ApplicationUpdateReminderTip,
  ArtifactIncludedDeployOnboarding,
  ArtifactIncludedOnboarding,
  ArtifactModifiedOnboarding,
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
  UploadNewArtifactDialogClick,
  UploadNewArtifactDialogDestination,
  UploadNewArtifactDialogDeviceType,
  UploadNewArtifactDialogReleaseName,
  UploadNewArtifactDialogUpload,
  UploadNewArtifactTip,
  UploadPreparedArtifactTip,
  WelcomeSnackTip
} from './onboardingtips';

const mockStore = configureStore([thunk]);

describe('OnboardingTips Components', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });

  describe('DevicePendingTip', () => {
    it('renders correctly', async () => {
      const { baseElement } = render(
        <Provider store={store}>
          <DevicePendingTip />
        </Provider>
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
    });
  });

  describe('WelcomeSnackTip', () => {
    it('renders correctly', async () => {
      const { baseElement } = render(
        <Provider store={store}>
          <WelcomeSnackTip />
        </Provider>
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
    });
  });

  describe('tiny onboarding tips', () => {
    [
      ApplicationUpdateReminderTip,
      ArtifactIncludedDeployOnboarding,
      ArtifactIncludedOnboarding,
      ArtifactModifiedOnboarding,
      DashboardOnboardingPendings,
      DashboardOnboardingState,
      DeploymentsInprogress,
      DeploymentsPast,
      DeploymentsPastCompletedFailure,
      DevicesAcceptedOnboarding,
      DevicesPendingAcceptingOnboarding,
      GetStartedTip,
      SchedulingAllDevicesSelection,
      SchedulingArtifactSelection,
      SchedulingGroupSelection,
      SchedulingReleaseToDevices,
      UploadNewArtifactDialogClick,
      UploadNewArtifactDialogDestination,
      UploadNewArtifactDialogDeviceType,
      UploadNewArtifactDialogReleaseName,
      UploadNewArtifactDialogUpload,
      UploadNewArtifactTip,
      UploadPreparedArtifactTip
    ].forEach(async Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(
          <Component
            createdGroup="testgroup"
            demoArtifactLink="http://somewhere.com"
            progress={3}
            selectedRelease={{ Name: 'test', toString: () => 'test' }}
            setShowCreateArtifactDialog={jest.fn}
          />
        );
        const view = baseElement.firstChild.firstChild;
        expect(view).toMatchSnapshot();
      });
    });
  });
});
