import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateDeployment, { CreateDialog, mapStateToProps } from './createdeployment';
import { defaultState, mockDate, undefineds } from '../../../../tests/mockData';
import { selectMaterialUiSelectOption } from '../../../../tests/setupTests';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;
  let mockState = {
    ...defaultState,
    app: {
      ...defaultState.app,
      features: {
        ...defaultState.features,
        isEnterprise: false,
        isHosted: false
      }
    }
  };

  beforeEach(() => {
    store = mockStore(mockState);
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment deploymentObject={{}} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows navigating the dialog', async () => {
    const props = mapStateToProps(mockState);
    const submitCheck = jest.fn();
    const advanceOnboarding = jest.fn();
    const createDeployment = jest.fn().mockResolvedValue();
    const saveGlobalSettings = jest.fn();
    render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDialog
            {...props}
            deploymentObject={{}}
            advanceOnboarding={advanceOnboarding}
            createDeployment={createDeployment}
            getAllDevicesByStatus={jest.fn}
            onScheduleSubmit={submitCheck}
            saveGlobalSettings={saveGlobalSettings}
            selectDevice={jest.fn}
            selectRelease={jest.fn}
          />
        </Provider>
      </MemoryRouter>
    );
    const releaseId = Object.keys(defaultState.releases.byId)[0];
    expect(screen.queryByText(releaseId)).not.toBeInTheDocument();
    const releaseSelect = screen.getByLabelText(/Select a Release to deploy/i);
    userEvent.click(releaseSelect);
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    expect(releaseSelect).toHaveValue(releaseId);
    const groupSelect = screen.getByLabelText(/Select a device group to deploy to/i);
    userEvent.click(groupSelect);
    fireEvent.keyDown(groupSelect, { key: 'Enter' });
    expect(groupSelect).toHaveValue('All devices');
    userEvent.click(screen.getAllByText('Next')[0]);
    userEvent.click(screen.getByText('Create'));
    expect(createDeployment).toHaveBeenCalledWith({
      all_devices: true,
      artifact_name: defaultState.releases.byId.a1.Name,
      devices: [],
      filter_id: undefined,
      group: undefined,
      name: 'All devices',
      phases: undefined,
      retries: undefined
    });
    await waitFor(() => expect(submitCheck).toHaveBeenCalled());
  });

  it('allows navigating the enterprise dialog', async () => {
    const mockState = {
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.features,
          isEnterprise: true,
          isHosted: false
        }
      },
      devices: {
        ...defaultState.devices,
        byStatus: {
          ...defaultState.devices.byStatus,
          accepted: {
            ...defaultState.devices.byStatus.accepted,
            deviceIds: [...Object.keys(defaultState.devices.byId), 'test1', 'test2'],
            total: Object.keys(defaultState.devices.byId).length + 2
          }
        }
      },
      organization: {
        ...defaultState.organization,
        organization: {
          ...defaultState.organization.organization,
          plan: 'enterprise'
        }
      },
      users: {
        ...defaultState.users,
        globalSettings: {
          ...defaultState.users.globalSettings,
          previousPhases: [[{ batch_size: 30, delay: 5, delayUnit: 'days' }, { batch_size: 70 }]]
        }
      }
    };

    const submitCheck = jest.fn();
    const advanceOnboarding = jest.fn();
    const createDeployment = jest.fn().mockResolvedValue();
    const saveGlobalSettings = jest.fn();

    const props = mapStateToProps(mockState);

    render(
      <MemoryRouter>
        <CreateDialog
          {...props}
          deploymentObject={{}}
          getAllDevicesByStatus={jest.fn}
          advanceOnboarding={advanceOnboarding}
          createDeployment={createDeployment}
          onScheduleSubmit={submitCheck}
          saveGlobalSettings={saveGlobalSettings}
          selectDevice={jest.fn}
          selectRelease={jest.fn}
        />
      </MemoryRouter>
    );
    const releaseId = Object.keys(defaultState.releases.byId)[0];
    expect(screen.queryByText(releaseId)).not.toBeInTheDocument();
    const releaseSelect = screen.getByLabelText(/Select a Release to deploy/i);
    userEvent.click(releaseSelect);
    fireEvent.keyDown(releaseSelect, { key: 'ArrowDown' });
    fireEvent.keyDown(releaseSelect, { key: 'Enter' });
    const groupSelect = screen.getByLabelText(/Select a device group to deploy to/i);
    userEvent.click(groupSelect);
    fireEvent.keyDown(groupSelect, { key: 'Enter' });
    userEvent.click(screen.getAllByText('Next')[0]);

    userEvent.click(screen.getByRole('checkbox', { name: /save as default/i }));
    await selectMaterialUiSelectOption(screen.getByText(/Retries/i), 1);
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

    // extra explicit here as the general date mocking seems to be ignored by the moment/ date combination
    jest.setSystemTime(mockDate);
    userEvent.click(screen.getByText('Create'));

    const secondBatchDate = new Date(new Date(mockDate).setMinutes(mockDate.getMinutes() + 30));
    const thirdBatchDate = new Date(new Date(secondBatchDate).setDate(secondBatchDate.getDate() + 25));
    expect(createDeployment).toHaveBeenCalledWith({
      all_devices: true,
      artifact_name: defaultState.releases.byId.a1.Name,
      devices: [],
      filter_id: undefined,
      group: undefined,
      name: 'All devices',
      phases: [
        { batch_size: 50, delay: 30, delayUnit: 'minutes', start_ts: mockDate },
        { batch_size: 25, delay: 25, delayUnit: 'days', start_ts: secondBatchDate.toISOString() },
        { batch_size: 25, start_ts: thirdBatchDate.toISOString() }
      ],
      retries: 1
    });
    expect(advanceOnboarding).toHaveBeenCalled();
    await waitFor(() => expect(submitCheck).toHaveBeenCalled());
    expect(saveGlobalSettings).toHaveBeenCalled();
  }, 15000);
});
