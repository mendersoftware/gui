import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import MyOrganization from './organization';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('MyOrganization Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: {
          isHosted: false
        }
      },
      users: {
        organization: {
          id: 1,
          name: 'test',
          tenant_token: 'test'
        }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <MyOrganization />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
