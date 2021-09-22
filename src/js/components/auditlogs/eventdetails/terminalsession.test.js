import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import { TerminalSession } from './terminalsession';

describe('TerminalSession Component', () => {
  let socketSpyFactory;
  let socketSpy;
  const oldMatchMedia = window.matchMedia;

  beforeEach(() => {
    socketSpyFactory = jest.spyOn(window, 'WebSocket');
    socketSpyFactory.mockImplementation(() => {
      socketSpy = {
        close: () => {},
        send: () => {}
      };
      return socketSpy;
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    });
  });

  afterEach(() => {
    socketSpyFactory.mockReset();
    window.matchMedia = oldMatchMedia;
  });

  it('renders correctly', async () => {
    const detailsMock = jest.fn();
    detailsMock.mockResolvedValue({ start: defaultState.organization.auditlog.events[2].time, end: defaultState.organization.auditlog.events[1].time });
    const ui = (
      <MemoryRouter>
        <TerminalSession
          item={defaultState.organization.auditlog.events[2]}
          device={defaultState.devices.byId.a1}
          idAttribute="Device ID"
          getSessionDetails={detailsMock}
        />
      </MemoryRouter>
    );
    const { baseElement, rerender } = render(ui);
    await waitFor(() => rerender(ui));
    jest.advanceTimersByTime(150);
    expect(detailsMock).toHaveBeenCalled();
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
