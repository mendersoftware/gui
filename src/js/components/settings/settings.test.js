import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { render as testingLibRender } from '@testing-library/react';

import { defaultState, undefineds } from '../../../../tests/mockData';
import Settings from './settings';

const mockStore = configureStore([thunk]);

describe('Settings Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          isHosted: false,
          hasMultitenancy: true
        }
      },
      organization: {
        ...defaultState.organization,
        organization: {}
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = testingLibRender(
      <MemoryRouter initialEntries={['/settings/my-profile']}>
        <Provider store={store}>
          <Routes>
            <Route path="settings" element={<Settings />}>
              <Route path=":section" element={null} />
            </Route>
          </Routes>
        </Provider>
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
