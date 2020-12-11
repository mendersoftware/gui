import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
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
  });
});
