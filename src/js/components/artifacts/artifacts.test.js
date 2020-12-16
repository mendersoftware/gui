import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  });

  it('renders correctly', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Provider store={store}>
          <Artifacts />
        </Provider>
      </MemoryRouter>
    );

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
    render(
      <MemoryRouter>
        <Provider store={store}>
          <Artifacts />
        </Provider>
      </MemoryRouter>
    );

    userEvent.click(screen.getByRole('button', { name: /upload/i }));
    userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    waitFor(() => expect(screen.getByText(defaultState.releases.byId.a1.Artifacts[0].description)).toBeInTheDocument());
    userEvent.click(screen.getByRole('button', { name: /Remove this artifact/i }));
    const releaseRepoItem = document.body.querySelector('.release-repo');
    userEvent.click(within(releaseRepoItem).getByText(defaultState.releases.byId.a1.Name));
    userEvent.click(screen.getByText(/Last modified/i));

    expect(screen.queryByText(/Filtered from/i)).not.toBeInTheDocument();
    userEvent.type(screen.getByPlaceholderText(/Filter/i), 'b1');
    expect(screen.queryByText(/Filtered from/i)).toBeInTheDocument();
    expect(document.body.querySelector('.repository-list > ul > div')).toBeFalsy();
    userEvent.clear(screen.getByPlaceholderText(/Filter/i));
    userEvent.type(screen.getByPlaceholderText(/Filter/i), defaultState.releases.byId.a1.Name);
    expect(document.body.querySelector('.repository-list > ul > div')).toBeTruthy();
  });
});
