import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import OnboardingCompleteTip from './onboardingcompletetip';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('OnboardingCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasMultitenancy: true,
          isHosted: true
        }
      }
    });
    jest.spyOn(global, 'encodeURIComponent').mockImplementationOnce(() => 'http%3A%2F%2Ftest.com');
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <OnboardingCompleteTip targetUrl="https://test.com" />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
