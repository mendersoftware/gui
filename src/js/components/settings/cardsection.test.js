import React from 'react';
import renderer from 'react-test-renderer';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CardSection from './cardsection';
import { undefineds } from '../../../../tests/mockData';

describe('GlobalSettings Component', () => {
  it('renders correctly', () => {
    jest.mock('@stripe/stripe-js', () => ({
      loadStripe: () => ({ createPaymentMethod: jest.fn() })
    }));
    const stripe = loadStripe();
    const tree = renderer
      .create(
        <Elements stripe={stripe}>
          <CardSection />
        </Elements>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
