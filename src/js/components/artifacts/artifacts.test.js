import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import Artifacts from './artifacts';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('Artifacts Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Artifacts />
        </Provider>
      </MemoryRouter>
    );
    act(() => jest.advanceTimersByTime(1000));
    const view = baseElement.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    store = mockStore({
      ...defaultState,
      releases: {
        ...defaultState.releases,
        selectedArtifact: defaultState.releases.byId.a1.Artifacts[0],
        selectedRelease: defaultState.releases.byId.a1.Name
      }
    });
    const ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Artifacts />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    act(() => userEvent.click(screen.getByRole('button', { name: /upload/i })));
    await waitFor(() => rerender(ui));
    act(() => userEvent.click(screen.getByRole('button', { name: /cancel/i })));
    act(() => jest.advanceTimersByTime(1000));
    await waitFor(() => rerender(ui));
    expect(screen.queryByDisplayValue(defaultState.releases.byId.a1.Artifacts[0].description)).toBeInTheDocument();
    act(() => userEvent.click(screen.getByRole('button', { name: /Remove this artifact/i })));
    await waitFor(() => rerender(ui));
    const releaseRepoItem = document.body.querySelector('.release-repo');
    act(() => userEvent.click(within(releaseRepoItem).getByText(defaultState.releases.byId.a1.Name)));
    act(() => userEvent.click(screen.getByText(/Last modified/i)));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Filtered from/i)).not.toBeInTheDocument();
    act(() => userEvent.type(screen.getByPlaceholderText(/Filter/i), 'b1'));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/Filtered from/i)).toBeInTheDocument();
    expect(document.body.querySelector('.repository-list > ul > div')).toBeFalsy();
    act(() => userEvent.clear(screen.getByPlaceholderText(/Filter/i)));
    await waitFor(() => rerender(ui));
    act(() => userEvent.type(screen.getByPlaceholderText(/Filter/i), defaultState.releases.byId.a1.Name));
    await waitFor(() => rerender(ui));
    expect(document.body.querySelector('.repository-list > ul > div')).toBeTruthy();
  });
});
