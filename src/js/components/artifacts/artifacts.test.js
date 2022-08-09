import React from 'react';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import { getConfiguredStore } from '../../reducers';
import Artifacts from './artifacts';

const mockStore = configureStore([thunk]);

describe('Artifacts Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
    jest.mock(
      'react-virtualized-auto-sizer',
      () =>
        ({ children }) =>
          children({ height: 800, width: 390 })
    );
  });

  afterEach(() => {
    jest.unmock('react-virtualized-auto-sizer');
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Artifacts />
      </Provider>
    );
    act(() => jest.advanceTimersByTime(1000));
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const preloadedState = {
      ...defaultState,
      releases: {
        ...defaultState.releases,
        releasesList: {
          ...defaultState.releases.releasesList,
          visibleSection: {
            start: 1,
            end: 14
          }
        },
        selectedArtifact: defaultState.releases.byId.r1.Artifacts[0],
        selectedRelease: defaultState.releases.byId.r1.Name
      }
    };
    const store = getConfiguredStore({ preloadedState });
    const ui = (
      <Provider store={store}>
        <Artifacts />
      </Provider>
    );
    const { rerender } = render(ui);
    await act(async () => jest.advanceTimersByTime(1000));
    await waitFor(() => rerender(ui));
    expect(screen.queryByDisplayValue(defaultState.releases.byId.r1.Artifacts[0].description)).toBeInTheDocument();
    act(() => userEvent.click(screen.getByRole('button', { name: /Remove this artifact/i })));
    await waitFor(() => rerender(ui));
    act(() => userEvent.click(screen.getByRole('button', { name: /Cancel/i })));
    await waitFor(() => rerender(ui));
    const releaseRepoItem = document.body.querySelector('.release-repo');
    act(() => userEvent.click(within(releaseRepoItem).getByText(defaultState.releases.byId.r1.Name)));
    act(() => userEvent.click(screen.getByText(/Last modified/i)));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Filtered from/i)).not.toBeInTheDocument();
    act(() => userEvent.type(screen.getByPlaceholderText(/Filter/i), 'b1'));
    await act(async () => jest.advanceTimersByTime(1000));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Filtered from/i)).toBeInTheDocument();
  });
});
