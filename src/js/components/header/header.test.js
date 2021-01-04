import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { screen, render, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Header from './header';
import { defaultState, undefineds } from '../../../../tests/mockData';

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
      <MemoryRouter>
        <Provider store={store}>
          <Header />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as intended', async () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Header />
        </Provider>
      </MemoryRouter>
    );

    const selectButton = screen.getByRole('button', { name: defaultState.users.byId[defaultState.users.currentUser].email });
    userEvent.click(selectButton);
    const listbox = document.body.querySelector('ul[role=menu]');
    const listItem = within(listbox).getByText(/log out/i);
    userEvent.click(listItem);
    await waitForElementToBeRemoved(() => document.body.querySelector('ul[role=menu]'));
  });
});
