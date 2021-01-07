import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Upgrade from './upgrade';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('GlobalSettings Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState
    });
  });
  it('renders correctly', async () => {
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: () => ({ createPaymentMethod: jest.fn() })
    }));
    const stripe = loadStripe();
    const tree = renderer
      .create(
        <Provider store={store}>
          <Elements stripe={stripe}>
            <Upgrade />
          </Elements>
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
