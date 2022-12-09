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
