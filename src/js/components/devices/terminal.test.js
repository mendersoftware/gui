import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import TerminalDialog from './terminal';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('TerminalDialog Component', () => {
  let store;
  let socketSpyFactory;
  let socketSpy;

  beforeEach(() => {
    store = mockStore({ ...defaultState });
    socketSpyFactory = jest.spyOn(window, 'WebSocket');
    socketSpyFactory.mockImplementation(() => {
      socketSpy = {
        close: () => {},
        send: () => {}
      };
      return socketSpy;
    });
  });

  afterEach(() => {
    socketSpyFactory.mockReset();
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <TerminalDialog onCancel={jest.fn} onSocketClose={jest.fn} open={true} />
      </Provider>
    );
    const view = baseElement.getElementsByClassName('MuiDialog-root')[0];
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
