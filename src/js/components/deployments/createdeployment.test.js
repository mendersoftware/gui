import React from 'react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { render, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateDeployment from './createdeployment';
import { defaultState, undefineds } from '../../../../tests/mockData';
import { selectMaterialUiSelectOption } from '../../../../tests/setupTests';

const mockStore = configureStore([thunk]);

describe('CreateDeployment Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.features,
          isEnterprise: false,
          isHosted: false
        }
      }
    });
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment open={true} deploymentObject={{}} />
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('allows navigating the dialog', () => {
    const submitCheck = jest.fn();
    render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment open={true} deploymentObject={{}} onScheduleSubmit={submitCheck} />
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
    expect(submitCheck).toHaveBeenCalledWith({
      deploymentDeviceCount: defaultState.devices.byStatus.accepted.total,
      deploymentDeviceIds: defaultState.devices.byStatus.accepted.deviceIds,
      device: null,
      filterId: undefined,
      group: 'All devices',
      phases: undefined,
      release: {
        Artifacts: [
          {
            description: 'test description',
            device_types_compatible: ['qemux86-64'],
            id: 'art1',
            modified: '2020-09-10T12:16:22.667Z',
            artifact_depends: { device_type: ['qemux86-64'] },
            artifact_provides: { artifact_name: 'myapp', 'data-partition.myapp.version': 'v2020.10', list_of_fancy: ['qemux86-64', 'x172'] },
            clears_artifact_provides: ['data-partition.myapp.*'],
            updates: [{ type_info: 'testtype' }]
          }
        ],
        device_types_compatible: ['qemux86-64'],
        Name: 'a1',
        metaData: {}
      },
      retries: undefined
    });
  });

  it('allows navigating the enterprise dialog', async () => {
    store = mockStore({
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
    });

    const submitCheck = jest.fn();
    render(
      <MemoryRouter>
        <Provider store={store}>
          <CreateDeployment open={true} deploymentObject={{}} onScheduleSubmit={submitCheck} />
        </Provider>
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
    userEvent.click(screen.getByText('Create'));
    expect(submitCheck).toHaveBeenCalledWith({
      deploymentDeviceCount: Object.keys(defaultState.devices.byId).length + 2,
      deploymentDeviceIds: [...Object.keys(defaultState.devices.byId), 'test1', 'test2'],
      device: null,
      filterId: undefined,
      group: 'All devices',
      phases: [{ batch_size: 50, delay: 30, delayUnit: 'minutes' }, { batch_size: 25, delay: 25, delayUnit: 'days' }, { batch_size: 25 }],
      release: {
        Artifacts: [
          {
            description: 'test description',
            device_types_compatible: ['qemux86-64'],
            id: 'art1',
            modified: '2020-09-10T12:16:22.667Z',
            artifact_depends: { device_type: ['qemux86-64'] },
            artifact_provides: { artifact_name: 'myapp', 'data-partition.myapp.version': 'v2020.10', list_of_fancy: ['qemux86-64', 'x172'] },
            updates: [{ type_info: 'testtype' }],
            clears_artifact_provides: ['data-partition.myapp.*']
          }
        ],
        Name: 'a1',
        device_types_compatible: ['qemux86-64'],
        metaData: {}
      },
      retries: 1
    });
  });
});
