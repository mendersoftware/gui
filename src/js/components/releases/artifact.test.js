import React from 'react';
import { Provider } from 'react-redux';

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Artifact from './artifact';

const mockStore = configureStore([thunk]);

describe('ReleaseRepositoryItem Component', () => {
  it('renders correctly', async () => {
    let store = mockStore({ ...defaultState });
    const { baseElement } = render(
      <Provider store={store}>
        <Artifact artifact={{ device_types_compatible: ['test-type'], updates: [], modified: '2019-01-01' }} onExpanded={jest.fn} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
