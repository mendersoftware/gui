import React from 'react';
import { Provider } from 'react-redux';

import { act, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';
import DeploymentCompleteTip from './deploymentcompletetip';

const mockStore = configureStore([thunk]);

describe('DeploymentCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const ui = (
      <Provider store={store}>
        <DeploymentCompleteTip targetUrl="https://test.com" />
      </Provider>
    );
    const { baseElement, rerender } = render(ui);
    await act(async () => {});
    await waitFor(() => rerender(ui));
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
