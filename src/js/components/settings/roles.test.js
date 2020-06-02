import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Roles from './roles';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Roles Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: {
          isHosted: false
        }
      },
      devices: {
        byId: {},
        filteringAttributes: { identityAttributes: ['id_attribute'] },
        filteringAttributesLimit: 10,
        groups: {
          byId: {
            testGroup: {}
          }
        }
      },
      users: {
        globalSettings: {},
        organization: {
          id: 1,
          name: 'test'
        },
        rolesById: { RBAC_ROLE_PERMIT_ALL: { title: 'Admin', allowUserManagement: true, groups: [], description: 'Full access', editable: false } }
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Roles />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
