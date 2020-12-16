import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Deployments from './deployments';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Deployments Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true
        }
      },
      deployments: {
        ...defaultState.deployments,
        byId: {},
        byStatus: {
          finished: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          inprogress: { deploymentIds: [], selectedDeploymentIds: [], total: 0 },
          pending: { deploymentIds: [], selectedDeploymentIds: [], total: 0 }
        }
      }
    });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Deployments location={{ search: 'from=2019-01-01' }} match={{}} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isEnterprise: true
        }
      }
    });
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Deployments />
        </Provider>
      </MemoryRouter>
    );
    userEvent.click(screen.getByRole('tab', { name: /Finished/i }));
    userEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
    userEvent.click(screen.getByRole('tab', { name: /Active/i }));
    userEvent.click(screen.getByRole('button', { name: /Create a deployment/i }));
    await waitFor(() => expect(screen.getByText(/Cancel/i)).toBeInTheDocument());
    userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    const deployment = screen.getByText(/test deployment 2/i).parentElement.parentElement;
    userEvent.click(within(deployment).getByRole('button', { name: /Abort/i }));
    await waitFor(() => expect(screen.getByText(/Confirm abort/i)).toBeInTheDocument());
    userEvent.click(document.querySelector('#confirmAbort'));
    userEvent.click(within(deployment).getByRole('button', { name: /View details/i }));
    // TODO: investigate why this flakes out ~80% of the time...
    // await waitFor(() => expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument(), { timeout: 2500 });
    // userEvent.click(screen.getByRole('button', { name: /Close/i }));
  });
});
