import React from 'react';
import { Provider } from 'react-redux';

import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { getConfiguredStore } from '../../reducers';
import Releases from './releases';

const mockStore = configureStore([thunk]);

describe('Releases Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Releases />
      </Provider>
    );
    await act(async () => jest.advanceTimersByTime(1000));
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const preloadedState = {
      ...defaultState,
      releases: {
        ...defaultState.releases,
        selectedArtifact: defaultState.releases.byId.r1.Artifacts[0],
        selectedRelease: defaultState.releases.byId.r1.Name
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <Provider store={store}>
        <Releases />
      </Provider>
    );
    const { rerender } = render(ui);
    await act(async () => jest.advanceTimersByTime(1000));
    await waitFor(() => rerender(ui));
    await user.click(screen.getAllByText(defaultState.releases.byId.r1.Name)[0]);
    expect(screen.queryByDisplayValue(defaultState.releases.byId.r1.Artifacts[0].description)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Remove this artifact/i }));
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => rerender(ui));
    await user.click(screen.getByRole('button', { name: /Close/i }));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Filtered from/i)).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Search/i), 'b1');
    await waitFor(() => rerender(ui));
    screen.debug(undefined, 20000);
    expect(screen.queryByText(/Filtered from/i)).toBeInTheDocument();
  });
});
