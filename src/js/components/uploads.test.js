import React from 'react';
import { Provider } from 'react-redux';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../tests/mockData';
import { render } from '../../../tests/setupTests';
import Uploads from './uploads';

const mockStore = configureStore([thunk]);

describe('Uploads Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        uploadsById: {
          ...defaultState.app.uploadsById,
          test: {
            name: 'testfile',
            size: 2048,
            uploadProgress: 20
          }
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Uploads />
      </Provider>
    );
    userEvent.hover(screen.getByRole('progressbar'));
    await waitFor(() => screen.getByText(/in progress/i));
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
