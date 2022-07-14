import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import Filters from './filters';

const mockStore = configureStore([thunk]);

describe('Filters Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Filters attributes={[{ key: 'testkey', value: 'testvalue' }]} filters={[]} onFilterChange={() => {}} open={true} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});