import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import PhysicalDeviceOnboarding, {
  ConvertedImageNote,
  DeviceTypeSelectionStep,
  DeviceTypeTip,
  ExternalProviderTip,
  InstallationStep
} from './physicaldeviceonboarding';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';

const mockStore = configureStore([thunk]);

describe('PhysicalDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  describe('tiny onboarding tips', () => {
    [DeviceTypeSelectionStep, InstallationStep, ConvertedImageNote, DeviceTypeTip, ExternalProviderTip, ExternalProviderTip].forEach(
      async (Component, index) => {
        it(`renders ${Component.displayName || Component.name} correctly`, () => {
          const { baseElement } = render(
            <Component
              advanceOnboarding={jest.fn}
              connectionString="test"
              docsVersion={''}
              hasConvertedImage={true}
              integrationProvider={EXTERNAL_PROVIDER['iot-hub'].provider}
              hasExternalIntegration={index % 2}
              ipAddress="test.address"
              isEnterprise={false}
              isHosted={true}
              isDemoMode={false}
              onboardingState={{ complete: false, showTips: true, showHelptips: true }}
              onSelect={jest.fn}
              selection="raspberrypi7"
              tenantToken="testtoken"
            />
          );
          const view = baseElement.firstChild;
          expect(view).toMatchSnapshot();
          expect(view).toEqual(expect.not.stringMatching(undefineds));
        });
      }
    );
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <PhysicalDeviceOnboarding progress={1} />
      </Provider>
    );
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
