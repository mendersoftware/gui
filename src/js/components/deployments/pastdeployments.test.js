import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';

const mockStore = configureStore([]);
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
