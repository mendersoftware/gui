import React from 'react';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { LocalizationProvider } from '@mui/lab';
import AdapterMoment from '@mui/lab/AdapterMoment';

import Deployments from './deployments';
import GeneralApi from '../../api/general-api';
import { getConfiguredStore } from './../../reducers';
import { defaultState, mockDate, undefineds } from '../../../../tests/mockData';
import { render, selectMaterialUiSelectOption } from '../../../../tests/setupTests';
import { ALL_DEVICES } from '../../constants/deviceConstants';

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
    },
    releases: {
      ...defaultState.releases,
      releasesList: {
        ...defaultState.releases.releasesList,
        releaseIds: []
      }
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const store = mockStore(mockState);
    const { baseElement } = render(
      <Provider store={store}>
        <Deployments {...defaultLocationProps} />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
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
            ...defaultState.releases.byId.r1
          }
        }
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </LocalizationProvider>
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
    const inprogressDeployments = screen.getByText(/in progress now/i).parentElement.parentElement;
    const deployment = within(inprogressDeployments).getAllByText(/test deployment/i)[0].parentElement.parentElement;
    act(() => userEvent.click(within(deployment).getByRole('button', { name: /Abort/i })));
    jest.advanceTimersByTime(200);
    await waitFor(() => expect(screen.getByText(/Confirm abort/i)).toBeInTheDocument());
    await act(async () => userEvent.click(document.querySelector('#confirmAbort').nextElementSibling));
    await waitFor(() => expect(within(deployment).getByRole('button', { name: /View details/i })).toBeVisible());
    await act(async () => userEvent.click(within(deployment).getByRole('button', { name: /View details/i })));
    await waitFor(() => rerender(ui));
    if (!screen.queryByText(/Deployment details/i)) {
      await act(async () => userEvent.click(within(deployment).getByRole('button', { name: /View details/i })));
      await waitFor(() => expect(screen.queryByText(/Deployment details/i)).toBeInTheDocument());
    }
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
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </LocalizationProvider>
    );
    const { rerender } = render(ui);
    await act(async () => userEvent.click(screen.getByRole('tab', { name: /Finished/i })));
    await act(async () => userEvent.click(screen.getByRole('button', { name: /Create a deployment/i })));
    const releaseId = 'release-10';
    await waitFor(() => rerender(ui));
    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(screen.queryByPlaceholderText(/Select a Release/i)).toBeInTheDocument(), { timeout: 3000 });
    const releaseSelect = screen.getByPlaceholderText(/Select a Release/i);
    expect(within(releaseSelect).queryByDisplayValue(releaseId)).not.toBeInTheDocument();
    act(() => userEvent.click(releaseSelect));
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    jest.advanceTimersByTime(2000);
    const groupSelect = screen.getByPlaceholderText(/Select a device group/i);
    act(() => userEvent.click(groupSelect));
    fireEvent.keyDown(groupSelect, { key: 'Enter' });
    await waitFor(() => rerender(ui));
    expect(groupSelect).toHaveValue(ALL_DEVICES);
    act(() => userEvent.click(screen.getByRole('button', { name: 'Next' })));
    const post = jest.spyOn(GeneralApi, 'post');
    await act(async () => await userEvent.click(screen.getByRole('button', { name: 'Create' })));
    jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(post).toHaveBeenCalledWith('/api/management/v1/deployments/deployments', {
      all_devices: true,
      artifact_name: releaseId,
      devices: undefined,
      filter_id: undefined,
      group: undefined,
      name: ALL_DEVICES,
      phases: undefined,
      update_control_map: undefined
    });
    await jest.runAllTicks();
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  }, 20000);

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
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Provider store={store}>
          <Deployments {...defaultLocationProps} />
        </Provider>
      </LocalizationProvider>
    );
    const { rerender } = render(ui);
    await act(async () => userEvent.click(screen.getByRole('tab', { name: /Finished/i })));
    await act(async () => userEvent.click(screen.getByRole('button', { name: /Create a deployment/i })));
    const releaseId = 'release-10';
    jest.runAllTicks();
    jest.advanceTimersByTime(2000);
    await waitFor(() => rerender(ui));
    const groupSelect = screen.getByPlaceholderText(/Select a device group/i);
    act(() => userEvent.click(groupSelect));
    fireEvent.keyDown(groupSelect, { key: 'Enter' });
    expect(groupSelect).toHaveValue(ALL_DEVICES);
    await waitFor(() => expect(screen.queryByPlaceholderText(/Select a Release/i)).toBeInTheDocument(), { timeout: 3000 });
    const releaseSelect = screen.getByPlaceholderText(/Select a Release/i);
    act(() => userEvent.click(releaseSelect));
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    jest.advanceTimersByTime(2000);
    await waitFor(() => rerender(ui));
    act(() => userEvent.click(screen.getAllByText('Next')[0]));
    await selectMaterialUiSelectOption(screen.getByText(/Single phase: 100%/i), /Custom/i);
    const firstPhase = screen.getByText(/Phase 1/i).parentElement.parentElement.parentElement;
    await selectMaterialUiSelectOption(within(firstPhase).getByText(/hours/i), /minutes/i);
    fireEvent.change(within(firstPhase).getByDisplayValue(20), { target: { value: '50' } });
    fireEvent.change(within(firstPhase).getByDisplayValue('2'), { target: { value: '30' } });
    act(() => userEvent.click(screen.getByText(/Add a phase/i)));
    const secondPhase = screen.getByText(/Phase 2/i).parentElement.parentElement.parentElement;
    await selectMaterialUiSelectOption(within(secondPhase).getByText(/hours/i), /days/i);
    expect(within(secondPhase).getByText(/Phases must have at least 1 device/i)).toBeTruthy();
    fireEvent.change(within(secondPhase).getByDisplayValue(10), { target: { value: '25' } });
    fireEvent.change(within(secondPhase).getByDisplayValue('2'), { target: { value: '25' } });
    act(() => userEvent.click(screen.getAllByText('Next')[0]));

    act(() => userEvent.click(screen.getByRole('checkbox', { name: /save as default/i })));
    await selectMaterialUiSelectOption(screen.getByText(/don't retry/i), 1);
    act(() => userEvent.click(screen.getAllByText('Next')[0]));

    // extra explicit here as the general date mocking seems to be ignored by the moment/ date combination
    jest.setSystemTime(mockDate);
    const secondBatchDate = new Date(new Date(mockDate).setMinutes(mockDate.getMinutes() + 30));
    const thirdBatchDate = new Date(new Date(secondBatchDate).setDate(secondBatchDate.getDate() + 25));
    const post = jest.spyOn(GeneralApi, 'post');
    const creationButton = screen.getByText('Create');
    await act(async () => userEvent.click(creationButton));
    await waitFor(() => rerender(ui));
    expect(creationButton).toBeDisabled();
    jest.runAllTicks();
    jest.advanceTimersByTime(1000);
    await waitFor(() => rerender(ui));
    expect(post).toHaveBeenCalledWith('/api/management/v1/useradm/settings', {
      '2fa': 'enabled',
      a1: {
        onboarding: {
          complete: false,
          demoArtifactPort: 85,
          progress: 'deployments-past-completed',
          showConnectDeviceDialog: false
        }
      },
      id_attribute: undefined,
      previousFilters: [],
      previousPhases: [[{ batch_size: 30, delay: 5, delayUnit: 'days' }, { batch_size: 70 }]]
    });
    expect(post).toHaveBeenCalledWith('/api/management/v1/deployments/deployments', {
      all_devices: true,
      artifact_name: releaseId,
      devices: undefined,
      filter_id: undefined,
      group: undefined,
      name: ALL_DEVICES,
      phases: [
        { batch_size: 50, delay: 30, delayUnit: 'minutes', start_ts: mockDate.toISOString() },
        { batch_size: 25, delay: 25, delayUnit: 'days', start_ts: secondBatchDate.toISOString() },
        { batch_size: 25, start_ts: thirdBatchDate.toISOString() }
      ],
      retries: 1,
      update_control_map: undefined
    });
  }, 20000);
});
