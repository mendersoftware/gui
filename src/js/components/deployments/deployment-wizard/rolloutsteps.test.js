// Copyright 2021 Northern.tech AS
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

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import RolloutSteps from './rolloutsteps';

const mockStore = configureStore([thunk]);

describe('RolloutSteps Component', () => {
  it('renders correctly', async () => {
    const store = mockStore({ ...defaultState });
    let tree = render(
      <Provider store={store}>
        <RolloutSteps onStepChange={jest.fn} steps={[]} />
      </Provider>
    );
    let view = tree.baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));

    tree = render(
      <Provider store={store}>
        <RolloutSteps steps={[]} />
      </Provider>
    );
    view = tree.baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
