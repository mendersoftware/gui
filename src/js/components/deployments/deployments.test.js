import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import Deployments from './deployments';
import { allDevices } from './createdeployment';
import GeneralApi from '../../api/general-api';
import { getConfiguredStore } from './../../reducers';
import { defaultState, mockDate, undefineds } from '../../../../tests/mockData';
import { selectMaterialUiSelectOption } from '../../../../tests/setupTests';

const mockStore = configureStore([thunk]);
const defaultLocationProps = { location: { search: 'from=2019-01-01' }, match: {} };

describe('Deployments Component', () => {
  let mockState = {
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
        ...defaultState.deployments.byStatus,
        finished: { deploymentIds: [], total: 0 },
        inprogress: { deploymentIds: [], total: 0 },
        pending: { deploymentIds: [], total: 0 }
      },
      selectionState: {
        ...defaultState.deployments.selectionState,
        finished: { ...defaultState.deployments.selectionState.finished, selection: [] },
        inprogress: { ...defaultState.deployments.selectionState.inprogress, selection: [] },
        pending: { ...defaultState.deployments.selectionState.pending, selection: [] }
      }
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const store = mockStore(mockState);
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    // const store = mockStore({
    const preloadedState = {
      ...mockState,
      deployments: {
        ...mockState.deployments,
        byId: {
          ...defaultState.deployments.byId,
          d1: {
            ...defaultState.deployments.byId.d1,
            artifact_name: 'a1'
          }
        },
        byStatus: {
          ...mockState.deployments.byStatus,
          inprogress: { deploymentIds: ['d1'], total: 1 },
          pending: { deploymentIds: ['d2'], total: 1 }
        },
        selectedDeployment: defaultState.deployments.byId.d1.id,
        selectionState: {
          ...defaultState.deployments.selectionState,
          inprogress: { ...defaultState.deployments.selectionState.inprogress, selection: ['d1'] },
          pending: { ...defaultState.deployments.selectionState.pending, selection: ['d2'] }
        }
      },
      releases: {
        ...defaultState.releases,
        byId: {
          ...defaultState.releases.byId,
          test: {
            ...defaultState.releases.byId.a1
          }
        }
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    userEvent.click(screen.getByRole('tab', { name: /Finished/i }));
    userEvent.click(screen.getByRole('tab', { name: /Scheduled/i }));
    userEvent.click(screen.getByRole('tab', { name: /Active/i }));
    await act(async () => userEvent.click(screen.getByRole('button', { name: /Create a deployment/i })));
    await waitFor(() => rerender(ui));
    await waitFor(() => expect(screen.getByText(/Cancel/i)).toBeInTheDocument());
    userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => rerender(ui));
    // screen.debug(undefined, 2000000);
    const inprogressDeployments = screen.getByText(/in progress now/i).parentElement.parentElement;
    const deployment = within(inprogressDeployments).getByText(/test deployment 2/i).parentElement.parentElement;
    userEvent.click(within(deployment).getByRole('button', { name: /Abort/i }));
    jest.advanceTimersByTime(200);
    await waitFor(() => expect(screen.getByText(/Confirm abort/i)).toBeInTheDocument());
    userEvent.click(document.querySelector('#confirmAbort'));
    await act(async () => userEvent.click(within(deployment).getByRole('button', { name: /View details/i })));
    await waitFor(() => rerender(ui));
    await waitFor(() => screen.queryByText(/Deployment details/i), { timeout: 2500 });
    expect(screen.getByText(/Deployment details/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /Close/i }));
  }, 30000);

  it('allows navigating the deployment creation dialog', async () => {
    const preloadedState = {
      ...mockState,
      app: {
        ...mockState,
        features: {
          ...mockState.app.features,
          isEnterprise: false
        }
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    userEvent.click(screen.getByRole('tab', { name: /Finished/i }));
    userEvent.click(screen.getByRole('button', { name: /Create a deployment/i }));
    const releaseId = Object.keys(defaultState.releases.byId)[0];
    expect(screen.queryByText(releaseId)).not.toBeInTheDocument();
    const releaseSelect = screen.getByPlaceholderText(/Select a Release/i);
    userEvent.click(releaseSelect);
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    expect(releaseSelect).toHaveValue(releaseId);
    const groupSelect = screen.getByPlaceholderText(/Select a device group/i);
    userEvent.click(groupSelect);
    fireEvent.keyDown(groupSelect, { key: 'Enter' });

    await waitFor(() => rerender(ui));
    expect(groupSelect).toHaveValue(allDevices);
    userEvent.click(screen.getAllByText('Next')[0]);
    const post = jest.spyOn(GeneralApi, 'post');
    await act(async () => await userEvent.click(screen.getByText('Create')));
    await jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(post).toHaveBeenCalledWith('/api/management/v1/deployments/deployments', {
      all_devices: true,
      artifact_name: defaultState.releases.byId.a1.Name,
      devices: undefined,
      filter_id: undefined,
      group: undefined,
      name: allDevices,
      phases: undefined,
      update_control_map: undefined
    });
    await jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  }, 15000);

  it('allows navigating the enterprise deployment creation dialog', async () => {
    const preloadedState = {
      ...mockState,
      app: {
        ...mockState,
        features: {
          ...mockState.app.features,
          isHosted: false
        }
      },
      devices: {
        ...mockState.devices,
        byStatus: {
          ...mockState.devices.byStatus,
          accepted: {
            ...mockState.devices.byStatus.accepted,
            deviceIds: [...Object.keys(mockState.devices.byId), 'test1', 'test2'],
            total: Object.keys(mockState.devices.byId).length + 2
          }
        }
      },
      organization: {
        ...mockState.organization,
        organization: {
          ...mockState.organization.organization,
          plan: 'enterprise'
        }
      },
      users: {
        ...mockState.users,
        globalSettings: {
          ...mockState.users.globalSettings,
          previousPhases: [[{ batch_size: 30, delay: 5, delayUnit: 'days' }, { batch_size: 70 }]]
        }
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    userEvent.click(screen.getByRole('button', { name: /Create a deployment/i }));
    const releaseId = Object.keys(defaultState.releases.byId)[0];
    expect(screen.queryByText(releaseId)).not.toBeInTheDocument();
    const releaseSelect = screen.getByPlaceholderText(/Select a Release/i);
    userEvent.click(releaseSelect);
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    const groupSelect = screen.getByPlaceholderText(/Select a device group/i);
    userEvent.click(groupSelect);
    fireEvent.keyDown(groupSelect, { key: 'Enter' });
    await waitFor(() => rerender(ui));
    userEvent.click(screen.getAllByText('Next')[0]);
    await selectMaterialUiSelectOption(screen.getByText(/Single phase: 100%/i), /Custom/i);
    const firstPhase = screen.getByText(/Phase 1/i).parentElement.parentElement.parentElement;
    await selectMaterialUiSelectOption(within(firstPhase).getByText(/hours/i), /minutes/i);
    fireEvent.change(within(firstPhase).getByDisplayValue(20), { target: { value: '50' } });
    fireEvent.change(within(firstPhase).getByDisplayValue('2'), { target: { value: '30' } });
    userEvent.click(screen.getByText(/Add a phase/i));
    const secondPhase = screen.getByText(/Phase 2/i).parentElement.parentElement.parentElement;
    await selectMaterialUiSelectOption(within(secondPhase).getByText(/hours/i), /days/i);
    expect(within(secondPhase).getByText(/Phases must have at least 1 device/i)).toBeTruthy();
    fireEvent.change(within(secondPhase).getByDisplayValue(10), { target: { value: '25' } });
    fireEvent.change(within(secondPhase).getByDisplayValue('2'), { target: { value: '25' } });
    userEvent.click(screen.getAllByText('Next')[0]);

    userEvent.click(screen.getByRole('checkbox', { name: /save as default/i }));
    await selectMaterialUiSelectOption(screen.getByText(/don't retry/i), 1);
    userEvent.click(screen.getAllByText('Next')[0]);

    // extra explicit here as the general date mocking seems to be ignored by the moment/ date combination
    jest.setSystemTime(mockDate);
    const post = jest.spyOn(GeneralApi, 'post');
    await act(async () => await userEvent.click(screen.getByText('Create')));
    const secondBatchDate = new Date(new Date(mockDate).setMinutes(mockDate.getMinutes() + 30));
    const thirdBatchDate = new Date(new Date(secondBatchDate).setDate(secondBatchDate.getDate() + 25));
    await jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(post).toHaveBeenCalledWith('/api/management/v1/deployments/deployments', {
      all_devices: true,
      artifact_name: defaultState.releases.byId.a1.Name,
      devices: undefined,
      filter_id: undefined,
      group: undefined,
      name: allDevices,
      phases: [
        { batch_size: 50, delay: 30, delayUnit: 'minutes', start_ts: mockDate.toISOString() },
        { batch_size: 25, delay: 25, delayUnit: 'days', start_ts: secondBatchDate.toISOString() },
        { batch_size: 25, start_ts: thirdBatchDate.toISOString() }
      ],
      retries: 1,
      update_control_map: undefined
    });
    expect(post).toHaveBeenCalledWith('/api/management/v1/useradm/settings', {
      '2fa': 'enabled',
      id_attribute: undefined,
      previousFilters: [],
      previousPhases: [[{ batch_size: 30, delay: 5, delayUnit: 'days' }, { batch_size: 70 }]],
      a1: {
        onboarding: {
          complete: false,
          demoArtifactPort: 85,
          progress: 'deployments-inprogress',
          showConnectDeviceDialog: false
        }
      }
    });
    await jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  }, 15000);
});
