import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import PhysicalDeviceOnboarding, { DeviceTypeSelectionStep, InstallationStep } from './physicaldeviceonboarding';
import { defaultState, undefineds } from '../../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('PhysicalDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  describe('tiny onboarding tips', () => {
    [DeviceTypeSelectionStep, InstallationStep].forEach(async Component => {
      it(`renders ${Component.displayName || Component.name} correctly`, () => {
        const { baseElement } = render(
          <Component
            advanceOnboarding={jest.fn}
            docsVersion={''}
            hasConvertedImage={true}
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
        const view = baseElement.parentElement;
        expect(view).toMatchSnapshot();
        expect(view).toEqual(expect.not.stringMatching(undefineds));
      });
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <PhysicalDeviceOnboarding progress={1} />
      </Provider>
    );
    const view = baseElement.parentElement.parentElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
