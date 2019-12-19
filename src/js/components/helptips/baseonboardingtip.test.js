import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import BaseOnboardingTip from './baseonboardingtip';

const mockStore = configureStore([thunk]);

describe('BaseOnboardingTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({});
  });

  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <BaseOnboardingTip anchor={{ left: 1, top: 1, right: 1, bottom: 1 }} component={<div />} />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
