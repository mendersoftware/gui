import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import OrganizationPaymentSettings from './organizationpaymentsettings';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('OrganizationPaymentSettings Component', () => {
  let store;
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2020-07-01T12:00:00.000Z'));
    store = mockStore({
      organization: {
        ...defaultState.organization,
        card: {
          last4: '1234',
          expiration: { month: 8, year: 1230 },
          brand: 'Visa'
        }
      }
    });
  });
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <Provider store={store}>
          <OrganizationPaymentSettings />
        </Provider>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
    expect(JSON.stringify(tree)).toEqual(expect.not.stringMatching(undefineds));
  });
});
