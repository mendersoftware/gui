import React from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import CardSection from './cardsection';

describe('GlobalSettings Component', () => {
  let stripe;
  beforeEach(() => {
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: () => ({ createPaymentMethod: jest.fn() })
    }));
    stripe = loadStripe();
  });
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Elements stripe={stripe}>
        <CardSection isSignUp={true} />
      </Elements>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
