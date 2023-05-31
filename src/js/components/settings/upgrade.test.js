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

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Upgrade, { PostUpgradeNote, PricingContactNote } from './upgrade';

const mockStore = configureStore([thunk]);

describe('smaller components', () => {
  [PostUpgradeNote, PricingContactNote].forEach(Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          trial_expiration="2019-10-05T13:00:00.000Z"
          isTrial={true}
          handleCancelSubscription={jest.fn}
          orgName="test"
          mailBodyTexts={{ billing: 'bill this', upgrade: 'upgrade here' }}
        />
      );
      const view = baseElement.firstChild.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('Upgrade Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasDeviceConfig: true,
          hasDeviceConnect: true
        }
      }
    });
  });
  it('renders correctly', async () => {
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: () => ({ createPaymentMethod: jest.fn() })
    }));
    const stripe = loadStripe('123');
    const { baseElement } = render(
      <Provider store={store}>
        <Elements stripe={stripe}>
          <Upgrade />
        </Elements>
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
