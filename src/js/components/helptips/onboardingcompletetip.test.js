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

import { act, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import OnboardingCompleteTip from './onboardingcompletetip';

const mockStore = configureStore([thunk]);

describe('OnboardingCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasMultitenancy: true,
          isHosted: true
        }
      }
    });
    jest.spyOn(global, 'encodeURIComponent').mockImplementationOnce(() => 'http%3A%2F%2Ftest.com');
  });

  it('renders correctly', async () => {
    const ui = (
      <Provider store={store}>
        <OnboardingCompleteTip targetUrl="https://test.com" />
      </Provider>
    );
    const { baseElement, rerender } = render(ui);
    await act(async () => {});
    await waitFor(() => rerender(ui));
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
