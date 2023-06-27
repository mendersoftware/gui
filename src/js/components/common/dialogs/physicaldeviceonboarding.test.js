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

import { waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { EXTERNAL_PROVIDER } from '../../../constants/deviceConstants';
import PhysicalDeviceOnboarding, {
  ConvertedImageNote,
  DeviceTypeSelectionStep,
  DeviceTypeTip,
  ExternalProviderTip,
  InstallationStep
} from './physicaldeviceonboarding';

const mockStore = configureStore([thunk]);

const oldHostname = window.location.hostname;

describe('PhysicalDeviceOnboarding Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
    window.location = {
      ...window.location,
      hostname: 'hosted.mender.io'
    };
  });
  afterEach(() => {
    window.location = {
      ...window.location,
      hostname: oldHostname
    };
  });

  describe('tiny onboarding tips', () => {
    [DeviceTypeSelectionStep, InstallationStep, ConvertedImageNote, DeviceTypeTip, ExternalProviderTip, ExternalProviderTip].forEach(
      async (Component, index) => {
        it(`renders ${Component.displayName || Component.name} correctly`, () => {
          const { baseElement } = render(
            <Provider store={store}>
              <Component
                advanceOnboarding={jest.fn}
                connectionString="test"
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
            </Provider>
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
    await waitFor(() => expect(store.getActions().some(({ type, value }) => type === 'SET_ONBOARDING_APPROACH' && value === 'physical')).toBeTruthy());
  });
});
