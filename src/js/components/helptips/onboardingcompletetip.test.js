import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import OnboardingCompleteTip from './onboardingcompletetip';
import { undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('OnboardingCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      app: { docsVersion: null, features: { hasMultitenancy: true, isHosted: true } },
      devices: {
        byId: {},
        byStatus: { accepted: { deviceIds: [] } },
        filters: []
      },
      users: {}
    });
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <OnboardingCompleteTip />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
