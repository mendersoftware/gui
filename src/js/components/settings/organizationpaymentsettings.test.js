import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import OrganizationPaymentSettings from './organizationpaymentsettings';

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
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <OrganizationPaymentSettings />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
