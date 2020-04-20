import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Authorized from './authorized-devices';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('AuthorizedDevices Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: {
        features: { hasMultitenancy: false, isEnterprise: false, isHosted: false }
      },
      devices: {
        filteringAttributes: {
          identityAttributes: [],
          inventoryAttributes: []
        },
        groups: {
          selectedGroup: null
        }
      },
      users: {
        globalSettings: {},
        onboarding: {
          complete: false,
          showTips: true
        },
        showHelptips: true
      }
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <Authorized devices={[]} onFilterChange={jest.fn} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
