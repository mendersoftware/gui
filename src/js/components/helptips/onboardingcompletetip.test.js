import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import OnboardingCompleteTip from './onboardingcompletetip';

const mockStore = configureStore([thunk]);
const store = mockStore({
  app: { docsVersion: null, features: { hasMultitenancy: true, isHosted: true } },
  devices: {
    byId: {},
    byStatus: { accepted: { deviceIds: [] } }
  }
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
});
