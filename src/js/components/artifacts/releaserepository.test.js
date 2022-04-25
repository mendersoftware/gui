import React from 'react';
import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ReleaseRepository from './releaserepository';
import { defaultState, undefineds } from '../../../../tests/mockData';

const mockStore = configureStore([thunk]);

describe('ReleaseRepository Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      releases: {
        ...defaultState.releases,
        byId: {}
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <ReleaseRepository artifacts={[]} />
      </Provider>
    );
    act(() => jest.advanceTimersByTime(1000));
    const view = baseElement.lastChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
