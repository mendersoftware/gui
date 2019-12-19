import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';

const mockStore = configureStore([thunk]);
const store = mockStore({
  users: { onboarding: { complete: false, showTips: true }, showHelptips: true }
});

it('renders correctly', () => {
  const mockDate = new Date('2019-01-01');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  const tree = renderer
    .create(
      <Provider store={store}>
        <Past past={[]} groups={[]} refreshPast={() => {}} />
      </Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
