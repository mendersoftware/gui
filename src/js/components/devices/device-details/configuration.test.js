import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import Configuration, { ConfigEditingActions, ConfigUpdateFailureActions, ConfigEmptyNote, ConfigUpdateNote, ConfigUpToDateNote } from './configuration';

describe('tiny components', () => {
  [ConfigEditingActions, ConfigUpdateFailureActions, ConfigUpdateNote, ConfigEmptyNote, ConfigUpToDateNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          isAccepted={true}
          isSetAsDefault={true}
          isUpdatingConfig={true}
          onCancel={jest.fn}
          onSetAsDefaultChange={jest.fn}
          onSubmit={jest.fn}
          setShowLog={jest.fn}
          updated_ts="testgroup"
        />
      );
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('Configuration Component', () => {
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Configuration
        device={{
          ...defaultState.devices.byId.a1,
          config: {
            configured: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
            reported: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
            updated_ts: '2019-01-01T09:25:00.000Z',
            reported_ts: '2019-01-01T09:25:01.000Z'
          }
        }}
        abortDeployment={jest.fn}
        applyDeviceConfig={jest.fn}
        getDeviceLog={jest.fn}
        getSingleDeployment={jest.fn}
        saveGlobalSettings={jest.fn}
        setDeviceConfig={jest.fn}
      />
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const applyMock = jest.fn().mockRejectedValueOnce().mockResolvedValueOnce({});
    const submitMock = jest.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({});
    let device = {
      ...defaultState.devices.byId.a1,
      config: {
        configured: {},
        reported: {},
        updated_ts: '2019-01-01T09:25:00.000Z',
        reported_ts: '2019-01-01T09:25:01.000Z'
      }
    };
    const ui = (
      <MemoryRouter>
        <Configuration
          device={device}
          abortDeployment={jest.fn}
          applyDeviceConfig={applyMock}
          getDeviceLog={jest.fn}
          getSingleDeployment={jest.fn}
          saveGlobalSettings={jest.fn}
          setDeviceConfig={submitMock}
        />
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    expect(screen.queryByRole('button', { name: /import configuration/i })).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByRole('button', { name: /import configuration/i })).toBeInTheDocument();
    expect(document.querySelector('.MuiFab-root')).toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(document.querySelector('.MuiFab-root')).not.toBeDisabled();
    userEvent.click(screen.getByRole('checkbox', { name: /save/i }));
    act(() => userEvent.click(screen.getByRole('button', { name: /save/i })));
    await act(() => waitFor(() => rerender(ui)));

    expect(screen.getByText(/Configuration could not be updated on device/i)).toBeInTheDocument();
    act(() => userEvent.click(screen.getByRole('button', { name: /Retry/i })));
    expect(submitMock).toHaveBeenLastCalledWith(defaultState.devices.byId.a1.id, { testKey: 'testValue' });
    expect(applyMock).toHaveBeenLastCalledWith(defaultState.devices.byId.a1.id, { testKey: 'testValue' }, true);
    device.config = {
      configured: { test: true, something: 'else', aNumber: 42 },
      reported: { test: true, something: 'else', aNumber: 42 },
      updated_ts: '2019-01-01T09:25:00.000Z',
      reported_ts: '2019-01-01T09:25:01.000Z'
    };
    await act(() =>
      waitFor(() =>
        rerender(
          <Configuration
            device={device}
            abortDeployment={jest.fn}
            applyDeviceConfig={applyMock}
            getDeviceLog={jest.fn}
            getSingleDeployment={jest.fn}
            saveGlobalSettings={jest.fn}
            setDeviceConfig={submitMock}
          />
        )
      )
    );
    act(() => userEvent.click(document.querySelector('.clickable .MuiIconButton-label')));
    expect(screen.getByText(/aNumber/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: /edit/i }));
    userEvent.type(screen.getByDisplayValue('something'), 'testKey');
    userEvent.type(screen.getByDisplayValue('else'), 'testValue');
    act(() => userEvent.click(screen.getByRole('button', { name: /Cancel/i })));
    expect(screen.queryByText(/key/i)).not.toBeInTheDocument();

    // userEvent.click(screen.getByRole('button', { name: /View log/i }));
    // expect(screen.queryByText(logContent)).toBeInTheDocument();
    // const logDialog = screen.getByText(/Config update log/i).parentElement.parentElement;
    // userEvent.click(within(logDialog).getByText(/Cancel/i));
  });
});
