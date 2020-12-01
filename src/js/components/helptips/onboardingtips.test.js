import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
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
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <MemoryRouter>
            <Provider store={store}>
              <DevicePendingTip />
            </Provider>
          </MemoryRouter>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('WelcomeSnackTip', () => {
    it('renders correctly', () => {
      const tree = renderer
        .create(
          <Provider store={store}>
            <WelcomeSnackTip />
          </Provider>
        )
        .toJSON();
      expect(tree).toMatchSnapshot();
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
    ].forEach(Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const tree = renderer
          .create(
            <MemoryRouter>
              <Component
                createdGroup="testgroup"
                demoArtifactLink="http://somewhere.com"
                progress={3}
                selectedRelease={{ Name: 'test', toString: () => 'test' }}
                setShowCreateArtifactDialog={jest.fn}
              />
            </MemoryRouter>
          )
          .toJSON();
        expect(tree).toMatchSnapshot();
      });
    });
  });
});
