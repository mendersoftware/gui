// Copyright 2019 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
import React from 'react';

import { act, waitFor } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
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
      <TerminalSession
        canReadDevices
        item={defaultState.organization.auditlog.events[2]}
        device={defaultState.devices.byId.a1}
        idAttribute="Device ID"
        getSessionDetails={detailsMock}
      />
    );
    const { baseElement, rerender } = render(ui);
    await waitFor(() => rerender(ui));
    act(() => jest.advanceTimersByTime(150));
    expect(detailsMock).toHaveBeenCalled();
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
