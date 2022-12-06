import React from 'react';
import { Provider } from 'react-redux';

import { screen, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import Global from './global';

const mockStore = configureStore([thunk]);

describe('GlobalSettings Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      ...defaultState,
      app: {
        ...defaultState.app,
        features: {
          ...defaultState.app.features,
          hasReporting: true,
          hasMultitenancy: true,
          isEnterprise: true,
          isHosted: true
        }
      },
      deployments: {
        ...defaultState.deployments,
        config: {
          ...defaultState.deployments.config,
          binaryDelta: {
            ...defaultState.deployments.config.binaryDelta,
            timeout: 5
          },
          hasDelta: true
        }
      }
    });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Global />
      </Provider>
    );
    await waitFor(() => expect(screen.getByText(/xDelta3/i)).toBeVisible());
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
