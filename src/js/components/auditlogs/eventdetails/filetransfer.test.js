import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { defaultState, undefineds } from '../../../../../tests/mockData';
import FileTransfer from './filetransfer';

const mockStore = configureStore([thunk]);

describe('FileTransfer Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <FileTransfer item={{ ...defaultState.organization.events[2], meta: { path: ['/dev/null'] } }} />
        </Provider>
      </MemoryRouter>
    );

    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
