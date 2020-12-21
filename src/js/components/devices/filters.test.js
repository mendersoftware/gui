import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Filters from './filters';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Filters Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  it('renders correctly', async () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Filters attributes={[{ key: 'testkey', value: 'testvalue' }]} filters={[]} onFilterChange={() => {}} open={true} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
