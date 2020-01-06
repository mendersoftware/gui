import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Past from './pastdeployments';

const mockStore = configureStore([thunk]);

describe('PastDeployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      users: { onboarding: { complete: false, showTips: true }, showHelptips: true }
    });
  });

  it('renders correctly', () => {
    const mockDate = new Date('2019-01-01');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    Date.now = jest.fn;
    const tree = renderer
      .create(
        <Provider store={store}>
          <Past past={[]} groups={[]} refreshPast={() => {}} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
