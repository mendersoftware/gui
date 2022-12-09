import React from 'react';
import { Provider } from 'react-redux';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import { CancelSubscriptionAlert, CancelSubscriptionButton, DeviceLimitExpansionNotification, TrialExpirationNote } from './billing';
import MyOrganization, { OrgHeader } from './organization';

const mockStore = configureStore([thunk]);

describe('MyOrganization Component', () => {
  let store;
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2020-07-01T12:00:00.000Z'));
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isHosted: true
        },
        versionInformation: { Integration: '1.2.3' }
      },
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: {
            ...defaultState.devices.byStatus.accepted,
            total: 1
          }
        },
        limit: null
      },
      organization: {
        ...defaultState.organization,
        card: {
          last4: '1234',
          expiration: { month: 8, year: 1230 },
          brand: 'Visa'
        },
        organization: {
          ...defaultState.organization.organization,
          addons: [
            { enabled: true, name: 'configure' },
            { enabled: true, name: 'monitor' }
          ],
          plan: 'enterprise',
          tenant_token: 'test',
          trial: true,
          trial_expiration: new Date('2021-01-01T00:00:00Z')
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <MyOrganization />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('supports modifying SSO settings', async () => {
    const ui = (
      <Provider store={store}>
        <MyOrganization />
      </Provider>
    );
    const { rerender } = render(ui);
    userEvent.click(screen.getByRole('checkbox'));
    await waitFor(() => rerender(ui));
    act(() => userEvent.click(screen.getByText(/input with the text editor/i)));

    const config = '<div>not quite right</div>';
    const str = JSON.stringify(config);
    const blob = new Blob([str]);
    const file = new File([blob], 'values.xml', { type: 'application/xml' });
    File.prototype.text = jest.fn().mockResolvedValue(str);
    const input = document.querySelector('input[type=file]');
    act(() => userEvent.upload(input, file));
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/import from a file/i)).toBeVisible();
    await waitFor(() => rerender(ui));
    act(() => userEvent.upload(screen.getByText(/import from a file/i).previousSibling, file));
    act(() => userEvent.click(screen.getByRole('button', { name: /cancel/i })));
    await waitFor(() => rerender(ui));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });
});

describe('smaller components', () => {
  [OrgHeader, TrialExpirationNote, DeviceLimitExpansionNotification, CancelSubscriptionAlert, CancelSubscriptionButton].forEach(Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          trial_expiration="2019-10-05T13:00:00.000Z"
          isTrial={true}
          handleCancelSubscription={jest.fn}
          orgName="test"
          mailBodyTexts={{ billing: 'bill this', upgrade: 'upgrade here' }}
        />
      );
      const view = baseElement.lastChild?.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
      expect(view).toBeTruthy();
    });
  });
});
