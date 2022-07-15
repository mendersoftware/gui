import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import { render } from '../../../../../tests/setupTests';
import TroubleshootDialog from './troubleshootdialog';

const mockStore = configureStore([thunk]);

describe('TroubleshootDialog Component', () => {
  let store;
  let socketSpyFactory;
  const oldMatchMedia = window.matchMedia;

  beforeEach(() => {
    store = mockStore({ ...defaultState });
    socketSpyFactory = jest.spyOn(window, 'WebSocket');
    socketSpyFactory.mockImplementation(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      close: () => {},
      send: () => {}
    }));
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
    const userCapabilities = { canTroubleshoot: true, canWriteDevices: true };
    const { baseElement } = render(
      <Provider store={store}>
        <TroubleshootDialog device={defaultState.devices.byId.a1} onCancel={jest.fn} open={true} userCapabilities={userCapabilities} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
