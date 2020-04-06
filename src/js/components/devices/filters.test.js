import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Filters from './filters';

const mockStore = configureStore([thunk]);

describe('Filters Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: { hasMultitenancy: false, isEnterprise: false, isHosted: false }
      },
      devices: {
        filters: [],
        filteringAttributes: { identityAttributes: [], inventoryAttributes: [] }
      },
      users: { organization: {} }
    });
  });
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Filters attributes={[{ key: 'testkey', value: 'testvalue' }]} filters={[]} onFilterChange={() => {}} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
