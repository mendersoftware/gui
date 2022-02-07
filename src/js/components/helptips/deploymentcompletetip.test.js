import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import DeploymentCompleteTip from './deploymentcompletetip';
import { defaultState, undefineds } from '../../../../tests/mockData';
import { render } from '../../../../tests/setupTests';

const mockStore = configureStore([thunk]);

describe('DeploymentCompleteTip Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });

  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <DeploymentCompleteTip targetUrl="https://test.com" />
      </Provider>
    );
    const view = baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
