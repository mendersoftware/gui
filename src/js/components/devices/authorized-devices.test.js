import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Authorized from './authorized-devices';

const mockStore = configureStore([]);
const store = mockStore({
  users: {
    globalSettings: {},
    onboarding: {
      complete: false,
      showTips: true
    },
    showHelptips: true
  }
});

it('renders correctly', () => {
  const tree = renderer
    .create(
      <Provider store={store}>
        <Authorized devices={[]} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
