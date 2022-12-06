import React from 'react';
import { screen, within, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Header from './header';
import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import * as AppConstants from '../../constants/appConstants';
import * as UserConstants from '../../constants/userConstants';

const mockStore = configureStore([thunk]);

describe('Header Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      deployments: {
        ...defaultState.deployments,
        byStatus: {
          ...defaultState.deployments.byStatus,
          inprogress: {
            ...defaultState.deployments.byStatus.inprogress,
            total: 0
          }
        }
      },
      users: {
        ...defaultState.users,
        globalSettings: {
          ...defaultState.users.globalSettings,
          [defaultState.users.currentUser]: {
            ...defaultState.users.globalSettings[defaultState.users.currentUser],
            trackingConsentGiven: true
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    const view = (
      <Provider store={store}>
        <Header />
      </Provider>
    );
    const { rerender } = render(view);
    const selectButton = screen.getByRole('button', { name: defaultState.users.byId[defaultState.users.currentUser].email });
    userEvent.click(selectButton);
    const listbox = document.body.querySelector('ul[role=menu]');
    const listItem = within(listbox).getByText(/log out/i);
    userEvent.click(listItem);
    await fireEvent.mouseDown(listItem);
    await waitFor(() => rerender(view));
    const storeActions = store.getActions();
    const expectedActions = [{ type: AppConstants.SET_SEARCH_STATE }, { type: UserConstants.USER_LOGOUT }];
    expectedActions.map((action, index) => expect(storeActions[index]).toMatchObject(action));
  });
});
